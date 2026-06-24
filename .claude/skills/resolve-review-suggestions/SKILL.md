---
name: resolve-review-suggestions
description: >
  Use when the user wants unresolved GitHub pull request review comments
  addressed and closed with the authenticated GitHub CLI (`gh`) —
  e.g. "resolve review suggestions", "address PR comments", "fix review
  comments", "handle requested changes", "apply review feedback",
  "/resolve-review-suggestions". GitHub-only; unsupported for GitLab,
  Bitbucket, Azure Repos, or local-only branches. Requires an explicit
  GitHub PR number or PR URL.
disable-model-invocation: true
argument-hint: "<pr-number | pr-url>"
---

# Resolve Review Suggestions

Load unresolved GitHub pull request review threads, implement the relevant ones, push the fixes, and resolve the conversations that are actually addressed. List irrelevant or out-of-scope comments for the user instead of closing them.

## Requirements

- **GitHub only.** Do not use this skill for GitLab, Bitbucket, Azure Repos, or local-only review feedback.
- **Authenticated GitHub CLI required.** `gh` must be installed and `gh auth status` must pass before loading comments or changing the PR.
- **Explicit PR required.** The user must provide a GitHub PR number or PR URL; do not infer from branch names.

This skill handles GitHub review threads, not ordinary top-level PR comments; top-level comments can be read for context, but GitHub has no "resolve conversation" action for them.

**Be automated.** Ask only when the PR argument is missing or invalid, the current worktree has unrelated dirty changes, or a comment needs a product decision.

## Phase 1 — Resolve the PR

Require `$ARGUMENTS`. Do not infer a PR from the current branch name or current branch's GitHub PR.

| Shape                                  | Meaning   |
| -------------------------------------- | --------- |
| Pure digits or `#123`                  | PR number |
| `github.com/<org>/<repo>/pull/<n>` URL | PR number |

If no argument was provided, stop and ask the user for the PR number or URL. If the argument is not one of the supported shapes, stop and ask for a valid GitHub PR number or URL.

Verify access:

```bash
command -v gh
gh auth status
gh pr view <num> --json number,title,url,headRefName,baseRefName,state,isDraft
gh repo view --json owner,name
```

If `gh` is missing or unauthenticated, stop and tell the user to install/authenticate GitHub CLI. Do not fall back to unauthenticated REST calls for this skill because resolving conversations requires authenticated GraphQL access.

Abort if the PR is closed or merged.

## Phase 2 — Prepare the branch

Check the worktree:

```bash
git status --short
git branch --show-current
```

If the current branch is not the PR head branch, switch only when the worktree is clean:

```bash
gh pr checkout <num>
```

If the worktree has existing unrelated changes, stop and tell the user. Never overwrite or stash user work silently.

## Phase 3 — Load unresolved review threads

Fetch unresolved review threads with GraphQL so thread ids are available for resolution:

```bash
gh api graphql \
  -F owner="<owner>" \
  -F name="<repo>" \
  -F number=<num> \
  -f query='
query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          originalLine
          startLine
          diffSide
          comments(first: 50) {
            nodes {
              id
              author { login }
              body
              url
              createdAt
              path
              diffHunk
            }
          }
        }
      }
    }
  }
}' --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved == false)'
```

If there are more than 100 threads, rerun with pagination. Also fetch regular comments for context only:

```bash
gh pr view <num> --comments
```

## Phase 4 — Triage

For every unresolved thread, inspect the latest reviewer comment, its earlier thread context, and the referenced code.

Classify each thread:

- **Implement** — concrete, relevant to this PR, and safely fixable now.
- **Already addressed** — current code already satisfies it; verify before resolving.
- **Not relevant** — obsolete, out of scope, conflicts with project conventions, duplicates another thread, or asks for a product decision.
- **Needs user** — ambiguous or requires a decision the agent cannot safely make.

Do not resolve **Not relevant** or **Needs user** threads. List them for the user with the comment URL and a one-line reason.

## Phase 5 — Implement relevant comments

Apply direct fixes for **Implement** threads. Keep edits tightly scoped to the review feedback.

After edits, run the narrowest useful validation:

- Code or config changed: `pnpm lint` and `pnpm typecheck` when available.
- Tests changed or behavior changed: run the relevant unit or Playwright command from `apps/docs/docs/reference/commands.md`.
- Strapi schemas changed: run `bash .claude/skills/strapi-schema-check/scripts/check.sh`.

If validation cannot run because the local toolchain is unavailable, say so in the final report.

## Phase 6 — Commit and push

If files changed, stage explicit files only:

```bash
git add <file...>
git commit -m "fix: address PR review suggestions"
git push
```

If hooks fail, fix the issue and create a new commit attempt; do not bypass hooks. If there are no file changes, skip commit/push.

## Phase 7 — Resolve addressed conversations

Resolve only threads classified as **Implement** or **Already addressed** after verifying the fix is present in the current branch:

```bash
gh api graphql \
  -F threadId="<thread-id>" \
  -f query='
mutation($threadId: ID!) {
  resolveReviewThread(input: { threadId: $threadId }) {
    thread { id isResolved }
  }
}'
```

Never resolve a thread just because it is inconvenient, stale-looking, or disagreed with. If it was not implemented or verified as already addressed, leave it open and report it.

## Report

Print:

```text
PR: <url>
Branch: <headRefName>
Implemented: <n> threads
Already addressed: <n> threads
Resolved on GitHub: <n> threads
Not relevant / left open:
- <url> — <reason>
Needs user:
- <url> — <question>
Validation:
- <command>: pass | fail | not run (<reason>)
Pushed: <commit or "no changes">
```

## Notes

- Do not merge the PR.
- Do not dismiss reviews; only resolve review threads that were addressed.
- Do not close top-level PR comments; summarize them if they influenced the work.
- If a reviewer requested a larger design change that does not fit the PR, leave it open and ask the user.
