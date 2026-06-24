---
sidebar_position: 3
---

# Git Hooks and Conventions

This repository uses Lefthook, commitlint, Commitizen, and [Conventional Commits](https://www.conventionalcommits.org/) to keep branch names and commit history predictable.

## Git Hooks

Lefthook (`lefthook.yml`) enforces:

- **pre-commit**: branch name validation and lint-staged checks for ESLint and Prettier
- **commit-msg**: conventional commit format via commitlint

Branch naming:

```text
<type>/STAR-<number>-<description>
```

Example:

```text
feat/STAR-1582-repo-config
```

Exempt branches: `main`, `master`, `develop`, `dev`, `release/*`, `hotfix/*`.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```text
feat(ui): add dark mode toggle
```

For the interactive Commitizen prompt, run:

```bash
pnpm commit
```

## Environment Variables in Commits

:::warning Work in progress
This is a lightweight helper, not a complete environment-management solution yet. Treat the extracted list as a reminder to review required variables manually before deployment.
:::

When introducing new environment variables, mention them in commit messages using `env.VARIABLE_NAME` or `VARIABLE_NAME` in `CONSTANT_CASE`.

The `.github/workflows/auto-pr.yml` extracts these names from commit messages and lists them in the pull request description under "Required Environment Variables". See [GitHub Actions](./deployment/github-actions.md#auto-pr) for the full Auto PR workflow behavior.

Example commit body:

```text
Added error tracking with Sentry.

New environment variables:
- env.SENTRY_DSN
- env.SENTRY_AUTH_TOKEN
```

## Release Notes

Release automation is driven by [semantic-release](https://semantic-release.gitbook.io/) and the shared [`@repo/semantic-release-config`](./packages/semantic-release-config.md) package.
