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
pnpm tests:lhci:perfo                       # Lighthouse CI performance checks
```

## Visual Regression

Visual tests compare screenshots against a baseline:

1. Run `pnpm tests:playwright:visual` once to create baseline screenshots.
2. Deploy or run the application version you want to validate.
3. Run `pnpm tests:playwright:visual` again to compare the current UI against the baseline.
4. Use `pnpm tests:playwright:visual:update` only when the visual change is intentional and the baseline should change.

Commit baseline updates only with the related UI change.
