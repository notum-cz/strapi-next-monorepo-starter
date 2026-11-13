---
name: docs-changelog
description: >
  Use when generating a changelog from recent commits and auditing docs for
  gaps left by code changes — e.g. "changelog", "release notes", "what
  changed", "docs audit", "missing docs", "update changelog", "work summary",
  "period report", "/docs-changelog".
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
  - Agent
---

Generate a changelog from recent commits and audit documentation for gaps.

**Two modes** (both run by default, or pick one with flags):

1. **Changelog** — collect commits since last run, categorize by conventional commit type, produce a human-readable changelog entry for `apps/docs/docs/reference/changelog.md`.
2. **Docs audit** — detect when code changed but related documentation did not, flag missing env var docs, and check structural integrity of modified doc pages.

The skill writes the changelog and audit drafts to local files but does **not** auto-commit or create PRs. Pass `--dry-run` to print the report without writing anything. It suggests applying changes via `/start-work` to create a worktree.

**Usage:** `/docs-changelog [--since=<sha|date>] [--changelog-only] [--audit-only] [--dry-run] [--period=daily|weekly]`

Follow the full workflow in [workflow.md](workflow.md).
