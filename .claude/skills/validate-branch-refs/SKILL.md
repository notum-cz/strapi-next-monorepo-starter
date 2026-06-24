---
name: validate-branch-refs
description: 'Use when checking a branch for drift before merge — references or claims a diff left stale: renamed/moved paths, removed exports, changed signatures, dropped env vars, dead doc links, outdated commands or version/port numbers. Triggers: "validate references", "check stale refs", "validate branch", "fix outdated docs", "/validate-branch-refs". Compares current branch vs base (default `dev`) and writes fixes.'
argument-hint: "[base-branch] [--dry-run] [--scope=docs|code|all] [--no-questions]"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - Agent
---

<objective>
Detect drift between the current branch and a base (default `dev`): find references in the working tree to anything the diff changed — renamed/moved paths, deleted or renamed exports, changed signatures, removed env vars, dead links, outdated commands — and fix them. Then validate factual claims the diff did NOT touch but may still be wrong (e.g. a doc says `port 3000` but config now says `4000`).

This skill writes edits — it is not read-only. Use `--dry-run` to preview.
</objective>

<arguments>
Parse `$ARGUMENTS` literally; a flag is active only if its token appears.

- First non-flag token → base branch (default `dev`).
- `--dry-run` → report only; no writes, no commits.
- `--scope=docs|code|all` → limit the reference scan. `docs` = `*.md`/`*.mdx`/`README*`/`CHANGELOG*`; `code` = everything else; `all` = default.
- `--no-questions` → never prompt; log ambiguous findings as UNRESOLVED and continue.
  </arguments>

<preconditions>
1. `git rev-parse --is-inside-work-tree` is `true`, else abort.
2. `git rev-parse --verify <base>` succeeds (try `origin/<base>`; if still missing, ask for the base).
3. If `git status --porcelain` is non-empty and not `--dry-run`, warn that uncommitted edits will mix with skill edits and ask whether to continue.
4. `MERGE_BASE=$(git merge-base HEAD <base>)` — all diffs use `${MERGE_BASE}..HEAD`.
</preconditions>

<process>

## Phase 1 — Inventory the diff

In parallel:

- `git diff --name-status ${MERGE_BASE}..HEAD` → classify each path (A / D / M / R→rename / C).
- `git diff ${MERGE_BASE}..HEAD -- '*.json' '*.yaml' '*.yml' '*.toml' '*.env*'` → config drift.
- `git log ${MERGE_BASE}..HEAD --format='%H %s'` → commit context.

Build a table: `change_type | old_path | new_path | symbols_removed | symbols_renamed | values_changed`. For modified source files, pull removed/renamed top-level symbols from `git diff -U0` (lines matching `^-(export|function|class|const|type|interface)`, language-aware: ts/tsx/js/jsx/py/go/rs/rb). For config files, diff changed keys (`jq` for JSON, plain diff otherwise).

## Phase 2 — Reference scan

For each inventory row, `git grep -nI` the **current tree** (skips binaries, respects `.gitignore`) for:

- **Paths** — old path, basename, and extensionless form.
- **Symbols** — removed/renamed identifiers, word-boundary matched.
- **Config values** — old values of changed keys (env names, ports, URLs, versions).
- **Commands** — if `package.json` scripts / `Makefile` targets changed, their old names in docs.
- **Links** — for renamed docs, old relative links and anchor slugs.

Exclude the changed files themselves and `node_modules/`, `dist/`, `build/`, `.next/`, `coverage/`, `.git/`. Honor `--scope`.

## Phase 3 — Classify each hit

Produce findings: `id | file:line | reference | inventory_row | proposed_fix | confidence`.

- **high** — unambiguous rename/move, or a symbol renamed with a single definition.
- **medium** — a similarly-named symbol still exists, or multiple move candidates match.
- **low** — a Phase 4 claim that maps to no diff row.

## Phase 4 — Claim validation (independent of the diff)

Scan docs (`README*`, `docs/**`, `*.md`, `*.mdx`) for claims regardless of the diff:

- backticked file paths → exist on disk?
- repo-internal anchors → anchor exists?
- env vars (`process.env.X`, `${X}`, bash fences) → defined somewhere (`.env.example`, config, code)?
- `pnpm` / `npm run` / `yarn` scripts → exist in the nearest `package.json`?
- ports, version pins → match config/package files?
- quoted signatures or types → symbol still has that shape?

Each failure is a low-confidence finding.

## Phase 5 — Resolution

In confidence order (high → medium → low):

- **high**, not `--dry-run` → apply `Edit` and log it.
- **medium / low** → `AskUserQuestion` with file:line, the reference, candidate fixes, and Skip / "mark UNRESOLVED" / "intentional" options. Under `--no-questions`, mark UNRESOLVED.

Batch related questions (same symbol or renamed path) into one `multiSelect` call. Cap at **8** `AskUserQuestion` calls per run; mark the remainder UNRESOLVED.

## Phase 6 — Report

Write `.claude/skills/validate-branch-refs/last-run.md` (only add it to `.gitignore` on explicit user opt-in) with the inventory table, per-finding outcome (APPLIED / SKIPPED / UNRESOLVED + reason), and counts. Then print a compact chat summary:

```text
Branch: <head> vs <base> (merge-base <short-sha>)
Inventory: <n> files (<A>A <D>D <M>M <R>R)
Findings: <total> (high <h>, medium <m>, low <l>)
Outcome: applied <a>, skipped <s>, unresolved <u>
Report: .claude/skills/validate-branch-refs/last-run.md
```

Never auto-commit — the user reviews and commits.
</process>

<safety>
- Edit only — never delete files, never push or touch the base branch.
- A fix that would change semantics (not just a reference) → downgrade to medium and ask.
- If a target file is already user-modified (`git status`), ask before stacking an edit on it.
- On any `git` failure, surface stderr and abort the phase — don't continue silently.
- On failure, report the error clearly and leave no half-applied edits.
</safety>

<delegation>
If the inventory exceeds ~50 changed files or the scan yields ~200+ hits, delegate Phases 2–3 to a `general-purpose` subagent (inventory table embedded in the prompt; it returns the findings table). Keep Phase 5 resolution on the main thread to preserve `AskUserQuestion` control.
</delegation>
