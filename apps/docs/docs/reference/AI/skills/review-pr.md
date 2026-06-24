---
sidebar_position: 17
---

# review-pr

Get a thorough review of a pull request — or your current branch — before it merges. The skill runs the project's checks, reviews the change from several angles (correctness, types, tests, security, and more), and gives a clear ship / ship-with-follow-ups / block verdict with concrete fixes.

## Use it when

- You're about to merge a PR or feature branch and want a careful second pass.

Point it at a PR number or URL, or run it with no argument to review the current branch.

## What it helps solve

- Catches bugs, missing tests, security risks, and release blockers before merge.
- Gives a clear ship, follow-up, or block recommendation.
- Helps review your own branch before opening a PR, or a teammate's PR before approving it.

It reviews only; it does not merge or push fixes.
