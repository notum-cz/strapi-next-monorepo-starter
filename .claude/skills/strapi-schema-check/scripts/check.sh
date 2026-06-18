#!/usr/bin/env bash
set -euo pipefail

# Strapi schema migration safety check.
#
# Compares apps/strapi/**/schema.json against a base branch and flags
# risky changes (rename, delete, type change, tightened constraint) that
# require a DB migration. Looks for matching migration files under
# apps/strapi/database/migrations/.
#
# Migration matching is scoped: a migration file counts as a match for a
# finding only if it references BOTH the attribute name (camelCase OR
# snake_case form) AND the collection identifier (collectionName,
# singularName, or snake_case variants) — in the filename or body. This
# avoids false positives from generic attr names ("name", "slug",
# "description") matching unrelated migrations. ALL matching migrations
# are reported, not just the first.
#
# Output: by default, Markdown summary on stdout (human format).
#         Pass --format json for the programmatic JSON array on stdout.
#         Stderr always carries a one-line summary plus per-finding lines.
# Exit codes:
#   0 — no risky changes
#   1 — risky changes WITHOUT migration (BLOCK)
#   2 — risky changes WITH matching migration (warn only)
#   3 — internal failure (jq error, invalid args, git failure)
#
# Compatible with bash 3.2 (macOS default) — no mapfile, no associative arrays.

BASE_BRANCH="main"
FORMAT="human"
while [ $# -gt 0 ]; do
  case "$1" in
    --format)
      if [ $# -lt 2 ]; then
        echo "ERROR: --format requires a value (human|json)" >&2
        exit 3
      fi
      FORMAT="$2"
      shift 2
      ;;
    --format=*)
      FORMAT="${1#--format=}"
      shift
      ;;
    --json)
      FORMAT="json"
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [base-branch] [--format human|json]" >&2
      exit 0
      ;;
    *)
      BASE_BRANCH="$1"
      shift
      ;;
  esac
done

case "${FORMAT}" in
  human|json) ;;
  *)
    echo "ERROR: --format must be 'human' or 'json' (got '${FORMAT}')" >&2
    exit 3
    ;;
esac

# Escape a string for safe use inside a grep ERE pattern.
re_escape() { printf '%s' "$1" | sed 's/[][\.*^$/]/\\&/g'; }

# Convert camelCase / PascalCase to snake_case (e.g. areaOfExpertise -> area_of_expertise).
# Also lowercases. Idempotent on already-snake input.
to_snake_case() {
  printf '%s' "$1" \
    | sed -E 's/([a-z0-9])([A-Z])/\1_\2/g; s/([A-Z]+)([A-Z][a-z])/\1_\2/g' \
    | tr '[:upper:]' '[:lower:]'
}

# Convert kebab-case to snake_case (blog-author -> blog_author).
kebab_to_snake() { printf '%s' "$1" | tr '-' '_'; }

# Emit the "no findings" form for the active format.
emit_empty() {
  if [ "${FORMAT}" = "json" ]; then
    echo "[]"
  else
    echo "Strapi schema check: no risky changes."
  fi
}

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"

if [ -z "${REPO_ROOT}" ]; then
  echo "ERROR: not inside a git repository" >&2
  exit 3
fi

cd "${REPO_ROOT}"

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required for strapi-schema-check" >&2
  exit 3
fi

# Resolve base branch: try literal, then origin/<base>, else fail.
if git rev-parse --verify "${BASE_BRANCH}" >/dev/null 2>&1; then
  :
elif git rev-parse --verify "origin/${BASE_BRANCH}" >/dev/null 2>&1; then
  BASE_BRANCH="origin/${BASE_BRANCH}"
else
  echo "ERROR: base branch '${BASE_BRANCH}' not found locally or on origin" >&2
  exit 3
fi

MIGRATIONS_DIR="apps/strapi/database/migrations"

# Collect migration files into a newline-separated list.
MIGRATION_FILES=""
if [ -d "${MIGRATIONS_DIR}" ]; then
  MIGRATION_FILES="$(find "${MIGRATIONS_DIR}" -type f \( -name '*.js' -o -name '*.ts' -o -name '*.sql' \) 2>/dev/null || true)"
fi

# Per-process tmpfile for capturing git diff stderr (race-safe vs hardcoded /tmp path).
GIT_ERR_TMP="$(mktemp -t strapi-check-git-err.XXXXXX)"
cleanup_tmp() { rm -f "${GIT_ERR_TMP}"; }
trap cleanup_tmp EXIT

# Find changed schema files vs base. Distinguish git failure from empty diff.
GIT_DIFF_ERR=""
if ! CHANGED_LIST="$(git diff --name-only "${BASE_BRANCH}...HEAD" -- \
  'apps/strapi/src/api/**/schema.json' \
  'apps/strapi/src/components/**/*.json' 2>"${GIT_ERR_TMP}")"; then
  GIT_DIFF_ERR="$(cat "${GIT_ERR_TMP}" 2>/dev/null || true)"
  echo "ERROR: git diff failed: ${GIT_DIFF_ERR}" >&2
  exit 3
fi

# Files deleted between base and HEAD (whole content type drop = severe).
if ! DELETED_LIST="$(git diff --name-only --diff-filter=D "${BASE_BRANCH}...HEAD" -- \
  'apps/strapi/src/api/**/schema.json' \
  'apps/strapi/src/components/**/*.json' 2>"${GIT_ERR_TMP}")"; then
  GIT_DIFF_ERR="$(cat "${GIT_ERR_TMP}" 2>/dev/null || true)"
  echo "ERROR: git diff (deleted) failed: ${GIT_DIFF_ERR}" >&2
  exit 3
fi

if [ -z "${CHANGED_LIST}" ] && [ -z "${DELETED_LIST}" ]; then
  emit_empty
  exit 0
fi

# Collect ALL migration files matching both an attribute pattern AND a
# collection pattern (each is an ERE alternation). A file matches a pattern
# if either its basename or its body contains the pattern (case-insensitive).
#
# Args: $1 = attribute ERE pattern (may be empty to skip attr scope)
#       $2 = collection ERE pattern (may be empty to skip collection scope)
# At least one of $1/$2 must be non-empty; otherwise returns 1 immediately.
#
# On hit: populates MATCHED_MIGRATION_FILES (newline-separated, no trailing
# newline) and returns 0. On miss: clears it and returns 1.
MATCHED_MIGRATION_FILES=""
migration_matches_scoped() {
  local attr_pat="$1" coll_pat="$2"
  MATCHED_MIGRATION_FILES=""
  [ -z "${MIGRATION_FILES}" ] && return 1
  [ -z "${attr_pat}" ] && [ -z "${coll_pat}" ] && return 1

  local f base body matches=""
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    base="$(basename "$f")"
    body="$(cat "$f" 2>/dev/null || true)"
    local hay="${base}"$'\n'"${body}"

    # Attribute scope (skip check when pattern empty).
    if [ -n "${attr_pat}" ]; then
      printf '%s' "${hay}" | grep -qiE "${attr_pat}" || continue
    fi
    # Collection scope (skip check when pattern empty).
    if [ -n "${coll_pat}" ]; then
      printf '%s' "${hay}" | grep -qiE "${coll_pat}" || continue
    fi

    matches="${matches}${f}
"
  done <<EOF
${MIGRATION_FILES}
EOF

  if [ -n "${matches}" ]; then
    # Strip trailing newline.
    MATCHED_MIGRATION_FILES="${matches%
}"
    return 0
  fi
  return 1
}

# Build an ERE alternation from a space-separated list of raw tokens.
# Empty tokens are skipped. Each token is regex-escaped and snake_case
# variants are added automatically. Returns empty string if no tokens.
build_token_pat() {
  local pat="" sep="" raw seen=""
  for raw in "$@"; do
    [ -z "${raw}" ] && continue
    # Add the raw token (regex-escaped) plus its snake_case variant.
    local snake camel
    camel="$(re_escape "${raw}")"
    snake="$(re_escape "$(to_snake_case "${raw}")")"
    # kebab → snake variant (only differs if input had hyphens).
    local kebab_snake
    kebab_snake="$(re_escape "$(kebab_to_snake "${raw}")")"

    for tok in "${camel}" "${snake}" "${kebab_snake}"; do
      [ -z "${tok}" ] && continue
      case "|${seen}|" in
        *"|${tok}|"*) continue ;;
      esac
      seen="${seen}|${tok}"
      pat="${pat}${sep}${tok}"
      sep="|"
    done
  done
  if [ -z "${pat}" ]; then
    printf ''
  else
    printf '(%s)' "${pat}"
  fi
}

FINDINGS_JSON="[]"
HAS_RISKY_NO_MIG=0
HAS_RISKY_WITH_MIG=0

# add_finding severity file attr change hasMig migPathsNL desc suggest
# migPathsNL = newline-separated paths (may be empty).
add_finding() {
  local severity="$1" file="$2" attr="$3" change="$4" hasMig="$5" migPathsNL="$6" desc="$7" suggest="$8"
  # Build JSON array from newline-separated paths.
  local pathsJson
  if [ -z "${migPathsNL}" ]; then
    pathsJson="[]"
  else
    pathsJson="$(printf '%s\n' "${migPathsNL}" | jq -R . | jq -s .)"
  fi
  local next
  if ! next=$(jq -c \
    --arg severity "$severity" \
    --arg file "$file" \
    --arg attribute "$attr" \
    --arg change "$change" \
    --argjson hasMigration "$hasMig" \
    --argjson migrationPaths "$pathsJson" \
    --arg description "$desc" \
    --arg suggestion "$suggest" \
    '. + [{
      severity: $severity,
      category: "strapi-schema",
      file: $file,
      attribute: $attribute,
      change: $change,
      hasMigration: $hasMigration,
      migrationPaths: $migrationPaths,
      description: $description,
      suggestion: $suggestion
    }]' <<<"${FINDINGS_JSON}"); then
    echo "ERROR: jq failed while appending finding for ${file}::${attr}" >&2
    exit 3
  fi
  FINDINGS_JSON="$next"
}

# Build a collection-scope pattern from a schema's metadata.
# Args: $1 = schema JSON; sets COLLECTION (display) and COLL_PAT (ERE).
set_collection_scope() {
  local json="$1"
  COLLECTION="$(jq -r '.collectionName // .info.singularName // ""' <<<"${json}" 2>/dev/null || echo '')"
  local singular plural
  singular="$(jq -r '.info.singularName // ""' <<<"${json}" 2>/dev/null || echo '')"
  plural="$(jq -r '.info.pluralName // ""' <<<"${json}" 2>/dev/null || echo '')"
  COLL_PAT="$(build_token_pat "${COLLECTION}" "${singular}" "${plural}")"
}

# Whole-file deletions: schema.json removed = content type dropped.
while IFS= read -r DEL_FILE; do
  [ -z "${DEL_FILE}" ] && continue
  OLD_JSON="$(git show "${BASE_BRANCH}:${DEL_FILE}" 2>/dev/null || true)"
  if [ -z "${OLD_JSON}" ]; then continue; fi
  set_collection_scope "${OLD_JSON}"
  # Whole-CT drop: collection scope only (no attr). Also include filepath as a fallback token.
  FILE_PAT="$(build_token_pat "${DEL_FILE}")"
  # Combine file path + collection tokens into one pattern (ERE alternation across all).
  COMBINED_PAT="${COLL_PAT}"
  if [ -n "${FILE_PAT}" ]; then
    if [ -n "${COMBINED_PAT}" ]; then
      # Merge: strip outer parens, OR-join, re-wrap.
      INNER_A="${COMBINED_PAT#(}"; INNER_A="${INNER_A%)}"
      INNER_B="${FILE_PAT#(}";    INNER_B="${INNER_B%)}"
      COMBINED_PAT="(${INNER_A}|${INNER_B})"
    else
      COMBINED_PAT="${FILE_PAT}"
    fi
  fi
  if migration_matches_scoped "" "${COMBINED_PAT}"; then
    HAS_RISKY_WITH_MIG=1
    add_finding "critical" "${DEL_FILE}" "${COLLECTION:-<file>}" "schema-deleted" true "${MATCHED_MIGRATION_FILES}" \
      "Schema file deleted (content type dropped). Migration file(s) reference it — verify drop intent and data archival." \
      "Confirm migration archives data before DROP TABLE, or that table drop is intentional."
  else
    HAS_RISKY_NO_MIG=1
    add_finding "critical" "${DEL_FILE}" "${COLLECTION:-<file>}" "schema-deleted" false "" \
      "Schema file deleted without migration. Strapi will DROP TABLE on boot — FULL DATA LOSS." \
      "Add ${MIGRATIONS_DIR}/<ts>_drop_${COLLECTION:-table}.js (archive first if data is meaningful)."
  fi
done <<EOF
${DELETED_LIST}
EOF

# Loop changed files (modifications + additions).
while IFS= read -r SCHEMA_FILE; do
  [ -z "${SCHEMA_FILE}" ] && continue

  # Skip files already handled in the deletion loop above.
  if [ -n "${DELETED_LIST}" ] && printf '%s\n' "${DELETED_LIST}" | grep -Fxq "${SCHEMA_FILE}"; then
    continue
  fi

  OLD_JSON="$(git show "${BASE_BRANCH}:${SCHEMA_FILE}" 2>/dev/null || true)"
  NEW_JSON="$(cat "${SCHEMA_FILE}" 2>/dev/null || true)"

  if [ -z "${OLD_JSON}" ] || [ -z "${NEW_JSON}" ]; then
    continue
  fi

  set_collection_scope "${NEW_JSON}"

  # Build "diff" via jq: list of operations describing per-attribute change.
  # Output one JSON object per line: {op, key, ...}
  if ! DIFF="$(jq -c -n \
    --argjson old "$(jq -c '.attributes // {}' <<<"${OLD_JSON}")" \
    --argjson new "$(jq -c '.attributes // {}' <<<"${NEW_JSON}")" \
    '
    def shape(a): {type: (a.type // ""), required: (a.required // false), unique: (a.unique // false)};
    ($old | keys_unsorted) as $oldKeys |
    ($new | keys_unsorted) as $newKeys |
    ($oldKeys - $newKeys) as $removed |
    ($newKeys - $oldKeys) as $added |
    [ $removed[] as $r
      | ($added | map(select(shape($new[.]) == shape($old[$r])))[0]) as $match
      | if $match != null then {op:"renamed", from:$r, to:$match} else {op:"deleted", key:$r} end
    ] as $rd |
    [ $oldKeys[] as $k
      | select(($newKeys | index($k)) != null)
      | shape($old[$k]) as $os
      | shape($new[$k]) as $ns
      | (if $os.type != $ns.type then {op:"type_changed", key:$k, oldType:$os.type, newType:$ns.type} else empty end),
        (if ($os.required == false and $ns.required == true) then {op:"required_added", key:$k} else empty end),
        (if ($os.unique == false and $ns.unique == true) then {op:"unique_added", key:$k} else empty end)
    ] as $retained |
    ($rd + $retained)[]
    ')"; then
    echo "ERROR: jq failed while diffing attributes for ${SCHEMA_FILE}" >&2
    exit 3
  fi

  while IFS= read -r LINE; do
    [ -z "${LINE}" ] && continue
    OP="$(jq -r '.op' <<<"${LINE}")"

    case "${OP}" in
      renamed)
        FROM_K="$(jq -r '.from' <<<"${LINE}")"
        TO_K="$(jq -r '.to' <<<"${LINE}")"
        ATTR_PAT="$(build_token_pat "${FROM_K}" "${TO_K}")"
        if migration_matches_scoped "${ATTR_PAT}" "${COLL_PAT}"; then
          HAS_RISKY_WITH_MIG=1
          add_finding "critical" "${SCHEMA_FILE}" "${TO_K}" "renamed-from:${FROM_K}" true "${MATCHED_MIGRATION_FILES}" \
            "Field renamed from \`${FROM_K}\` to \`${TO_K}\`. Migration file(s) reference it — verify they ALTER the column rather than dropping/recreating." \
            "Confirm migration uses ALTER TABLE ... RENAME COLUMN."
        else
          HAS_RISKY_NO_MIG=1
          add_finding "critical" "${SCHEMA_FILE}" "${TO_K}" "renamed-from:${FROM_K}" false "" \
            "Field renamed from \`${FROM_K}\` to \`${TO_K}\` without migration. Strapi will drop \`${FROM_K}\` and create empty \`${TO_K}\` — DATA LOSS." \
            "Add ${MIGRATIONS_DIR}/<ts>_rename_${COLLECTION:-table}_${FROM_K}.js that performs ALTER TABLE ... RENAME COLUMN."
        fi
        ;;
      deleted)
        K="$(jq -r '.key' <<<"${LINE}")"
        ATTR_PAT="$(build_token_pat "${K}")"
        if migration_matches_scoped "${ATTR_PAT}" "${COLL_PAT}"; then
          HAS_RISKY_WITH_MIG=1
          add_finding "critical" "${SCHEMA_FILE}" "${K}" "deleted" true "${MATCHED_MIGRATION_FILES}" \
            "Field \`${K}\` deleted. Migration file(s) reference it — verify intent (archive vs. drop)." \
            "Confirm migration archives or intentionally drops the column."
        else
          HAS_RISKY_NO_MIG=1
          add_finding "critical" "${SCHEMA_FILE}" "${K}" "deleted" false "" \
            "Field \`${K}\` deleted without migration. Strapi will drop the column — DATA LOSS." \
            "Add ${MIGRATIONS_DIR}/<ts>_drop_${COLLECTION:-table}_${K}.js (archive first if data is meaningful)."
        fi
        ;;
      type_changed)
        K="$(jq -r '.key' <<<"${LINE}")"
        OT="$(jq -r '.oldType' <<<"${LINE}")"
        NT="$(jq -r '.newType' <<<"${LINE}")"
        ATTR_PAT="$(build_token_pat "${K}")"
        if migration_matches_scoped "${ATTR_PAT}" "${COLL_PAT}"; then
          HAS_RISKY_WITH_MIG=1
          add_finding "critical" "${SCHEMA_FILE}" "${K}" "type-changed:${OT}->${NT}" true "${MATCHED_MIGRATION_FILES}" \
            "Type of \`${K}\` changed from \`${OT}\` to \`${NT}\`. Migration file(s) reference it — verify safe cast." \
            "Confirm migration converts existing values to the new type."
        else
          HAS_RISKY_NO_MIG=1
          add_finding "critical" "${SCHEMA_FILE}" "${K}" "type-changed:${OT}->${NT}" false "" \
            "Type of \`${K}\` changed from \`${OT}\` to \`${NT}\` without migration. Strapi may drop+recreate the column — DATA LOSS risk." \
            "Add ${MIGRATIONS_DIR}/<ts>_alter_${COLLECTION:-table}_${K}_type.js that ALTERs/casts the column."
        fi
        ;;
      required_added)
        K="$(jq -r '.key' <<<"${LINE}")"
        ATTR_PAT="$(build_token_pat "${K}")"
        if migration_matches_scoped "${ATTR_PAT}" "${COLL_PAT}"; then
          HAS_RISKY_WITH_MIG=1
          add_finding "critical" "${SCHEMA_FILE}" "${K}" "constraint-tightened:required" true "${MATCHED_MIGRATION_FILES}" \
            "\`required: true\` added to \`${K}\`. Migration file(s) reference it — verify backfill." \
            "Confirm migration backfills NULL rows before the constraint."
        else
          HAS_RISKY_NO_MIG=1
          add_finding "critical" "${SCHEMA_FILE}" "${K}" "constraint-tightened:required" false "" \
            "\`required: true\` added to \`${K}\` without migration. Strapi boot will fail if any existing row has NULL." \
            "Add migration that backfills nulls in \`${K}\` before applying the constraint."
        fi
        ;;
      unique_added)
        K="$(jq -r '.key' <<<"${LINE}")"
        ATTR_PAT="$(build_token_pat "${K}")"
        if migration_matches_scoped "${ATTR_PAT}" "${COLL_PAT}"; then
          HAS_RISKY_WITH_MIG=1
          add_finding "critical" "${SCHEMA_FILE}" "${K}" "constraint-tightened:unique" true "${MATCHED_MIGRATION_FILES}" \
            "\`unique: true\` added to \`${K}\`. Migration file(s) reference it — verify dedupe." \
            "Confirm migration deduplicates before applying the constraint."
        else
          HAS_RISKY_NO_MIG=1
          add_finding "critical" "${SCHEMA_FILE}" "${K}" "constraint-tightened:unique" false "" \
            "\`unique: true\` added to \`${K}\` without migration. Boot will fail if duplicates exist." \
            "Add migration that deduplicates \`${K}\` before applying the constraint."
        fi
        ;;
    esac
  done <<EOF
${DIFF}
EOF
done <<EOF
${CHANGED_LIST}
EOF

if [ "${HAS_RISKY_NO_MIG}" -eq 1 ]; then
  EXIT_CODE=1
elif [ "${HAS_RISKY_WITH_MIG}" -eq 1 ]; then
  EXIT_CODE=2
else
  EXIT_CODE=0
fi

COUNT=$(jq 'length' <<<"${FINDINGS_JSON}")
echo "strapi-schema-check: ${COUNT} finding(s) (exit ${EXIT_CODE})" >&2
if [ "${COUNT}" -gt 0 ]; then
  jq -r '.[] | "  [\(.severity)] \(.file) :: \(.attribute) — \(.change) (migrations: \(.migrationPaths | length))"' <<<"${FINDINGS_JSON}" >&2
fi

if [ "${FORMAT}" = "json" ]; then
  echo "${FINDINGS_JSON}"
else
  if [ "${COUNT}" -eq 0 ]; then
    emit_empty
  else
    if [ "${EXIT_CODE}" -eq 1 ]; then
      echo "### Strapi Schema Migration Check — ${COUNT} risky change(s) without migration"
    else
      echo "### Strapi Schema Migration Check — ${COUNT} risky change(s) (migrations present)"
    fi
    echo
    jq -r '
      .[] |
      "- **[" + .severity + "]** `" + .file + "` — `" + .attribute + "` (" + .change + ")\n" +
      "  - " + .description + "\n" +
      "  - Suggestion: " + .suggestion +
      (if .hasMigration and ((.migrationPaths | length) > 0) then
        "\n  - Migrations referenced (" + (.migrationPaths | length | tostring) + "):" +
        (.migrationPaths | map("\n    - `" + . + "`") | add)
      else "" end)
    ' <<<"${FINDINGS_JSON}"
  fi
fi
exit ${EXIT_CODE}
