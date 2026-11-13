#!/usr/bin/env bash
# collect-commits.sh — Parse git log, categorize conventional commits, output JSON.
#
# Usage:
#   bash .claude/skills/docs-changelog/scripts/collect-commits.sh [OPTIONS]
#
# Options:
#   --since=<sha|date>   Start of the range (commit SHA or date like "7 days ago")
#   --until=<sha>        End of the range (default: HEAD)
#   --branch=<name>      Branch to scan (default: current branch)
#   --format=json        Output format (only json supported)
#
# Output: JSON array of categorized commits to stdout.

set -euo pipefail

SINCE=""
UNTIL="HEAD"
BRANCH=""
FORMAT="json"

for arg in "$@"; do
  case "$arg" in
    --since=*)  SINCE="${arg#--since=}" ;;
    --until=*)  UNTIL="${arg#--until=}" ;;
    --branch=*) BRANCH="${arg#--branch=}" ;;
    --format=*) FORMAT="${arg#--format=}" ;;
    *)          echo "Unknown argument: $arg" >&2; exit 1 ;;
  esac
done

# Determine the commit range
if [ -n "$SINCE" ]; then
  # Check if SINCE looks like a SHA (hex, 7+ chars)
  if echo "$SINCE" | grep -qE '^[0-9a-f]{7,40}$'; then
    RANGE="${SINCE}..${UNTIL}"
  else
    # Treat as a date expression for git
    RANGE_ARGS="--since=${SINCE}"
  fi
fi

# Build git log command
GIT_CMD=(git log)

if [ -n "$BRANCH" ]; then
  GIT_CMD+=("$BRANCH")
fi

if [ -n "${RANGE:-}" ]; then
  GIT_CMD+=("$RANGE")
elif [ -n "${RANGE_ARGS:-}" ]; then
  GIT_CMD+=("$RANGE_ARGS")
fi

# Skip GitHub merge commits ("Merge pull request #N", "Merge branch ...") — they duplicate the merged work
GIT_CMD+=(--no-merges --format=$'%H\x1f%h\x1f%s\x1f%an\x1f%aI')

# Collect all commits
COMMITS=""
while IFS= read -r line; do
  [ -z "$line" ] && continue
  COMMITS+="${line}"$'\n'
done < <("${GIT_CMD[@]}" 2>/dev/null || true)

# Parse conventional commit subject into type, scope, description
# Pattern: type(scope): description  OR  type: description  OR  freeform
parse_commit() {
  local subject="$1"
  local type scope description ticket

  # Extract the GitHub squash-merge PR number suffix, e.g. "feat(ui): foo (#428)"
  ticket=$(echo "$subject" | grep -oE '\(#[0-9]+\)$' | tr -d '()' || true)
  local clean_subject
  clean_subject=$(echo "$subject" | sed -E 's/ *\(#[0-9]+\)$//')
  # Older history has capitalized types ("Feat: ...") and breaking markers ("feat!:")
  clean_subject=$(echo "$clean_subject" | sed -E 's/^([A-Za-z]+(\([^)]+\))?)!: /\1: /')

  # Try conventional commit with scope: type(scope): description
  if echo "$clean_subject" | grep -qE '^[A-Za-z]+\([^)]+\): '; then
    type=$(echo "$clean_subject" | sed -E 's/^([A-Za-z]+)\(.*/\1/' | tr '[:upper:]' '[:lower:]')
    scope=$(echo "$clean_subject" | sed -E 's/^[A-Za-z]+\(([^)]+)\).*/\1/')
    description=$(echo "$clean_subject" | sed -E 's/^[A-Za-z]+\([^)]+\): //')
  # Try conventional commit without scope: type: description
  elif echo "$clean_subject" | grep -qE '^[A-Za-z]+: '; then
    type=$(echo "$clean_subject" | sed -E 's/^([A-Za-z]+):.*/\1/' | tr '[:upper:]' '[:lower:]')
    scope=""
    description=$(echo "$clean_subject" | sed -E 's/^[A-Za-z]+: //')
  # Freeform — try to infer type
  else
    description="$clean_subject"
    scope=""
    # Infer type from keywords
    if echo "$clean_subject" | grep -qiE '^(update|bump|pin) (dep|depend|node|pnpm)'; then
      type="chore"
      scope="deps"
    elif echo "$clean_subject" | grep -qiE '(deploy|pipeline|ci|job)'; then
      type="ci"
    else
      type="chore"
    fi
  fi

  # Map type to changelog category
  local category
  # Dependabot uses both chore(deps) and ci(deps) in this repo
  if echo "$scope" | grep -qiE '^dep'; then
    category="Dependencies"
  else
  case "$type" in
    feat)     category="Added" ;;
    fix)      category="Fixed" ;;
    refactor) category="Changed" ;;
    perf)     category="Changed" ;;
    docs)     category="Documentation" ;;
    ci)       category="Infrastructure" ;;
    build)    category="Infrastructure" ;;
    revert)   category="Reverted" ;;
    security) category="Security" ;;
    test)     category="Omitted" ;;
    chore)
      # Sub-categorize chore commits
      if echo "$scope" | grep -qiE '^dep'; then
        category="Dependencies"
      elif echo "$description" | grep -qiE '(deploy|pipeline|ci|docker|job)'; then
        category="Infrastructure"
      else
        category="Infrastructure"
      fi
      ;;
    *)        category="Changed" ;;
  esac
  fi

  printf '%s\x1f%s\x1f%s\x1f%s\x1f%s\n' "$type" "$scope" "$description" "$category" "$ticket"
}

# Build JSON output
echo "["
first=true
while IFS= read -r line; do
  [ -z "$line" ] && continue

  hash=$(echo "$line" | cut -d$'\x1f' -f1)
  short=$(echo "$line" | cut -d$'\x1f' -f2)
  subject=$(echo "$line" | cut -d$'\x1f' -f3)
  author=$(echo "$line" | cut -d$'\x1f' -f4)
  date=$(echo "$line" | cut -d$'\x1f' -f5)

  parsed=$(parse_commit "$subject")
  type=$(echo "$parsed" | cut -d$'\x1f' -f1)
  scope=$(echo "$parsed" | cut -d$'\x1f' -f2)
  description=$(echo "$parsed" | cut -d$'\x1f' -f3)
  category=$(echo "$parsed" | cut -d$'\x1f' -f4)
  ticket=$(echo "$parsed" | cut -d$'\x1f' -f5)

  # Skip test-only commits
  if [ "$category" = "Omitted" ]; then
    continue
  fi

  # Escape JSON strings
  description=$(echo "$description" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')
  subject=$(echo "$subject" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')

  if [ "$first" = true ]; then
    first=false
  else
    echo ","
  fi

  cat <<ENTRY
  {
    "hash": "$hash",
    "shortHash": "$short",
    "subject": "$subject",
    "type": "$type",
    "scope": "$scope",
    "description": "$description",
    "category": "$category",
    "ticket": "$ticket",
    "author": "$author",
    "date": "$date"
  }
ENTRY

done <<< "$COMMITS"

echo ""
echo "]"
