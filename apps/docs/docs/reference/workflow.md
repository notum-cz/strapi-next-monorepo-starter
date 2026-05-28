# Git Hooks and Conventions

This repository uses Lefthook, commitlint, Commitizen, and conventional commits to keep branch names and commit history predictable.

## Git Hooks

Lefthook ([`lefthook.yml`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/lefthook.yml)) enforces:

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

Use conventional commits:

```text
feat(ui): add dark mode toggle
```

For the interactive Commitizen prompt, run:

```bash
pnpm commit
```

## Environment Variables in Commits

When introducing new environment variables, mention them in commit messages using `env.VARIABLE_NAME` or `VARIABLE_NAME` in `CONSTANT_CASE`.

The [`auto-pr` workflow](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/.github/workflows/auto-pr.yml) extracts these names from commit messages and lists them in the pull request description under "Required Environment Variables".

Example commit body:

```text
Added error tracking with Sentry.

New environment variables:
- env.SENTRY_DSN
- env.SENTRY_AUTH_TOKEN
```

## Release Notes

Release automation is driven by [semantic-release](https://semantic-release.gitbook.io/) and the shared [`@repo/semantic-release-config`](./packages/semantic-release-config.md) package.
