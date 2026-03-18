---
sidebar_position: 4
sidebar_label: "Testing & QA"
description: "Test suites overview: Vitest unit, Playwright E2E, visual regression, SEO, accessibility, and performance."
---

# Testing & QA

The project has 7 test suites spanning unit, integration, E2E, visual regression, SEO, accessibility, and performance. Vitest handles unit and integration tests. Playwright runs E2E, visual regression, and SEO specs. Accessibility (axe) and performance (Lighthouse) run as standalone tsx scripts.

## Suite Overview

| Suite                | Framework       | Location                      | Command                          |
| -------------------- | --------------- | ----------------------------- | -------------------------------- |
| Unit (UI)            | Vitest          | `apps/ui/src/lib/__tests__/`  | `pnpm test:ui`                   |
| Integration (Strapi) | Vitest          | `apps/strapi/tests/`          | `pnpm test:strapi`               |
| E2E                  | Playwright      | `qa/tests/playwright/e2e/`    | `pnpm tests:playwright:e2e:test` |
| Visual regression    | Playwright      | `qa/tests/playwright/visual/` | `pnpm tests:playwright:visual`   |
| SEO                  | Playwright      | `qa/tests/playwright/seo/`    | `pnpm tests:playwright:seo`      |
| Accessibility        | axe-core + tsx  | `qa/tests/playwright/axe/`    | `pnpm tests:playwright:axe`      |
| Performance          | @lhci/cli + tsx | `qa/tests/playwright/perfo/`  | `pnpm tests:lhci:perfo`          |

:::warning
All Playwright and QA suites (E2E, visual, SEO, axe, Lighthouse) require a **live running application** at `BASE_URL`. They do NOT start a test server — you must have the app running before executing these tests.
:::

## Vitest Unit Tests (apps/ui)

**Config:** `apps/ui/vitest.config.ts` — environment `node`, include `src/**/*.test.ts`, path alias `@` to `./src`.

**Location:** `apps/ui/src/lib/__tests__/[module].test.ts`

**How to add a test:**

1. Create `apps/ui/src/lib/__tests__/[module].test.ts`
2. Import and test the target module
3. Run: `pnpm test:ui`

:::tip
ESLint enforces testing style: use `it` (not `test`), lowercase `it` titles, max 3 nested `describe` levels, hooks at top of describe block, blank lines required around `describe`, `it`, and `expect` groups.
:::

## Vitest Integration Tests (apps/strapi)

**Config:** `apps/strapi/vitest.config.ts`

**Location:** `apps/strapi/tests/[feature].test.ts`

**Helper:** `apps/strapi/tests/helpers/strapi.ts` — provides `setupStrapi()`, `teardownStrapi()`, and a `strapi` proxy.

**How to add a test:**

1. Create `apps/strapi/tests/[feature].test.ts`
2. Import helpers from `./helpers/strapi`
3. Use 60s `beforeAll` timeout and 30s `afterAll` timeout
4. Run: `pnpm test:strapi`

:::warning
Integration tests boot a real Strapi instance — a database connection is required.
:::

## Playwright E2E Tests

**Config:** `qa/tests/playwright/playwright.config.ts`

| Setting              | Value                                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| Projects             | Chromium, Firefox, WebKit                                               |
| Mobile viewports     | Pixel 7, iPhone 15 (opt-in via `MOBILE_VIEWPORTS_TESTING_ENABLED=true`) |
| CI retries           | 2                                                                       |
| CI workers           | 3                                                                       |
| `BASE_URL`           | From env var                                                            |
| Artifacts on failure | trace, screenshot, video                                                |

**How to add a test:**

1. Create `qa/tests/playwright/e2e/[feature].spec.ts`
2. Import from `@playwright/test`
3. Use `page.goto(path)` relative to `BASE_URL`
4. Run: `pnpm tests:playwright:e2e:test`

**Example pattern:**

```typescript
// qa/tests/playwright/e2e/feature.spec.ts
import { expect, test } from "@playwright/test"

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/path")
    await page.waitForLoadState("networkidle")
  })

  test("should do specific thing", async ({ page }) => {
    await expect(page).toHaveTitle(/.+/)
  })
})
```

## Visual Regression Tests

**Location:** `qa/tests/playwright/visual/visual.spec.ts`

**URL source:** `qa/tests/playwright/helpers/urls-all-components-page.json`

**Behavior:**

- Aborts non-essential requests (only fonts, documents, stylesheets, images pass through)
- Injects CSS to disable all animations and transitions
- Hides `img`, `video`, and `#logo-carousel` elements
- Full-page screenshots with 2% comparison threshold
- First run creates baseline and skips comparison; subsequent runs compare against baseline

**How to add pages:**

1. Add URL paths to `qa/tests/playwright/helpers/urls-all-components-page.json`
2. Delete existing baseline screenshot to re-baseline
3. Run: `pnpm tests:playwright:visual`

## SEO Tests

**Location:** `qa/tests/playwright/seo/seo.spec.ts`

**URL source:** `qa/tests/playwright/helpers/urls.json`

**Playwright project:** `seo` — dedicated project with retries disabled, trace/screenshot/video off, parallel execution mode.

**Checks per URL:**

| Check             | Assertion                                                            |
| ----------------- | -------------------------------------------------------------------- |
| Page title        | Exists and non-empty                                                 |
| Meta description  | `meta[name='description']` content non-empty                         |
| Canonical tag     | Exactly one `link[rel='canonical']`, absolute href, returns HTTP 2xx |
| H1                | Exactly one, non-empty text                                          |
| Heading hierarchy | No skipped levels (each level increments by at most 1)               |
| JSON-LD           | At least one `script[type='application/ld+json']`, all valid JSON    |
| Open Graph        | `og:title` and `og:description` non-empty                            |

**How to add URLs:** Add paths to `qa/tests/playwright/helpers/urls.json` and run `pnpm tests:playwright:seo`.

## Accessibility Tests (axe)

**Location:** `qa/tests/playwright/axe/axe-test.ts`

:::warning
This is a **standalone Node script** run via `tsx`, NOT a Playwright test spec.
:::

**Command:** `pnpm tests:playwright:axe` (maps to `tsx axe/axe-test.ts`)

**URL source:** `qa/tests/playwright/helpers/urls.json`

**Behavior:**

- Opens Chromium via `playwright/chromium`
- Runs `@axe-core/playwright` `AxeBuilder.analyze()` on each URL
- Separates violations into errors (cause test failure) and warnings (reported but pass) via `WARNING_RULE_IDS`
- Writes timestamped text report to `axe/reports/`
- Exits non-zero if any page has errors or analysis failures

**How to add pages:**

1. Add URL paths to `qa/tests/playwright/helpers/urls.json`
2. Optionally add rule IDs to `WARNING_RULE_IDS` in `axe-test.ts` to downgrade known violations to warnings
3. Run: `pnpm tests:playwright:axe`

## Lighthouse Performance Tests

**Location:** `qa/tests/playwright/perfo/lhci.ts`

:::warning
This is a **standalone Node script** run via `tsx`, NOT a Playwright test spec.
:::

**Command:** `pnpm tests:lhci:perfo` (maps to `tsx perfo/lhci.ts`)

**URL source:** `qa/tests/playwright/helpers/urls.json`

**Behavior:**

- Requires `BASE_URL` env var
- Constructs full URLs: `BASE_URL + path` for each entry in `urls.json`
- Runs `lhci collect --url ... --numberOfRuns=1`
- Output directory: `perfo/.lighthouseci/`
- Exits non-zero if LHCI fails

**How to add pages:** Add paths to `qa/tests/playwright/helpers/urls.json` and run `pnpm tests:lhci:perfo`.

## URL Fixture Files

Two JSON fixture files control which pages are tested:

| File                            | Used by              | Path                                                        |
| ------------------------------- | -------------------- | ----------------------------------------------------------- |
| `urls.json`                     | SEO, axe, Lighthouse | `qa/tests/playwright/helpers/urls.json`                     |
| `urls-all-components-page.json` | Visual regression    | `qa/tests/playwright/helpers/urls-all-components-page.json` |

:::tip
To add a page to SEO, accessibility, and performance checks, add it to `urls.json`. For visual regression, add it to `urls-all-components-page.json`.
:::

See [Commands Reference](./commands.md) for the full list of test commands.
