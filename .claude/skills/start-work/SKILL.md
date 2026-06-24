---
name: start-work
description: >
  Use when the user is ready to begin a new fix or feature and wants an
  isolated workspace — e.g. "start work on", "fix issue", "new feature",
  "begin task", "work on issue", "/start-work". Accepts a GitHub, Linear,
  or Jira issue (number, key, or URL) or a plain branch name.
argument-hint: "[issue-number | issue-key | issue-url | branch-name]"
---

# Start Work

Set up an isolated workspace for new work. Prefer a git worktree so the current checkout stays untouched. Fetch issue context when available, draft a short plan, then hand off to implementation.

Worktree mechanics + branch naming: `apps/docs/docs/reference/workflow.md` and `worktree.config.json` (manifest the scripts apply).

**Be automated.** Resolve arguments by shape, do not interrogate the user unless something is genuinely ambiguous (e.g. multiple plausible base branches, branch name fails the project's validation hook).

## Phase 1 — Resolve `$ARGUMENTS`

Detect the tracker and ticket by shape — first match wins:

| Shape                                                             | Tracker            | Ticket                                             |
| ----------------------------------------------------------------- | ------------------ | -------------------------------------------------- |
| Pure digits (`284`), `#284`, or a `github.com/.../issues/<n>` URL | GitHub             | issue `<n>`                                        |
| `linear.app/.../issue/<KEY>` URL                                  | Linear             | `<KEY>`                                            |
| `<org>.atlassian.net/browse/<KEY>` URL                            | Jira               | `<KEY>`                                            |
| Bare key `ABC-123` (`[A-Z][A-Z0-9]+-\d+`)                         | Linear **or** Jira | `<KEY>` — disambiguate below                       |
| Anything else                                                     | —                  | none — treat verbatim as a branch name, skip fetch |

Bare keys are ambiguous between Linear and Jira. Resolve in order: the tracker whose MCP server is connected → ask the user once. (This starter's branch hook expects `STAR-<n>`, so a `STAR-###` key is the common case.)

### Fetch issue context

- **GitHub** → `gh issue view <n> --json number,title,body,url,labels`. Fall back if `gh` is missing or unauthenticated.
- **Linear** → the connected **Linear MCP** server's get-issue tool.
- **Jira** → the connected **Atlassian (Jira) MCP** server's get-issue tool.

For Linear and Jira, **MCP is the only channel** — never fall back to a REST API or env credentials, and never ask for or echo a token. If the tracker's MCP server isn't connected, skip the fetch, fall back to branch-name-only mode, and tell the user once (they can authenticate the connector with `/mcp`).

From whichever channel, capture: title, description/body, the key or number, the URL, and the issue type/labels.

If `$ARGUMENTS` is empty, ask the user for an issue ref or a branch name. Do not invent one.

## Phase 2 — Determine the branch name

### When the issue was fetched

Propose `<type>/<ticket>-<slug>`:

- `<ticket>` — for Linear/Jira, the issue **key** verbatim (e.g. `STAR-284`); for GitHub, the issue **number**.
- `<type>` — from issue type/labels: `bug` → `fix`; `feature`/`enhancement`/`story`/`task` → `feat`; default `feat`.
- `<slug>` — lowercased, kebab-cased title, ≤ 5 words, ASCII only.

Check `scripts/validate-branch-name.sh` if present — its regex defines the required shape (this starter requires `<type>/STAR-<n>-<slug>`). A Linear/Jira `STAR-###` key satisfies it directly; a bare GitHub issue number will not, so ask the user once for the correct ticket id rather than inventing one.

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
- Supported trackers: GitHub, Linear, Jira. Asana and Azure DevOps are out of scope — for an untracked or unrecognized reference, fall back to branch-name-only mode and tell the user.
- Never delete or reset existing worktrees. Hand off to `scripts/worktree/cleanup.sh` (when it exists) for that.
