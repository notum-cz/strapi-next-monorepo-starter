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

### Test groups

Every test carries a feature tag (`@homepage`, `@auth`, …). `helpers/test-groups.ts` lists the groups and says which of them are live on each environment:

```typescript
export const TEST_GROUPS = ["homepage", "auth"] as const

export const ENV_GROUPS: Record<TestEnv, readonly TestGroup[] | "all"> = {
  dev: "all",
  stg: "all",
  prod: "all",
}
```

Every environment runs every group by default. Narrow an environment to a list (`prod: ["homepage"]`) once a feature is deployed there later than on the others.

`playwright.config.ts` turns the selection into its `grep`, so only tests tagged with a selected group run:

| Situation                              | Groups that run                         |
| -------------------------------------- | --------------------------------------- |
| `QA_GROUPS` set (`QA_GROUPS=homepage`) | exactly those, on any environment       |
| `QA_GROUPS` unset or `auto`            | `ENV_GROUPS` for the environment tested |
| local host (`localhost`, docker)       | every group                             |

The environment comes from the `BASE_URL` hostname: a `dev` or `stg`/`staging` segment. A segment is a hostname part delimited by `-` or `.`. Any other host counts as production (`www.example.com`, but also a preview domain such as `*.vercel.app`), so an unrecognised domain never runs `@no-prod` tests. Only `localhost`, `127.0.0.1`, `[::1]` and `host.docker.internal` are local. An unknown name in `QA_GROUPS` fails the run with the list of valid ones.

```bash
QA_GROUPS=homepage pnpm tests:playwright:axe
```

| Group      | E2E specs        | `urls.json` suites      |
| ---------- | ---------------- | ----------------------- |
| `homepage` | `smoke/homepage` | seo, axe, visual, perfo |
| `auth`     | `mock/sign-in`   |                         |

A describe with several tags runs when any of them is selected.

- **Promoting a feature** → add its group to `ENV_GROUPS` for the next environment. One line in a PR.
- **New spec** → give every top-level `test.describe` a group tag with `tags("homepage")` from `helpers/test-groups.ts` (`tags("auth", "no-prod")` for several). The first name must be a group. A nested test that only has to stay off production takes `NO_PROD` instead, because its describe already carries the group. Never put `NO_PROD` on a top-level describe, where it leaves the tests with no group. `tags()` throws on an unknown name while the spec file loads, so a typo fails every run instead of silently dropping the test from stg, prod and `QA_GROUPS` runs. Don't write `{ tag: … }` by hand. Nothing checks it, so a typo there silently drops the test. An untagged test still never runs while a selection is active, so check with `BASE_URL=http://localhost:3000 QA_GROUPS= pnpm -F @repo/tests-playwright exec playwright test --list --pass-with-no-tests --grep-invert "@(homepage|auth)(?![\w-])"` from the monorepo root, which must list `Total: 0 tests`. The alternation lists `TEST_GROUPS`, so the audit counts only a feature-group tag, not any `@` word such as an email in a title. The localhost `BASE_URL` and the empty `QA_GROUPS` (which also beats one set in `.env`) switch the group filter in `playwright.config.ts` off for the check. A CLI `--grep` does not replace it.
- **New group** → add it to `TEST_GROUPS`, to `ENV_GROUPS` where it is live, to the `groups` parameter values in `.azuredevops/pipelines/qa.yml`, and to the alternation of the audit command above (and in the `write-tests` skill). The GitHub Actions `groups` input is free text and needs no change.

The package scripts pass `--pass-with-no-tests`, so a selection with nothing in one suite (only `auth` for AXE, say) keeps the job green. LHCI is not Playwright and filters `urls.perfo` by the same selection itself.

### Against production

A spec that cannot pass on production, or must not change data there, gets `"no-prod"` in its `tags(…)`, with a one-line comment saying why. `playwright.config.ts` sets `grepInvert: /@no-prod/` whenever the environment resolves to `prod`, so the filter applies to local runs and the VS Code extension as well, not only to the pipeline. A feature that is simply not deployed on production yet needs no tag, because its group is missing from `ENV_GROUPS.prod`. LHCI is not Playwright and ignores the tag.

### Page lists

`helpers/urls.json` holds the pages each generated suite (`seo`, `axe`, `visual`, `perfo`) checks, keyed by group. A group is one list for every environment, or one list per environment when the content differs:

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

A group split per environment contributes the list for the environment tested, or every list merged and deduped for a local host. A group missing an environment's key has no pages there. A group key outside `TEST_GROUPS`, or an environment key other than `dev`, `stg` and `prod`, makes `urlsByGroup` throw when the suite loads. TypeScript would not catch either, since an object imported from JSON skips excess property checks. Without the check a mistyped key silently leaves that group or environment with no pages, and the job passes with zero tests. `BASE_URL` is required and must include the scheme (`https://…`). When it is unset or can't be parsed, the suites throw an error asking you to fill it in `.env`.

To cover a new page, add it under its group in the right suite. It is picked up automatically, no spec file changes needed.

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

- New page to cover → add it under its group in `helpers/urls.json`. Every check runs against it automatically.
- New check → a new `test.describe` block inside the suite's `for (const { group, path } of PATHS)` loop.
- Production-only checks (robots, Heroku references) `test.skip` themselves on every environment that does not [resolve to production](#test-groups), including local runs.
- A page that does not answer with a 2xx status fails every check with its status, as in AXE, visual and LHCI.

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

`pnpm tests:lhci:perfo` runs Lighthouse CI (`lhci collect`) against the `urls.perfo` pages in `helpers/urls.json` for the selected [test groups](#test-groups) and writes raw reports to `qa/tests/playwright/perfo/.lighthouseci/` (gitignored, one Lighthouse run per URL). When no page matches the selection it says so and exits successfully.

Each run also records its results in `qa/tests/playwright/perfo/lighthouse-history.md` — a committed Markdown file with one `## <url>` section per page, each holding its own table of category scores (performance, accessibility, best practices, SEO) over time. A new run's row lands under that page's existing section instead of at the end of the file, so a page's trend always stays together. Being plain Markdown, it renders as readable tables directly on GitHub and diffs cleanly in PRs (new rows only).

In CI, the `lhci_perfo` job in `qa.yml` runs `tests:lhci:perfo` and, on success, opens (or updates) a pull request containing the updated `lighthouse-history.md` via `peter-evans/create-pull-request`, targeting the branch that triggered the run. This avoids pushing directly to a protected branch — someone still reviews and merges the trend update like any other change. Trigger it manually via the QA workflow with the **LHCI Performance tests** checkbox and a `base_url` value.
