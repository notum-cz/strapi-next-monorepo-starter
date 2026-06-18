---
sidebar_position: 3
---

# Playwright Testing

The Playwright QA suite validates the deployed or local UI through a browser. It covers end-to-end behavior, accessibility, SEO, visual output, and performance.

| Area          | Tooling                | Location                     |
| ------------- | ---------------------- | ---------------------------- |
| Browser QA    | Playwright             | `qa/tests/playwright/e2e`    |
| Accessibility | Playwright + axe-core  | `qa/tests/playwright/axe`    |
| SEO           | Playwright             | `qa/tests/playwright/seo`    |
| Visual        | Playwright screenshots | `qa/tests/playwright/visual` |
| Performance   | Lighthouse CI          | `qa/tests/playwright/perfo`  |

## Workspace

The QA workspace is a dedicated pnpm package at `qa/tests/playwright`.

```text
qa/tests/playwright/
├── e2e/                    # end-to-end flows
├── axe/                    # accessibility checks
├── seo/                    # SEO checks
├── visual/                 # visual regression checks
├── perfo/                  # Lighthouse CI performance checks
├── helpers/                # shared test utilities
├── .env.example            # example environment variables
├── package.json            # QA package scripts and dependencies
├── playwright.config.ts    # Playwright configuration
└── tsconfig.json           # TypeScript configuration
```

## Environment

Create a local Playwright env file before running browser tests:

```bash
cp qa/tests/playwright/.env.example qa/tests/playwright/.env
```

Set `BASE_URL` to the app under test. This is the starting point for all Playwright suites and can point to local development, staging, or production-like deployments.

```env
BASE_URL=http://localhost:3000
```

Mobile browser projects are disabled by default. Enable them when the run should include mobile viewport coverage:

```env
MOBILE_VIEWPORTS_TESTING_ENABLED=true
```

## Browser Install

Install Playwright browsers once:

```bash
pnpm -F @repo/tests-playwright exec playwright install --with-deps
```

## Commands

Run all commands from the monorepo root:

```bash
pnpm tests:playwright:e2e:test              # Playwright E2E, headless
pnpm tests:playwright:e2e:test:interactive  # Playwright E2E, UI mode
pnpm tests:playwright:axe                   # Accessibility checks
pnpm tests:playwright:seo                   # SEO checks
pnpm tests:playwright:visual                # Visual regression checks
pnpm tests:playwright:visual:update         # Update visual snapshots
pnpm tests:playwright:visual:docker         # Visual regression checks via Docker (CI-compatible)
pnpm tests:playwright:visual:docker:update  # Update Linux snapshots via Docker
pnpm tests:lhci:perfo                       # Lighthouse CI performance checks
```

## Visual Regression

Visual regression tests compare screenshots of the application against previously committed baseline images to detect unintended visual changes.

### Browser coverage

| Browser         | Local | Docker / CI |
| --------------- | ----- | ----------- |
| Chromium        | ✅    | ✅          |
| Firefox         | ✅    | ✅          |
| WebKit (Safari) | ✅    | ❌          |

WebKit is excluded from Docker and CI runs because WebKit on Linux produces blank or incorrectly rendered screenshots due to missing system-level graphics dependencies. On macOS, WebKit runs natively and works correctly — so it is included in local (non-Docker) test runs only.

### Cross-platform consistency (macOS vs CI/Linux)

macOS and Linux render fonts and UI elements differently, which causes snapshots generated locally to fail when compared on a GitHub CI runner (Linux). To solve this, **baseline snapshots must be generated on Linux**.

Two approaches are available:

- **Docker (recommended for local baseline generation)** — runs Playwright inside the official Linux Docker image, producing Linux-compatible snapshots without needing to push to CI first. Requires Docker Desktop to be running.
- **CI runner** — GitHub Actions runs directly on Linux, so no Docker is needed there.

Only `*-linux-*.png` snapshots are committed to the repository. macOS (`*-darwin-*.png`) and Windows (`*-win32-*.png`) snapshots are gitignored.

### Snapshot naming convention

Each snapshot filename encodes the environment, page, browser, and platform:

```text
{env-slug}-{page}-{browser}-{platform}.png
```

- `env-slug` is derived from the `BASE_URL` hostname (`www.` is stripped automatically)
- Each environment maintains its own set of baselines — DEV compares against DEV, STG against STG, etc.
- First run on a given environment always creates baselines (pass). Failures only occur on subsequent runs when visual changes are detected.

### Workflow

**First time setup or after UI changes — generate Linux baselines locally:**

```bash
# Requires Docker Desktop to be running
pnpm tests:playwright:visual:docker:update
```

This generates `*-linux-*.png` snapshots in `qa/tests/playwright/visual/visual.spec.ts-snapshots/`. Review them, then commit and push.

**Verify comparison locally before pushing (optional):**

```bash
pnpm tests:playwright:visual:docker
```

**CI (GitHub Actions):**

The `visual` job in `qa.yml` runs on a Linux runner and compares against committed baseline snapshots. Trigger it manually via the QA workflow with the **Visual tests** checkbox and a `base_url` value.

Commit baseline updates only with the related UI change.
