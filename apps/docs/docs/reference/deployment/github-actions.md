---
sidebar_position: 2
---

# GitHub Actions

GitHub Actions workflows live in `.github/workflows`. They verify pull requests, publish docs, run manual QA checks, create dev-to-main PRs, and publish GitHub releases.

## Shared Setup Action

`.github/actions/setup-pnpm/action.yml` is a local composite action used by the workflows.

It performs three common setup steps:

1. Installs pnpm.
2. Configures Node from `.nvmrc` through `actions/setup-node`.
3. Runs `pnpm install --frozen-lockfile --prefer-offline` with pnpm cache enabled.

:::tip
Use the shared setup action when adding new workflows so pnpm, Node, and dependency caching stay consistent.
:::

## Workflows

| Workflow                    | File                            | Trigger                                  | Purpose                                                       |
| --------------------------- | ------------------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| CI                          | `.github/workflows/ci.yml`      | Pull requests to `main` or `dev`         | Lint, format-check, unit test, build UI, and build Strapi.    |
| QA (manual)                 | `.github/workflows/qa.yml`      | Manual `workflow_dispatch`               | Run selected browser QA suites against a supplied `BASE_URL`. |
| Deploy Docs to GitHub Pages | `.github/workflows/docs.yml`    | Push to `main` touching docs, or manual  | Build Docusaurus and deploy docs to GitHub Pages.             |
| Release                     | `.github/workflows/release.yml` | Push to `main`                           | Run semantic-release and publish a GitHub release.            |
| Auto Create Pull Requests   | `.github/workflows/auto-pr.yml` | Push to `dev`, daily schedule, or manual | Create or update a `dev` to `main` pull request.              |

## CI

`.github/workflows/ci.yml` is the default pull request safety net.

It runs on pull requests targeting `main` or `dev` and performs:

```text
checkout
setup pnpm
copy example env files
pnpm lint
pnpm format:check
pnpm test:ci
pnpm build:ui
pnpm build:strapi
```

The workflow sets `NPM_CONFIG_IGNORE_SCRIPTS=true` and `CI=true`. It also cancels older in-progress CI runs for the same pull request branch.

:::info Static UI export
The CI workflow contains a commented `pnpm build:ui:static` step. Enable it only if the project intentionally deploys the UI with `NEXT_OUTPUT=export`.
:::

## QA Manual Workflow

`.github/workflows/qa.yml` runs browser QA against an already running environment.

Manual inputs:

| Input            | Type             | Purpose                                |
| ---------------- | ---------------- | -------------------------------------- |
| `base_url`       | string, required | The target UI URL, including protocol. |
| `run_e2e`        | boolean          | Runs Playwright E2E tests.             |
| `run_axe`        | boolean          | Runs accessibility tests.              |
| `run_seo`        | boolean          | Runs SEO checks.                       |
| `run_lhci_perfo` | boolean          | Runs Lighthouse CI performance checks. |

Each selected suite runs as its own job. Playwright jobs cache browser binaries, install Playwright browsers, set `BASE_URL` from the workflow input, and upload useful reports or traces when a job fails.

Artifacts:

| Job  | Artifact behavior                                     |
| ---- | ----------------------------------------------------- |
| E2E  | Uploads Playwright reports and traces on failure.     |
| AXE  | Packs and uploads axe reports on every run.           |
| SEO  | Packs and uploads reports on failure.                 |
| LHCI | Packs and uploads Lighthouse CI reports on every run. |

:::tip
Use the QA workflow after deploying to a staging or test app. The workflow does not start the application; it tests the URL you provide.
:::

## Release

`.github/workflows/release.yml` runs on pushes to `main`.

It checks out the full Git history, installs dependencies through the shared setup action, and runs:

```bash
pnpm exec semantic-release --extends @repo/semantic-release-config
```

:::info Release permissions
The workflow uses `GITHUB_TOKEN` and has write permissions for contents, issues, and pull requests so semantic-release can create GitHub releases and comment on related issues or PRs.
:::

## Auto PR

`.github/workflows/auto-pr.yml` keeps a production-sync PR open from `dev` to `main`.

It runs on:

- pushes to `dev`
- a daily schedule at 09:00 UTC
- manual dispatch

The workflow:

1. Confirms `main` exists.
2. Checks whether `dev` differs from `main`.
3. Detects an existing open `dev` to `main` PR.
4. Extracts required environment variable names from commit bodies using the format documented in [Environment Variables in Commits](../workflow.md#environment-variables-in-commits).
5. Creates or updates the sync PR body with recent commits, changed files, env vars, and a checklist.

The `.github/workflows/auto-pr.yml` extraction is intentionally lightweight; see [Git Hooks and Conventions](../workflow.md#environment-variables-in-commits) for the commit-message format and current limitations.

:::warning Merge method
The generated PR body explicitly asks maintainers to use a merge commit. Do not squash or rebase this PR unless your project intentionally changes the release workflow assumptions.
:::

## Docs Deployment

`.github/workflows/docs.yml` builds and publishes `apps/docs` to GitHub Pages.

It runs on:

- pushes to `main` that change `apps/docs/**`
- changes to `.github/workflows/docs.yml`
- manual dispatch

The workflow configures GitHub Pages, builds Docusaurus with `DOCUSAURUS_URL` and `DOCUSAURUS_BASE_URL` from the Pages setup step, uploads the build artifact, then deploys it with `actions/deploy-pages`.

## Related Documentation

- [Testing](../testing/overview.md)
- [Git Hooks and Conventions](../workflow.md)
- [`@repo/semantic-release-config`](../packages/semantic-release-config.md)
