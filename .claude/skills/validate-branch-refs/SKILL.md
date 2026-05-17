---
name: validate-branch-refs
description: "Analyze current branch vs base (default `dev`). Update stale references (paths, symbols, links, commands) and validate factual claims in docs/comments/configs. Ask user when ambiguous."
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
Detect drift between the current branch and a base branch (default `dev`). Find every reference in the working tree that points to something the diff changed — renamed files, moved paths, deleted exports, changed signatures, removed env vars, dead URLs, outdated commands — and fix it. Then validate factual claims that the diff did NOT touch but might still be wrong (e.g. doc says `port 3000` but config now says `4000`).

The skill writes edits. It is NOT read-only. Use `--dry-run` to preview without writing.
</objective>

<arguments>
Parse `$ARGUMENTS` literally. Tokens:

- First non-flag positional token → base branch. Default `dev` if absent.
- `--dry-run` → report findings only. No file writes. No commits.
- `--scope=docs` → restrict reference scan to docs (`*.md`, `*.mdx`, `docs/`, `README*`, `CHANGELOG*`).
- `--scope=code` → restrict reference scan to code files (exclude docs).
- `--scope=all` → default. Scan everything tracked by git.
- `--no-questions` → never invoke AskUserQuestion. On ambiguity, log finding as UNRESOLVED and continue.

Flag is active only if its literal token appears in `$ARGUMENTS`.
</arguments>

<preconditions>
1. Run `git rev-parse --is-inside-work-tree` → must be `true`. Abort if not.
2. Run `git rev-parse --verify <base>` → must succeed. If missing, try `origin/<base>`; if also missing, ask user for correct base.
3. Run `git status --porcelain` → if non-empty AND not `--dry-run`, warn user and ask whether to continue (uncommitted edits will mix with skill edits).
4. Resolve merge base: `MERGE_BASE=$(git merge-base HEAD <base>)`. All diffs use `${MERGE_BASE}..HEAD`.
</preconditions>

<process>

## Phase 1 — Inventory the diff

Run all in parallel:

- `git diff --name-status ${MERGE_BASE}..HEAD` → classify each path: `A` added, `D` deleted, `M` modified, `R<score>` renamed (old→new), `C` copied.
- `git diff ${MERGE_BASE}..HEAD -- '*.json' '*.yaml' '*.yml' '*.toml' '*.env*'` → config drift.
- `git log ${MERGE_BASE}..HEAD --format='%H %s'` → commit subjects for narrative context.

Build a structured table:

| change_type | old_path | new_path | symbols_removed | symbols_renamed | values_changed |

For modified source files, extract removed/renamed top-level symbols with `git diff -U0 ${MERGE_BASE}..HEAD -- <file>` and grep for `^-export `, `^-function `, `^-class `, `^-const `, `^-type `, `^-interface ` patterns (language-aware: ts/tsx/js/jsx/py/go/rs/rb).

For config files, extract changed keys with structural diff (`jq` for JSON, plain diff for YAML/TOML/env).

## Phase 2 — Reference scan

For each row in the inventory, search the **current tree** (HEAD state, not pre-change) for references:

- **Path refs** — old_path string, basename, and path without extension. Use `git grep -nI -- '<pattern>'` (skips binaries, respects .gitignore).
- **Symbol refs** — removed/renamed identifier names. Disambiguate with word boundaries.
- **Config values** — old value of changed keys (env var names, port numbers, URLs, version strings).
- **Command refs** — if `package.json` scripts or `Makefile` targets changed, grep docs for old script names.
- **URL/link refs** — for renamed docs, scan for old relative links and old anchor slugs.

Exclude the changed files themselves and any path inside `node_modules/`, `dist/`, `build/`, `.next/`, `coverage/`, `.git/`.

Honor `--scope` filter.

## Phase 3 — Classify each hit

For every grep hit produce a finding:

| id | file:line | reference | inventory_row | proposed_fix | confidence |

Confidence rules:

- **high** — exact rename with single target. Path move with no ambiguity. Symbol renamed in same file with no other definition.
- **medium** — symbol removed but a similarly-named one exists; path moved but multiple candidates match.
- **low** — claim-validation finding (Phase 4) that doesn't map to a diff row.

## Phase 4 — Claim validation (orthogonal to diff)

Scan docs (`README*`, `docs/**`, `*.md`, `*.mdx`) for factual claims regardless of whether they appear in the diff. Patterns to extract:

- File paths in backticks → verify exist on disk.
- URLs to repo-internal anchors → verify anchor exists.
- Env var names in `process.env.X` / `${X}` / fenced bash blocks → verify defined somewhere (`.env.example`, config schemas, code).
- Commands `pnpm <script>` / `npm run <script>` / `yarn <script>` → verify script exists in nearest `package.json`.
- Port numbers, version pins → verify against config/package files.
- Code fences that quote signatures or types → verify symbol still exists with that shape.

Each failed claim becomes a low-confidence finding.

## Phase 5 — Resolution

For each finding in order of confidence (high → medium → low):

- **high + not --dry-run** → apply `Edit`. Track edit in run log.
- **medium** → ask user via `AskUserQuestion` unless `--no-questions`. Present file:line, reference, candidate fixes, and "Skip" / "Mark UNRESOLVED" options. If `--no-questions`, mark UNRESOLVED.
- **low** → ask user with proposed fix and "Skip" / "It's intentional" options. If `--no-questions`, mark UNRESOLVED.

Batch related questions: same symbol or same renamed path → one AskUserQuestion call with multiSelect.

Hard cap: **8** AskUserQuestion invocations per run. After cap, mark remainder UNRESOLVED.

## Phase 6 — Report

Write `.claude/skills/validate-branch-refs/last-run.md` (gitignored if `.gitignore` already excludes `.claude/skills/*/last-run.md`; otherwise add to `.gitignore` only on explicit user opt-in) with:

- Inventory table (Phase 1)
- Per-finding outcome: APPLIED / SKIPPED / UNRESOLVED with reason
- Counts by confidence and outcome
- List of remaining UNRESOLVED items with file:line

Print compact summary to chat:

```
Branch: <head> vs <base> (merge-base <short-sha>)
Inventory: <n> files changed (<A>A <D>D <M>M <R>R)
Findings: <total> (high <h>, medium <m>, low <l>)
Outcome: applied <a>, skipped <s>, unresolved <u>
Report: .claude/skills/validate-branch-refs/last-run.md
```

Do NOT auto-commit. User reviews and commits manually.
</process>

<safety>
- Never delete files. Edit only.
- Never rewrite the base branch or push. Local edits only.
- If a proposed fix would change semantics (not just rename a reference), downgrade to medium and ask.
- If `git status` shows the file is already modified by the user, ask before stacking another edit on it.
- Respect `.gitignore` for both scanning and writing.
- On any `git` command failure, abort the phase and surface stderr — don't silently continue.
</safety>

<delegation>
If the inventory exceeds ~50 changed files OR the reference scan yields ~200+ hits, delegate Phase 2+3 to a subagent (general-purpose) with the inventory table embedded in the prompt. Subagent returns the findings table. Main thread keeps Phase 5 resolution to preserve AskUserQuestion control.
</delegation>

<output_contract>
On success: report file written, chat summary printed, working tree contains edits (unless --dry-run).
On failure: clear error in chat, no partial edits left behind (use a single-commit dry-run-then-apply pattern when possible — stage edits with `git add -N` first only if needed for review).
</output_contract>
