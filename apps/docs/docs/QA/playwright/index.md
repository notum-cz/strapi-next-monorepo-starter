---
sidebar_position: 1
---

# Playwright Testing

The Playwright QA suite validates the deployed or local UI through a browser. It covers end-to-end behavior, accessibility, SEO, visual output, and performance.

| Area          | Tooling                | Location                        |
| ------------- | ---------------------- | ------------------------------- |
| E2E — smoke   | Playwright             | `qa/tests/playwright/e2e/smoke` |
| E2E — mock    | Playwright             | `qa/tests/playwright/e2e/mock`  |
| Accessibility | Playwright + axe-core  | `qa/tests/playwright/axe`       |
| SEO           | Playwright             | `qa/tests/playwright/seo`       |
| Visual        | Playwright screenshots | `qa/tests/playwright/visual`    |
| Performance   | Lighthouse CI          | `qa/tests/playwright/perfo`     |

## Workspace

The QA workspace is a dedicated pnpm package at `qa/tests/playwright`.

```text
qa/tests/playwright/
├── e2e/
│   ├── smoke/              # critical-path flows against the real app/backend
│   └── mock/                # same flows, with the network layer stubbed (see below)
├── axe/                    # accessibility checks
├── seo/                    # SEO checks
├── visual/                 # visual regression checks
├── perfo/                  # Lighthouse CI performance checks
├── helpers/                # shared test utilities (page objects, fixtures)
├── .env.example            # example environment variables
├── package.json            # QA package scripts and dependencies
├── playwright.config.ts    # Playwright configuration
└── tsconfig.json           # TypeScript configuration
```

### Page lists per environment

`helpers/urls.json` holds the pages each suite checks, split by environment:

```json
{
  "seo": { "dev": ["/"], "staging": ["/"], "prod": ["/"] },
  "axe": { "dev": ["/"], "staging": ["/"], "prod": ["/"] },
  "visual": { "dev": ["/"], "staging": ["/"], "prod": ["/"] },
  "perfo": { "dev": ["/"], "staging": ["/"], "prod": ["/"] }
}
```

Each suite gets its full page list — every environment, deduped — via `helpers/flatten-urls.ts`, which recursively collects every string leaf however deeply `urls.json` is nested (env, brand, region, ...):

```typescript
import { flattenUrls } from "../helpers/flatten-urls"
import urls from "../helpers/urls.json"

const PATHS = flattenUrls(urls.seo)
```

To cover a new page, add it to the right suite's list for the environment(s) where it should run — it's picked up automatically, no spec file changes needed.

### End-to-end: smoke vs mock

`e2e/` specs are split into two kinds, sharing the same page objects from `helpers/pages/`:

- **`e2e/smoke/`** — drives a real browser against the real running app and its real backend. Kept small and critical-path: does the page load, does the core flow complete.
- **`e2e/mock/`** — drives the browser the same way, but stubs network responses with [Playwright's route mocking](https://playwright.dev/docs/mock) instead of hitting a real backend. Used for backend states that are hard or slow to reproduce for real (a specific error response, a dropped connection), via the shared fixture in `helpers/fixtures.ts` (built on [Playwright's test-fixtures pattern](https://playwright.dev/docs/test-fixtures)).

Run them separately with `pnpm tests:playwright:e2e:smoke` / `pnpm tests:playwright:e2e:mock`, or together with `pnpm tests:playwright:e2e:test`.

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
pnpm tests:playwright:e2e:test              # Playwright E2E, headless (smoke + mock)
pnpm tests:playwright:e2e:smoke             # Playwright E2E, smoke only
pnpm tests:playwright:e2e:mock              # Playwright E2E, mock only
pnpm tests:playwright:e2e:test:interactive  # Playwright E2E, UI mode
pnpm tests:playwright:axe                   # Accessibility checks
pnpm tests:playwright:seo                   # SEO checks
pnpm tests:playwright:visual                # Visual regression checks
pnpm tests:playwright:visual:update         # Update visual snapshots
pnpm tests:playwright:visual:docker         # Visual regression checks via Docker (CI-compatible)
pnpm tests:playwright:visual:docker:update  # Update Linux snapshots via Docker
pnpm tests:lhci:perfo                       # Lighthouse CI performance checks
```

## Accessibility Testing

`axe/axe.spec.ts` runs [axe-core](https://github.com/dequelabs/axe-core) via `@axe-core/playwright`, one test per page from `helpers/urls.json`.

The suite distinguishes a hard failure from a known, accepted warning:

```typescript
const PATH_CONFIGS: Record<string, { warningRuleIds?: string[] }> = {
  "/auth/signin": { warningRuleIds: ["landmark-one-main", "region"] },
}
```

- A known, not-fixed-today violation on a specific page → add its rule ID to that page's `warningRuleIds` in `PATH_CONFIGS` (not globally).
- An element axe should ignore entirely on a page → that page's `excludeSelectors`.
- A violation that applies everywhere → the file-level `GLOBAL_WARNING_RULE_IDS` / `GLOBAL_EXCLUDE_SELECTORS`.

## SEO Testing

`seo/seo.spec.ts` checks title, meta description, robots, canonical URL, heading hierarchy, structured data (JSON-LD), Open Graph tags, and hreflang — one `test.describe` block per page from `helpers/urls.json`:

```typescript
test.describe("Title", () => {
  test("should exist and be non-empty", async ({ page }) => {
    const title = (await page.title()).trim()
    expect(title).not.toBe("")
  })
})
```

- New page to cover → add one entry to `helpers/urls.json`; every check runs against it automatically.
- New check → a new `test.describe` block inside the suite's `for (const path of PATHS)` loop.
- Production-only checks (robots, Heroku references) `test.skip` themselves automatically on other environments.

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

## Lighthouse Performance

`pnpm tests:lhci:perfo` runs Lighthouse CI (`lhci collect`) against every URL in `helpers/urls.json` and writes raw reports to `qa/tests/playwright/perfo/.lighthouseci/` (gitignored, one Lighthouse run per URL).

Each run also records its results in `qa/tests/playwright/perfo/lighthouse-history.md` — a committed Markdown file with one `## <url>` section per page, each holding its own table of category scores (performance, accessibility, best practices, SEO) over time. A new run's row lands under that page's existing section instead of at the end of the file, so a page's trend always stays together. Being plain Markdown, it renders as readable tables directly on GitHub and diffs cleanly in PRs (new rows only).

In CI, the `lhci_perfo` job in `qa.yml` runs `tests:lhci:perfo` and, on success, opens (or updates) a pull request containing the updated `lighthouse-history.md` via `peter-evans/create-pull-request`, targeting the branch that triggered the run. This avoids pushing directly to a protected branch — someone still reviews and merges the trend update like any other change. Trigger it manually via the QA workflow with the **LHCI Performance tests** checkbox and a `base_url` value.
