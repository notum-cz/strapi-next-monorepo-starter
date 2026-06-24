---
sidebar_position: 18
---

# resolve-review-suggestions

Address unresolved GitHub PR review feedback. The skill requires an authenticated GitHub CLI (`gh`), loads open review conversations, applies the comments that are relevant to the branch, pushes the fixes, and closes the conversations it actually resolved.

## Use it when

- A PR has reviewer suggestions or requested changes that should be handled directly.
- You want the agent to separate actionable feedback from comments that are stale, out of scope, or need a human decision.

Pass a GitHub PR number or URL. The skill does not infer the PR from the current branch and does not support GitLab, Bitbucket, Azure Repos, or local-only branches.

## Requirements

- `gh` installed.
- `gh auth status` passes for the repository host.
- A GitHub PR number or URL is provided.

## What it helps solve

- Turns review feedback into concrete code/docs changes.
- Closes GitHub review conversations that were implemented or already addressed.
- Leaves unrelated, stale, or decision-heavy comments open and reports them back to you.
- Keeps the post-review cleanup step separate from opening or reviewing the PR.

Use it after [review-pr](./review-pr.md) or after a teammate has left GitHub PR review comments.
