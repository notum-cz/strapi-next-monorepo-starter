# docs-changelog workflow

## Phase 1 — Resolve arguments and state

Parse `$ARGUMENTS` for these flags:

| Flag                     | Default                     | Purpose                                  |
| ------------------------ | --------------------------- | ---------------------------------------- |
| `--since=<sha\|date>`    | from marker or `7 days ago` | Start of commit range                    |
| `--period=daily\|weekly` | `weekly`                    | Heading format in changelog              |
| `--changelog-only`       | off                         | Skip docs audit                          |
| `--audit-only`           | off                         | Skip changelog generation                |
| `--dry-run`              | off                         | Print report only, don't write any files |

**Read state:** try to read `.claude/skills/docs-changelog/last-run.json`. If it exists and `--since` was not explicitly passed, use `lastCommitSha` as the range start. Otherwise fall back to `--since="7 days ago"`.

Verify you're inside a git repository. Determine the current branch.

## Phase 2 — Collect and categorize commits

Run the bundled script:

```bash
bash .claude/skills/docs-changelog/scripts/collect-commits.sh --since=<resolved-since> --format=json
```

The script outputs a JSON array of commits, each with:

```json
{
  "hash": "...",
  "shortHash": "...",
  "subject": "...",
  "type": "feat|fix|chore|...",
  "scope": "ui|strapi|...",
  "description": "human-readable description",
  "category": "Added|Fixed|Changed|Dependencies|Infrastructure|Documentation|Security|Reverted",
  "ticket": "#428",
  "author": "...",
  "date": "..."
}
```

If the result is empty (no new commits), print "No new commits since last run" and stop.

Count commits by category for the summary.

## Phase 3 — Generate changelog entry

Skip if `--audit-only`.

### 3a. Build the entry

Group commits by `category`. Within each group, format as:

```markdown
### Added

- **ui:** Update favicon files and enhance icon metadata ([#428](https://github.com/notum-cz/strapi-next-monorepo-starter/pull/428), [`3a44a52`](https://github.com/notum-cz/strapi-next-monorepo-starter/commit/3a44a52))
- **strapi:** Rate-limit users-permissions auth endpoints ([#359](https://github.com/notum-cz/strapi-next-monorepo-starter/pull/359), [`18bddb1`](https://github.com/notum-cz/strapi-next-monorepo-starter/commit/18bddb1))

### Fixed

- **ui:** Stop pinning one local Strapi host and breaking the other ([#426](https://github.com/notum-cz/strapi-next-monorepo-starter/pull/426), [`68aee23`](https://github.com/notum-cz/strapi-next-monorepo-starter/commit/68aee23))
```

Rules:

- Capitalize the first letter of the description.
- Bold the scope as a prefix: `**scope:**` — omit if empty.
- Link the short hash in backticks to `https://github.com/notum-cz/strapi-next-monorepo-starter/commit/<hash>`.
- When `ticket` is set (the squash-merge `(#N)` suffix), also link it to `https://github.com/notum-cz/strapi-next-monorepo-starter/pull/<N>`.
- Omit categories with zero entries.
- Order categories: Added → Changed → Fixed → Security → Reverted → Dependencies → Infrastructure → Documentation.

### 3b. Wrap in a period heading

For `--period=daily`:

```markdown
## 2026-08-04
```

For `--period=weekly`:

```markdown
## 2026-08-04 (Week 32)
```

### 3c. Check the changelog page

Read `apps/docs/docs/reference/changelog.md` if it exists, and drop any commits whose short hash already appears there. If it does not exist, the first apply (Phase 6) creates it with this header:

```markdown
---
sidebar_position: 9
---

# Changelog

Auto-generated from [Conventional Commits](https://www.conventionalcommits.org/) by the `docs-changelog` skill.
```

The entry is prepended **after** the header block (after the `# Changelog` paragraph and any blank lines, before the first `## ` heading or end of file).

### 3d. Output

- If `--dry-run`: print the changelog entry to chat. Do not write files.
- Otherwise: write the entry alone to `.claude/skills/docs-changelog/last-changelog-draft.md`. Do **not** edit `apps/docs/docs/reference/changelog.md` in place — it is applied in a `/start-work` worktree (Phase 6), so the working branch stays clean.

## Phase 4 — Docs audit

Skip if `--changelog-only`.

### 4a. Get changed files

```bash
git diff --name-status <since-sha>..HEAD
```

If `--since` was a date rather than a SHA, use:

```bash
git log --since="<date>" --format="%H" --reverse | head -1
```

to find the starting SHA, then diff from there.

Collect the set of changed code files and the set of changed doc files (paths under `apps/docs/docs/`).

### 4b. Layer 1 — Code-to-Docs Map

Read `.claude/skills/docs-changelog/references/code-to-docs-map.json`.

For each key (code path) in the map:

1. Check if any changed code file matches (starts with) that path.
2. If yes, check if any of the mapped doc pages appear in the changed doc files. A mapped value ending in `/` is a directory — any changed doc under it counts.
3. If no matching doc change was found, record a finding:
   `"<code-path> was modified but no changes found in <doc-page(s)>"`

### 4c. Layer 2 — Commit Scope Analysis

From the Phase 2 commit data, collect all unique scopes of `feat` commits. For each scope:

- `ui` → check if any doc under `ui/` or `page-builder/` changed
- `strapi` → check if any doc under `strapi/` or `page-builder/` changed
- `docs` → skip (the commit is itself a docs change)
- no scope, or a scope not listed here (e.g. `global`) → check if any doc under `apps/docs/docs/` changed

If a scope produced features but no related docs changed, record a finding.

Only flag `feat` commits (new features are most likely to need docs). Skip `fix` — bug fixes rarely need doc updates.

### 4d. Layer 3 — Environment Variable Detection

Scan the diff output for:

- New `process.env.` references (lines starting with `+`)
- New entries in `.env.example` or `.env.local.example` files
- Commit bodies containing `env.VARIABLE_NAME` patterns

For each detected env var, check if it appears in:

- `apps/docs/docs/ui/environment-variables.md`
- `apps/docs/docs/strapi/environment-variables.md`

Flag any undocumented new env vars.

### 4e. Layer 4 — Structural Checks

For each doc file that was modified in the commit range:

- Read the file.
- Extract backticked file paths (e.g., `` `apps/ui/src/lib/foo.ts` ``).
- Verify each referenced path exists on disk using Glob.
- Extract internal doc links (e.g., `[Link](../reference/packages/overview.md)`).
- Verify each linked doc file exists.

Record findings for broken references.

### 4f. Compile audit report

Format findings as a numbered list grouped by layer:

```markdown
# Docs Audit Report — 2026-08-04

## Documentation gaps (Code-to-Docs Map)

1. `apps/ui/cache-handler.mjs` was modified but no changes in `ui/caching.md` or `reference/integrations/redis.md`

## Missing environment variable docs

2. New env var `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` not documented in `ui/environment-variables.md`

## Broken references in modified docs

3. `reference/workflow.md` references `scripts/validate-branch-sh` which does not exist

## Summary

- 2 documentation gaps
- 1 undocumented env var
- 1 broken reference
```

Write to `.claude/skills/docs-changelog/last-audit.md`.

## Phase 5 — Update state

Write `.claude/skills/docs-changelog/last-run.json`:

```json
{
  "lastCommitSha": "<HEAD SHA>",
  "lastRunDate": "<current ISO timestamp>",
  "branch": "<current branch>"
}
```

Skip this write if `--dry-run`.

## Phase 6 — Report and suggest

Print the full report to chat:

1. **Period summary**: date range, branch, commit count by category.
2. **Changelog draft** (if not `--audit-only`): the formatted entry from Phase 3.
3. **Audit findings** (if not `--changelog-only`): the report from Phase 4.
4. **Next steps**:

```
To apply the changelog:
1. Run `/start-work` to create a worktree
2. The changelog draft is saved at .claude/skills/docs-changelog/last-changelog-draft.md
3. Copy it into apps/docs/docs/reference/changelog.md (prepend after the header)
4. Address any audit findings in the same branch
5. Commit and open a PR
```

## Scheduling (future)

This skill can be invoked by a Claude Code scheduled routine:

```bash
# Weekly on Monday mornings
/schedule create --cron "23 9 * * 1" --name "docs-changelog-weekly" \
  --prompt "Run /docs-changelog --period=weekly on dev."
```

The routine output serves as the report. Setting up the schedule is a manual follow-up step after the skill is tested.
