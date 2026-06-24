---
name: make-pr
description: >
  Use when the user is ready to submit work for review and wants a
  GitHub pull request opened — e.g. "open PR", "create pull request",
  "prepare PR", "make PR", "submit for review".
disable-model-invocation: true
argument-hint: "[base-branch | issue-url]"
---

# Create Pull Request

Commit any uncommitted work in logical groups, push, then open a pull request (a _merge request_ on GitLab) filled against the project PR template. GitHub is automated end-to-end via `gh`; on other hosts the work is still committed and pushed, and you hand the user a ready-to-open PR/MR link.

Commit / branch conventions: `apps/docs/docs/reference/workflow.md`.

**Be automated.** Do not ask for confirmations unless something is genuinely ambiguous. Only stop to ask the user if you cannot resolve the issue link or the diff is too large to summarize confidently.

## Arguments

Optional `$ARGUMENTS`:

- A base branch name → use as merge target (default: `dev`)
- A GitHub issue URL or `#<number>` → fetch via `gh issue view` and link in PR body
- Free-text → treat as additional context for the description

If multiple, separate with spaces. Auto-detect each arg by shape.

## Phase 1 — Gather context

### 1.1 Determine current branch

```bash
git branch --show-current
```

If on `dev` or `main`, abort: **"You're on a base branch. Switch to a feature branch first."**

### 1.2 Determine base branch

Default `dev`. Override via `$ARGUMENTS`. Verify it exists with `git rev-parse --verify <base>`. Fall back to `main` if `dev` missing.

### 1.3 Analyze all changes since branching

Run in parallel:

- `git diff <base>...HEAD --stat`
- `git diff --stat`
- `git diff --cached --stat`
- `git status --short`
- `git log <base>..HEAD --oneline`

Read actual diffs:

- `git diff <base>...HEAD`
- `git diff`

### 1.4 Resolve issue link (optional)

Resolution order — stop at first match:

1. `$ARGUMENTS` contains a GitHub issue URL or `#<number>` → fetch with `gh issue view <num> --json title,body,url`.
2. Branch name contains `<digits>` at the end (e.g. `feat/foo-284`) → try `gh issue view <num>` and verify the title looks related.
3. Skip — leave issue link out of the PR body.

Auto-fetch uses `gh`, so it resolves GitHub issues only. On other hosts (or if `gh` is missing/unauthenticated), skip the fetch and continue — the branch's ticket id still lands in the title/body.

## Phase 2 — Smart commits

Skip if working tree is clean.

### Grouping rules

1. **Dependency changes** (`package.json`, `pnpm-lock.yaml`) → separate commit: `chore(deps): update dependencies`.
2. **Remaining changes** → group by logical context. One context = one commit. Don't split fix + its test into two.

### For each group

1. Stage explicit files: `git add <file...>` (never `-A` or `.`).
2. Generate a conventional commit subject (`type(scope): subject`, under 50 chars). Type from branch prefix (`feat/` → `feat`, etc.) or change context.
3. Commit. If the pre-commit hook (Lefthook + commitlint) fails:
   - Read the error.
   - Fix lint/format/commitlint complaint.
   - Re-stage and create a **new** commit (do NOT `--amend`).

## Phase 3 — Push & open PR

### 3.1 Push

```bash
git push -u origin HEAD
```

If rejected for remote-ahead, abort: tell the user to pull/rebase first.

### 3.2 Title

Concise conventional-commit-style subject. Under 70 chars. Example: `fix(ui): footer renders wrong colour on dark mode`.

### 3.3 Body — fill the PR template

Check for a PR template at `.github/pull_request_template.md` (also `.github/PULL_REQUEST_TEMPLATE.md` or `.github/PULL_REQUEST_TEMPLATE/`). If present, fill it in and preserve its structure exactly.

**If no template file exists** (current state of this starter), build the body from these sections: a 2–4 sentence **Description** (WHY before WHAT), a one-line **TL;DR**, **New environmental variables** (or `None`), and a short **Test plan**. Then skip to "Create PR".

When a template is present, apply these mapping rules:

- **Task Link** → if an issue was resolved in Phase 1, replace placeholder URL with the real one. Otherwise leave the placeholder.
- **Description** → 2–4 sentences. WHY before WHAT. Reference root cause if it's a fix.
- **TL;DR** → one sentence.
- **Screenshots/Videos** → `N/A` if no UI change, otherwise leave the prompt for the author to fill.
- **New environmental variables** → list any new env vars touched in the diff (grep diff for `process.env.` adds, `.env*` edits). If none, write `None`.
- **Checklist – author** → tick only what the diff clearly satisfies:
  - `Description` once written
  - `Environmental variables` if you listed them or wrote `None`
  - `Unit/Integration tests` if test files were added
  - Leave human-only items unchecked (Assignee, Reviewers, Labels, screenshots, etc.)
- **Before merging** → leave all unchecked.
- **Checklist – reviewer** → leave all unchecked.

If the template has no `Task Link` section but an issue was resolved, prepend `Closes #<num>` above the body.

### 3.4 Open the PR

Detect the remote host from `git remote get-url origin`:

- **GitHub, with `gh` available**:

  ```bash
  gh pr create --base "<base>" --title "<title>" --body-file <tmpfile>
  ```

  Use a tempfile via `mktemp` to avoid shell-escaping the multi-line body. Parse the output for the PR URL.

- **Any other host, or `gh` missing/unauthenticated** — the branch is already pushed, so don't fail. Print the title and body and hand the user a ready-to-open link for the detected host:
  - GitLab → `<repo-web-url>/-/merge_requests/new?merge_request%5Bsource_branch%5D=<branch>`
  - Bitbucket → `<repo-web-url>/pull-requests/new?source=<branch>`
  - Azure Repos / unknown host → confirm the push and tell the user to open the PR in their host's UI against `<base>`.

  Derive `<repo-web-url>` from the origin remote (strip a trailing `.git`, convert `git@host:org/repo` to `https://host/org/repo`).

## Report

Print:

```
PR/MR: <url>   (or "open manually — link printed above")
Branch: <branch> -> <base>
Commits on branch: <n>
Issue: <#num title> (or "no issue linked")
```

## Notes

- Never push with `--force` or `--force-with-lease` unless the user explicitly asks.
- Never `--amend` after a hook failure.
- Don't reference Asana, Linear, or Jira — they're out of scope for v1.
- If multiple issues plausibly match the branch number, ask the user.
