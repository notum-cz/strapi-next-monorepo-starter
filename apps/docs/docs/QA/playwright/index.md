---
sidebar_position: 1
---

# Playwright Testing

The Playwright QA suite validates the deployed or local UI through a browser. It covers end-to-end behavior, accessibility, SEO, and visual output. The same workspace also hosts the k6 scripts: Core Web Vitals and load tests.

| Area          | Tooling                | Location                        |
| ------------- | ---------------------- | ------------------------------- |
| E2E — smoke   | Playwright             | `qa/tests/playwright/e2e/smoke` |
| E2E — mock    | Playwright             | `qa/tests/playwright/e2e/mock`  |
| Accessibility | Playwright + axe-core  | `qa/tests/playwright/axe`       |
| SEO           | Playwright             | `qa/tests/playwright/seo`       |
| Visual        | Playwright screenshots | `qa/tests/playwright/visual`    |
| Web Vitals    | k6 browser             | `qa/tests/playwright/perfo`     |
| Load          | k6 (TypeScript)        | `qa/tests/playwright/load`      |

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
├── perfo/                  # k6 Core Web Vitals (see Core Web Vitals)
├── load/                   # k6 load tests (see Load Testing)
├── helpers/                # shared test utilities (page objects, fixtures)
├── .env.example            # example environment variables
├── package.json            # QA package scripts and dependencies
├── playwright.config.ts    # Playwright configuration
└── tsconfig.json           # TypeScript configuration
```

### Test groups

Every test carries a feature tag such as `@homepage` or `@auth`. `helpers/test-groups.ts` lists the groups and which of them are live on each environment:

```typescript
export const TEST_GROUPS = ["homepage", "auth"] as const

export const ENV_GROUPS: Record<TestEnv, readonly TestGroup[] | "all"> = {
  dev: "all",
  stg: "all",
  prod: "all",
}
```

By default every environment runs every group. When a feature reaches production later than dev and staging, narrow that environment to a list, for example `prod: ["homepage"]`, and add the group once it is deployed there.

`playwright.config.ts` turns the selection into its `grep`, so only tests tagged with a selected group run:

| Situation                              | Groups that run                         |
| -------------------------------------- | --------------------------------------- |
| `QA_GROUPS` set (`QA_GROUPS=homepage`) | exactly those, on any environment       |
| `QA_GROUPS` unset or `auto`            | `ENV_GROUPS` for the environment tested |
| local host (`localhost`, docker)       | every group                             |

```bash
QA_GROUPS=homepage pnpm tests:playwright:axe
```

An unknown name in `QA_GROUPS` fails the run and lists the valid ones. A describe with several tags runs when any of them is selected.

The environment comes from the `BASE_URL` hostname. A `dev` segment means dev and a `stg` or `staging` segment means staging, where a segment is a part of the hostname between `-` or `.` characters. `localhost`, `127.0.0.1`, `[::1]` and `host.docker.internal` are local. Every other host counts as production, including preview domains such as `*.vercel.app`, so an unrecognised domain never runs `@no-prod` tests.

| Group      | E2E specs        | `urls.json` suites            |
| ---------- | ---------------- | ----------------------------- |
| `homepage` | `smoke/homepage` | seo, axe, visual, perfo, load |
| `auth`     | `mock/sign-in`   |                               |

The package scripts pass `--pass-with-no-tests`, so a suite with nothing in the selection (AXE with only `auth`, say) still passes. The k6 scripts (Core Web Vitals and load tests) are not Playwright; they pick their `urls.perfo` and `urls.load` pages by the same selection themselves (`helpers/k6/target.ts`).

#### Tagging a spec

- Tag every top-level `test.describe` with `tags("homepage")` from `helpers/test-groups.ts`. For more than one tag, list them: `tags("auth", "no-prod")`. The first name must be a group.
- A nested test that only has to stay off production takes `NO_PROD` from the same file, because its describe already carries the group. Never put `NO_PROD` on a top-level describe: its tests would have no group.
- Don't write `{ tag: … }` by hand. `tags()` throws on an unknown name while the spec file loads, so a typo fails every run. A hand-written tag has no such check, and a typo there silently drops the test from staging, production and `QA_GROUPS` runs.

#### Checking for untagged tests

While a group selection is active, an untagged test never runs. To find one, run this from the monorepo root; it must print `Total: 0 tests`:

```bash
BASE_URL=http://localhost:3000 QA_GROUPS= pnpm -F @repo/tests-playwright exec playwright test --list --pass-with-no-tests --grep-invert "@(homepage|auth)(?![\w-])"
```

The localhost `BASE_URL` and the empty `QA_GROUPS`, which also overrides a value in `.env`, turn off the group filter in `playwright.config.ts`. That matters because a `--grep` on the command line does not replace the config filter, which would hide an untagged test from the check. The alternation lists `TEST_GROUPS`, so only a feature-group tag counts, not any other `@` word such as an email address in a test title.

#### Adding a group

Add the new group to:

1. `TEST_GROUPS`
2. `ENV_GROUPS`, for each environment where it is live
3. the `groups` parameter values in `.azuredevops/pipelines/qa.yml`
4. the alternation in the audit command above, here and in the `write-tests` skill

The GitHub Actions `groups` input is free text and needs no change.

### Against production

A spec that cannot pass on production, or must not change data there, gets `"no-prod"` in its `tags(…)`, with a one-line comment saying why. Whenever the environment resolves to `prod`, `playwright.config.ts` sets `grepInvert: /@no-prod/`. Because the filter lives in the config, it also applies to local runs and the VS Code extension, not only to the pipeline. LHCI never sees Playwright tags, so `@no-prod` does not affect it.

A feature that is not deployed on production yet needs no tag; leave its group out of `ENV_GROUPS.prod` instead.

### Page lists

`helpers/urls.json` holds the pages that the `seo`, `axe`, `visual`, `perfo` and `load` suites check, keyed by group. A group has one list for every environment, or one list per environment when the content differs:

```json
{
  "axe": {
    "homepage": ["/"],
    "blog": {
      "dev": ["/blog", "/blog/draft-article"],
      "stg": ["/blog", "/blog/draft-article"],
      "prod": ["/blog", "/blog/published-article"]
    }
  }
}
```

`urlsByGroup` from `helpers/flatten-urls.ts` returns each path with its group, so every generated test is tagged:

```typescript
import { urlsByGroup } from "../helpers/flatten-urls"
import { tags } from "../helpers/test-groups"
import urls from "../helpers/urls.json"

const PATHS = urlsByGroup(urls.seo)

for (const { group, path } of PATHS) {
  test.describe(`SEO checks on ${path}`, tags(group), () => {
```

For a group split per environment, a run uses the list for the environment under test. A local run merges every list and removes duplicates. If a group has no key for an environment, it has no pages there.

`urlsByGroup` throws when the suite loads if a group key is not in `TEST_GROUPS` or an environment key is not `dev`, `stg` or `prod`. TypeScript can't catch these typos, because an object imported from JSON skips excess property checks. Without the check, a mistyped key would leave that group or environment with no pages, and the job would pass with zero tests.

`BASE_URL` is required and must be an `http://` or `https://` URL. When it is missing or invalid, the suites throw an error asking you to set it in `.env`.

To cover a new page, add it under its group in the right suite. The suites pick it up automatically; no spec file changes are needed.

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
pnpm tests:k6:vitals                        # k6 Core Web Vitals (LCP, CLS, FCP, TTFB)
pnpm tests:k6:load:smoke                    # k6 load test, 1 visit/s for 1 minute
pnpm tests:k6:load:average                  # k6 load test, normal traffic
pnpm tests:k6:load:spike                    # k6 load test, campaign launch (5× surge)
pnpm tests:k6:load:breakpoint               # k6 load test, find the limit and check recovery
```

The k6 scripts have their own pages: [Core Web Vitals (k6)](./web-vitals.md) and [Load Testing (k6)](./load-testing.md).

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

- New page to cover → add it under its group in `helpers/urls.json`. Every check runs against it automatically.
- New check → a new `test.describe` block inside the suite's `for (const { group, path } of PATHS)` loop.
- Production-only checks (robots, Heroku references) `test.skip` themselves on every environment that does not [resolve to production](#test-groups), including local runs.
- A page that does not answer with a 2xx status fails every check with its status, as in AXE, visual and Core Web Vitals.

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

## Core Web Vitals

Page speed is measured with k6, not Lighthouse. See [Core Web Vitals (k6)](./web-vitals.md).
