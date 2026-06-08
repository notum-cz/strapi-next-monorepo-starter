---
sidebar_position: 7
---

# `@repo/semantic-release-config`

Shared [semantic-release](https://semantic-release.gitbook.io/) config used by the root release workflow.

It publishes GitHub releases only. There is no npm publish step.

## Rules

The config uses the default commit analyzer plus two project-specific patch rules:

| Commit             | Release |
| ------------------ | ------- |
| `security: ...`    | patch   |
| `chore(deps): ...` | patch   |

Release notes and GitHub releases are handled by `@semantic-release/release-notes-generator` and `@semantic-release/github`.
