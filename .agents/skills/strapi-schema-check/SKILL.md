---
name: strapi-schema-check
description: >
  Flag risky Strapi v5 schema changes (rename, delete, type change,
  tightened constraint) that need a database migration. Run before
  opening a PR that touches `apps/strapi/src/api/**/schema.json` or
  `apps/strapi/src/components/**/*.json`. Triggers on: "strapi schema",
  "schema check", "strapi migration", "check schema", "did I break the
  schema", or any diff that includes schema.json under apps/strapi.
  Default base branch: `main`.
argument-hint: "[base-branch] [--format human|json]"
paths:
  - apps/strapi/src/api/**/schema.json
  - apps/strapi/src/components/**/*.json
---

# Strapi Schema Check

Detects risky Strapi v5 schema changes that require a database migration. Strapi v5 auto-syncs `schema.json` to PostgreSQL on boot. Renaming, deleting, or retyping a field is interpreted as **drop + create** → **data loss in production**.

## When to run

- **Auto-load:** any diff in `apps/strapi/src/api/**/schema.json` or `apps/strapi/src/components/**/*.json` vs the base branch.
- **Manual:** invoke the bundled script — `bash .agents/skills/strapi-schema-check/scripts/check.sh [base-branch]` (default base: `main`).
- **Called by:** `review-pr` (blocks at review time), `fix-issue` (surfaces schema impact during planning).

## How to run

Single bash invocation:

```bash
bash .agents/skills/strapi-schema-check/scripts/check.sh [base-branch] [--format human|json]
```

- `base-branch` — defaults to `main`. Falls back to `origin/<base>` if local ref missing.
- `--format human` (default) — Markdown summary on stdout, paste-ready for review reports.
- `--format json` — JSON array on stdout for programmatic callers.
- Stderr always carries a one-line summary plus per-finding lines.

### Exit codes

| Code | Meaning |
|---|---|
| `0` | No risky changes |
| `1` | Risky changes **without** migration — **BLOCK** |
| `2` | Risky changes **with** matching migration — review, do not auto-pass |
| `3` | Internal failure (jq missing, git error, invalid args) |

## Detection algorithm

1. Resolve base branch (literal → `origin/<base>` → error).
2. `git diff --name-only <base>...HEAD` for `schema.json` files.
3. For each changed file, fetch old version via `git show <base>:<path>`, parse via `jq`.
4. Compare `attributes` keys + per-attribute `{type, required, unique}` shape:
   - **added** — safe (Strapi handles additive)
   - **renamed** — risky (key-pair heuristic on identical shape)
   - **deleted** — risky
   - **type-changed** — risky
   - **required: true added** — risky
   - **unique: true added** — risky
   - **whole schema file deleted** — risky (content type dropped)
5. For each risky change, scan `apps/strapi/database/migrations/**/*.{js,ts,sql}` for files matching **both** the attribute pattern (camelCase + snake_case + kebab→snake) **and** the collection scope (`collectionName`, `info.singularName`, `info.pluralName`).
6. Report all matched migrations (not just first). Exit code reflects worst case.

## Risk classification

| Change | Severity | Required action |
|---|---|---|
| Field added | none | None — Strapi handles additive sync |
| Field renamed | critical | Migration with `ALTER TABLE ... RENAME COLUMN` |
| Field deleted | critical | Migration that drops or archives data; confirm intentional |
| Field type changed | critical | Migration that converts/casts data |
| `required: true` added | critical | Backfill NULL rows before constraint |
| `unique: true` added | critical | Deduplicate before constraint |
| Schema file deleted (table dropped) | critical | Archive + DROP TABLE; confirm intentional |
| `collectionName` renamed | not detected v1 | Manual review |
| Cross-content-type field move | not detected v1 | Treat as delete + add, write data-migration |

## Output

### `--format human` (default)

Markdown block intended to paste verbatim into review reports:

```
### Strapi Schema Migration Check — 1 risky change(s) without migration

- **[critical]** `apps/strapi/src/api/blog/content-types/blog/schema.json` — `title` (renamed-from:heading)
  - Field renamed from `heading` to `title` without migration. Strapi will drop `heading` and create empty `title` — DATA LOSS.
  - Suggestion: Add apps/strapi/database/migrations/<ts>_rename_blog_heading.js that performs ALTER TABLE ... RENAME COLUMN.
```

When no risky changes: single line `Strapi schema check: no risky changes.`

### `--format json`

JSON array, one entry per risky change:

```json
[
  {
    "severity": "critical",
    "category": "strapi-schema",
    "file": "apps/strapi/src/api/blog/content-types/blog/schema.json",
    "attribute": "publishedAt",
    "change": "renamed-from:publishDate",
    "hasMigration": false,
    "migrationPaths": [],
    "description": "Field renamed without migration. Strapi will drop `publishDate` and create empty `publishedAt`.",
    "suggestion": "Add apps/strapi/database/migrations/<ts>_rename_blog_publishDate.js that performs ALTER TABLE blog RENAME COLUMN publish_date TO published_at."
  }
]
```

`migrationPaths` is always an array. When `hasMigration: true`, lists every migration file whose filename or body matches **both** the attribute scope (camelCase or snake_case form) **and** the collection scope. Empty array when `hasMigration: false`. **Severity stays `critical`** even with a matching migration — exit code 2 distinguishes "migration present, verify it" from exit 1 "missing migration".

## Interactive use

When invoked manually:

1. Run the script.
2. Print findings (already formatted).
3. If exit code 1, ask: **"Found N risky schema change(s) without migration. Want a migration scaffold? (y/n)"**
4. If `y`, print a knex template (do not write the file — user saves it themselves):

```js
// apps/strapi/database/migrations/<unix-ts>_<desc>.js
'use strict';

module.exports = {
  async up(knex) {
    // e.g. await knex.schema.alterTable('blogs', (t) => t.renameColumn('publish_date', 'published_at'));
  },
  async down(knex) {
    // reverse of up
  },
};
```

The check is unconditional: no escape-hatch flag, no PR-description marker. If a risky change must ship and migration is handled out-of-band, add a stub migration file referencing the affected attribute + collection — that downgrades exit 1 → exit 2, but every finding still renders as `critical`. A human reviewer must verify.

## Limitations (v1)

- **Rename heuristic requires identical shape.** Removed + added attributes must share `type`, `required`, `unique`. Renaming `heading: string` → `title: text` is reported as `deleted` + `added`, not `renamed`. Split across two commits or treat both findings as the rename.
- **Cross-content-type renames not detected.** Moving a field from `blog` to `article` = delete on one, add on the other. Treat as delete + data-migration.
- **Stub migration acknowledges, does not validate.** A migration that mentions both attribute and collection makes exit 2, but the script cannot check correctness — reviewer must.
- **Collection / content-type directory renames out of scope.** Manual review.
- **Migration match is substring, not semantic.** Filename or body mentions attribute + collection (case-insensitive). Treat exit 2 as "migration *might* exist — verify".
- **Acknowledge stubs must reference both attribute and collection.** Bare attribute mention without collection name won't match. Include snake_case table (`blog_authors`) plus camelCase or snake_case attribute.

## Reference: Strapi v5 schema → DB sync

Strapi v5 reads `schema.json` at boot and reconciles the DB schema by:

- Adding new columns for new attributes (safe).
- **Dropping columns whose attribute key was removed or renamed** (data loss).
- **Recreating columns whose `type` changed** when conversion is unsafe (data loss).
- Failing boot if `required`/`unique` constraints are violated by existing rows.

Migrations are run by Strapi during boot via knex. The starter's `apps/strapi/database/migrations/` dir is the canonical location.

## See also

- `apps/strapi/database/migrations/` — migration directory
- `.agents/skills/strapi-schema-check/scripts/check.sh` — detection script
