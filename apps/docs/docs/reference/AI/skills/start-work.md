---
sidebar_position: 15
---

# start-work

Start a new task in a clean, isolated workspace so your current work stays untouched. The skill creates a dedicated branch and worktree, pulls in the issue details when it can, and drafts a short plan — then hands off. It sets the stage; it doesn't write the code.

## Use it when

- You're beginning a new fix or feature and want it isolated from whatever else is in progress.
- You want the branch, workspace, and a starting plan set up in one step.

## What it helps solve

- Starts a new task without disturbing whatever is already open.
- Creates a clean branch and workspace for a bug fix or feature.
- Pulls useful issue context into a small starting note when available.

It prepares the workspace; it does not implement the task.

## Issue tracking

Supported trackers: **GitHub, Linear, and Jira.** Give it an issue number, key, or URL and it pulls the title and description automatically:

- **GitHub** — via your existing `gh` login.
- **Linear** — via the connected Linear integration.
- **Jira** — via the connected Atlassian (Jira) integration.

A Linear/Jira key like `STAR-284` maps straight to the branch name the project expects. If the issue tracker is not connected, the input is treated as a plain branch name and the issue lookup is skipped. The skill never handles raw credentials.
