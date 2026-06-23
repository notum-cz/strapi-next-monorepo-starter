---
sidebar_position: 19
---

# validate-branch-refs

Find and fix the loose ends a branch leaves behind — references to things it renamed, moved, or removed (paths, links, commands, env vars), plus stale factual claims in docs. The skill compares your branch to its base, fixes the clear-cut cases, and asks you about the ambiguous ones.

## Use it when

- You're preparing a branch for merge and want to catch stale references.
- You've done a refactor or rename and want docs and comments brought back in sync.

## What it helps solve

- Finds stale docs, comments, links, paths, and command names after a branch changes things.
- Helps clean up rename fallout before review.
- Catches outdated claims that would confuse the next developer.

Use it before merging a refactor, rename, or documentation-heavy branch.
