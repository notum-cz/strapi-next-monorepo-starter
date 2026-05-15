---
name: fix-issue
description: >
  Use when the user is ready to begin a new fix or feature and wants an
  isolated workspace — e.g. "fix issue", "start work on", "new feature",
  "begin task", "work on issue", "/fix-issue". Accepts a GitHub issue
  number/URL or a plain branch name. Asana/Linear/Azure out of scope.
argument-hint: "[issue-number | issue-url | branch-name]"
---

# Fix an Issue

Set up an isolated workspace for new work. Prefer a git worktree so the current checkout stays untouched. Fetch issue context when available, draft a short plan, then hand off to implementation.

**Be automated.** Resolve arguments by shape, do not interrogate the user unless something is genuinely ambiguous (e.g. multiple plausible base branches, branch name fails the project's validation hook).

## Phase 1 — Resolve `$ARGUMENTS`

Detect by shape — first match wins:

| Shape                        | Treat as            | Action                                                  |
| ---------------------------- | ------------------- | ------------------------------------------------------- |
| Pure digits (`284`)          | GitHub issue number | `gh issue view 284 --json number,title,body,url,labels` |
| URL containing `/issues/<n>` | GitHub issue URL    | extract `<n>`, fetch as above                           |
| `#<digits>`                  | GitHub issue number | strip `#`, fetch as above                               |
| Anything else                | Branch name         | skip fetch, use verbatim as branch                      |

If `gh` is missing or unauthenticated, skip the fetch and fall back to branch-name-only mode. Tell the user once.

If `$ARGUMENTS` is empty, ask the user for an issue ref or a branch name. Do not invent one.

## Phase 2 — Determine the branch name

### When the issue was fetched

Propose `<type>/<number>-<slug>`:

- `<type>` from issue labels (`bug` → `fix`, `enhancement`/`feature` → `feat`, default `feat`)
- `<slug>` = lowercased, kebab-cased title, ≤ 5 words, ASCII only

Check `scripts/validate-branch-name.sh` if present — its regex defines the project's required shape (e.g. this starter requires `<type>/STAR-<n>-<slug>`). If the proposed name will fail, ask the user once for the correct ticket id, do not silently invent one.

### When user passed a branch name

Use it verbatim. Run `scripts/validate-branch-name.sh` (when present) against it before creating; refuse early if it would be rejected.

### Already inside a worktree?

Detect via `git rev-parse --is-inside-work-tree` + `git rev-parse --git-common-dir` differing from `.git`. If yes:

- If the current branch matches the proposed/given name → reuse, skip Phase 3, jump to Phase 4.
- Otherwise → ask: reuse current worktree (will switch branch in place) or create a new sibling worktree.

## Phase 3 — Create the workspace

Default base branch: `dev`. Verify via `git rev-parse --verify dev`; fall back to `main` if missing.

### Preferred: project worktree script

If `scripts/worktree/create.sh` exists in the canonical repo root, call it:

```bash
bash scripts/worktree/create.sh <branch> <base>
```

The script handles canonical-root resolution, env propagation, and `pnpm install`. Trust its exit code.

### Fallback: plain `git worktree add`

If the script is absent:

```bash
git fetch origin <base>
git worktree add -b <branch> ../.worktrees/<branch-slug> <base>
```

Use `<branch-slug>` = `<branch>` with `/` → `-` for the directory name. Place at `<repo-root>/../.worktrees/<slug>` so worktrees stay siblings of the repo, not nested.

After the worktree exists, print its path. Do not `cd` for the user — print the command they'd run.

### Refuse to nest

Never create a worktree inside another worktree. If the resolved target falls under an existing worktree path (`git worktree list --porcelain` to verify), abort with a clear message.

## Phase 4 — Lay out an initial plan

Write `.claude/plans/<branch-slug>.md` (gitignored) with:

```markdown
# <branch>

**Issue:** <url or "manual">
**Base:** <base-branch>
**Worktree:** <path>

## Summary

<2–4 sentences of issue body, paraphrased>

## Scope

- [ ] <first concrete step>
- [ ] <second>
- [ ] <third>

## Out of scope

- <known follow-ups not part of this task>

## Open questions

- <anything the issue leaves ambiguous>
```

If no issue was fetched, leave Summary as `Manual task — no issue linked.` and let the user fill Scope.

Keep the plan small. It is a working note, not a spec.

## Phase 5 — Report

Print:

```
Branch: <branch>
Base:   <base>
Worktree: <path>
Issue:  <#num title> (or "no issue linked")
Plan:   .claude/plans/<branch-slug>.md
Next:   cd <path>  &&  open the plan
```

Stop there. Do not start implementing — that is the user's call (or another skill's job).

## Notes

- Do not push the new branch. `make-pr` handles that.
- Do not run `pnpm install` yourself when the worktree script is absent — the user picks when to install. If the fallback path was used, mention it explicitly so they remember.
- Asana / Linear / Azure DevOps integrations are out of scope for v1. If `$ARGUMENTS` looks like a non-GitHub ticket id, fall back to branch-name-only mode and tell the user.
- Never delete or reset existing worktrees. Hand off to `scripts/worktree/cleanup.sh` (when it exists) for that.
