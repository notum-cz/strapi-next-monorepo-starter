---
name: write-tests
description: >
  Use when asked to add or extend automated tests — e.g. "write test",
  "add test", "cover X with tests", "reproduce with a test", "test
  this", "e2e test", "playwright test". Covers Vitest (apps/ui,
  apps/strapi) and Playwright (qa/tests/playwright: e2e, visual, axe,
  seo).
argument-hint: "[file-or-feature-to-cover]"
---

# Write Tests

Add or extend tests using the starter's existing conventions. Do not introduce new test frameworks. Do not invent new helpers when an existing one fits.

Reference: `apps/docs/docs/reference/testing/overview.md` (layers), `unit-testing.md` (Vitest), `playwright.md` (browser QA).

## Decide the test layer first

Pick before writing. Wrong layer = wasted test.

| Goal                                                                               | Layer                          | Where                                                                                                                            |
| ---------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Pure function / utility / hook (no network, no DOM)                                | **Vitest unit** (`apps/ui`)    | `*.test.ts` next to source (`apps/ui/src/**/*.test.ts`)                                                                          |
| Strapi service / util / schema / middleware behaviour                              | **Vitest** (`apps/strapi`)     | `apps/strapi/tests/**/*.test.ts`                                                                                                 |
| Critical-path browser flow against the real app/backend (POM)                      | **Playwright e2e/smoke**       | spec: `qa/tests/playwright/e2e/smoke/*.spec.ts`, page object: `qa/tests/playwright/helpers/pages/<Page>Page.ts`                  |
| UI behavior that needs a specific/edge-case backend response (POM + route mocking) | **Playwright e2e/mock**        | spec: `qa/tests/playwright/e2e/mock/*.spec.ts`, same page objects, network stubbed via `qa/tests/playwright/helpers/fixtures.ts` |
| Pure HTTP check (status/redirect/JSON), no browser needed                          | **Playwright e2e** (`request`) | `qa/tests/playwright/e2e/smoke/*.spec.ts` — no POM, use the `request` fixture directly                                           |
| Visual regression                                                                  | **Playwright visual**          | `qa/tests/playwright/visual/*.spec.ts`                                                                                           |
| Accessibility                                                                      | **Playwright axe**             | `qa/tests/playwright/axe/*.spec.ts`                                                                                              |
| SEO meta, head, robots                                                             | **Playwright seo**             | `qa/tests/playwright/seo/*.spec.ts`                                                                                              |

Unit > integration > e2e. Push tests down the pyramid when behavior allows.

## Phase 1 — Locate convention

Before writing, read **one existing test in the same layer** to mirror style:

- UI unit ref: `apps/ui/src/lib/dates.test.ts`
- Strapi pure-logic ref: `apps/strapi/tests/hierarchy-compute.test.ts`
- Strapi schema-from-disk ref: `apps/strapi/tests/app.test.ts` (reads `schema.json` directly — no Strapi boot)
- Strapi service-with-mocked-`strapi`-global ref: `apps/strapi/tests/revalidate.test.ts` (`vi.stubGlobal("strapi", …)`)
- Playwright e2e/smoke ref: `qa/tests/playwright/e2e/smoke/homepage.spec.ts`
- Playwright e2e/mock ref: `qa/tests/playwright/e2e/mock/sign-in.spec.ts`
- `qa/tests/playwright/e2e/test_example.spec.ts` predates the smoke/mock split and the POM convention — it still runs (matched by the broad `e2e` test-path pattern), but don't copy its direct `page.goto` style into a new spec.
- Playwright visual ref: `qa/tests/playwright/visual/visual.spec.ts`
- Playwright axe ref: `qa/tests/playwright/axe/axe.spec.ts`
- Playwright seo ref: `qa/tests/playwright/seo/seo.spec.ts`

Match imports, helper usage, describe/it nesting, naming.

## Phase 2 — Write the test

### Vitest (UI + Strapi)

- Import from `vitest`: `describe`, `it`, `expect`, `beforeAll`, `afterAll`.
- `globals: true` already set — but **still import explicitly** (matches existing code).
- File pattern: `*.test.ts`. UI include: `src/**/*.test.ts`. Strapi include: `tests/**/*.test.ts`.
- Path alias `@` resolves to `apps/ui/src` (UI tests only).
- **Strapi tests do not boot Strapi.** Import the unit under test directly and either keep it pure, read `schema.json` from disk (`app.test.ts`), or mock the `strapi` global with `vi.stubGlobal("strapi", …)` (`revalidate.test.ts`). There is no `setupStrapi` helper — do not add a DB or a real instance.

### Playwright — e2e (Page Object Model)

Any e2e spec that drives the browser (navigation, clicks, assertions on rendered content) uses the **Page Object Model**, whether it's a smoke or a mock spec. Every page under test gets one POM class in `qa/tests/playwright/helpers/pages/<Page>Page.ts`, shared by both its smoke and mock specs — a page has one POM, not one per test kind.

Pure HTTP checks (status code, redirect location, JSON body via the `request` fixture — no DOM involved) skip the POM entirely.

#### Smoke vs mock — which folder

- **`e2e/smoke/`** — drives the browser against the real running app and its real backend. Small, critical-path set: does the page load, does the core flow complete. This is what plain e2e specs were before the split; `test_example.spec.ts` is that older, pre-POM style.
- **`e2e/mock/`** — drives the browser but stubs the network layer with [Playwright's route mocking](https://playwright.dev/docs/mock), via the shared fixture in `qa/tests/playwright/helpers/fixtures.ts` (built with [Playwright's test-fixtures pattern](https://playwright.dev/docs/test-fixtures)). Use it for backend states that are hard or slow to produce for real — a specific error shape, a dropped connection, data that would need seeding — not to re-test something the real backend already exercises for free in a smoke spec. If a scenario doesn't need a specific stubbed response, it belongs in `smoke/`, not `mock/`.

`qa/tests/playwright/helpers/fixtures.ts` exports a `test`/`expect` pair extended with a `mockJson` fixture (fulfills a route with a JSON body/status, no real request made). Import from there instead of `@playwright/test` in a mock spec. For a non-JSON case (e.g. simulating a dropped connection), call `page.route(url, (route) => route.abort())` directly — the fixture doesn't need to cover everything Playwright's routing API already does.

#### POM class template

```typescript
import type { Locator, Page } from "@playwright/test"

export class ExamplePage {
  private readonly page: Page

  readonly heading: Locator
  readonly editButtons: Locator
  readonly editFooButton: Locator // editButtons.nth(0)

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole("heading", { name: "Example", exact: true })
    this.editButtons = page.getByRole("button", { name: "Edit", exact: true })
    this.editFooButton = this.editButtons.nth(0)
  }

  async goTo() {
    const response = await this.page.goto("/example", {
      waitUntil: "domcontentloaded",
    })
    await this.page.waitForLoadState("networkidle")

    return response
  }
}
```

Rules:

- `import type { Locator, Page }` as a top-level type import, not an inline `{ type Locator }` specifier.
- Multiple elements with the same accessible name → `.nth(0)`, `.nth(1)`, exposed as named locators (not raw indices in the spec).
- Dialog locators are scoped: `page.getByRole("dialog").getByRole(...)`, never a bare `page.getByRole(...)` that could match content behind the dialog.
- POM classes do NOT import `expect` and do NOT define assertion methods — they only expose locators and navigation/interaction methods. Assertions live in the spec.
- `goTo()` returns the navigation `Response` when the spec needs to assert on it (e.g. a smoke test checking `response?.ok()`); otherwise it can return `void`.

#### Spec file template — smoke

Specs live one level deeper than before (`e2e/smoke/`, `e2e/mock/`), so the import path back to `helpers/` is `../../helpers/...`, not `../helpers/...`.

```typescript
import { expect, test } from "@playwright/test"

import { ExamplePage } from "../../helpers/pages/ExamplePage"

test.describe("Example page", () => {
  let examplePage: ExamplePage

  test.beforeEach(async ({ page }) => {
    examplePage = new ExamplePage(page)
    await examplePage.goTo()
  })

  test("shows page heading", async () => {
    await expect(examplePage.heading).toBeVisible()
  })
})
```

Use `test.beforeEach` to construct the POM and navigate once a file has more than one test. For a single-test file, skip `beforeEach` and construct the POM directly inside the one `test(...)` instead.

- Navigation is handled by `goTo()` on the POM — never call `page.goto()` directly in a new spec.
- Prefer role-based locators (`getByRole`) over CSS selectors — more resilient to markup changes.
- Do not hardcode ports/hosts — `baseURL` comes from `BASE_URL` (set in `playwright.config.ts`'s `use.baseURL`).

#### Spec file template — mock

Same POM, imported from `test`/`expect` re-exported by the fixtures file instead of `@playwright/test` directly, so `mockJson` is available on the test context:

```typescript
import { ExamplePage } from "../../helpers/pages/ExamplePage"
import { expect, test } from "../../helpers/fixtures"

test.describe("Example page — mocked backend", () => {
  test("shows an error when the backend rejects the request", async ({
    page,
    mockJson,
  }) => {
    await mockJson(
      "**/api/example",
      { message: "Something went wrong" },
      { status: 500 }
    )

    const examplePage = new ExamplePage(page)
    await examplePage.goTo()

    await expect(page.getByText("Something went wrong")).toBeVisible()
  })
})
```

Set up the route mock **before** navigating/triggering the request it intercepts — a mock registered after the request has already fired does nothing.

#### Checklist when adding a new e2e page

1. Create `qa/tests/playwright/helpers/pages/<Page>Page.ts` with locators + a `goTo()` method. One POM, reused by both its smoke and mock specs.
2. Decide smoke, mock, or both (see "Smoke vs mock — which folder" above).
3. Create `qa/tests/playwright/e2e/smoke/<page>.spec.ts` and/or `qa/tests/playwright/e2e/mock/<page>.spec.ts`, importing the POM as `../../helpers/pages/<Page>Page`.
4. Keep assertions in the spec, not the POM.
5. If the flow doesn't touch the DOM at all (pure status/redirect/JSON check), skip the POM and use the `request` fixture directly instead.

### Playwright — visual, axe, seo

- **Visual**: reads its path list from `qa/tests/playwright/helpers/urls.json`, shared by every Playwright suite (see `visual.spec.ts`). If no baseline snapshot exists yet for a page/browser combination, the spec creates one and skips comparison for that run instead of failing — inspect a newly created baseline before committing it. Update existing baselines only when the change is intentional: `pnpm tests:playwright:visual:update` (local OS) or `pnpm tests:playwright:visual:docker:update` (Linux, commit-ready — matches what CI compares against).
- **Axe**: add per-page exceptions via `GLOBAL_WARNING_RULE_IDS` / `PATH_CONFIGS` in `axe.spec.ts` rather than skipping a page outright — a known, unfixable violation becomes a warning, not a silent gap.
- **SEO**: mirror `seo.spec.ts`'s per-page `test.describe` blocks (Title, Meta description, Robots, Canonical, H1, Heading hierarchy, Structured data, Open Graph).
- Do not hardcode ports/hosts — always resolve via `BASE_URL` / `baseURL`.

## Phase 3 — Naming + structure

- One `describe` per unit-under-test (function, component, route).
- One `it` per behavior. Behavior phrased as outcome: `it("returns null when input is empty")`, not `it("test 1")`.
- AAA: arrange, act, assert. Separate with a blank line if it aids reading.
- No console.log left behind. No `.only` / `.skip` committed.
- Strapi tests mock the `strapi` global where needed (`vi.stubGlobal`); they never connect to a real database.

## Phase 4 — Run

Run only the relevant package, not the whole monorepo, while iterating.

| Test                                           | Command                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| UI unit (all)                                  | `pnpm test:ui`                                                      |
| Strapi unit (all)                              | `pnpm test:strapi`                                                  |
| Single Vitest file                             | `pnpm --filter @repo/ui exec vitest run <path>` (or `@repo/strapi`) |
| Vitest watch                                   | `pnpm --filter @repo/ui test:watch`                                 |
| Playwright e2e (smoke + mock)                  | `pnpm tests:playwright:e2e:test`                                    |
| Playwright e2e smoke only                      | `pnpm tests:playwright:e2e:smoke`                                   |
| Playwright e2e mock only                       | `pnpm tests:playwright:e2e:mock`                                    |
| Playwright e2e interactive                     | `pnpm tests:playwright:e2e:test:interactive`                        |
| Playwright visual                              | `pnpm tests:playwright:visual`                                      |
| Playwright visual (Docker, Linux-matched)      | `pnpm tests:playwright:visual:docker`                               |
| Playwright axe                                 | `pnpm tests:playwright:axe`                                         |
| Playwright seo                                 | `pnpm tests:playwright:seo`                                         |
| Update visual snapshots (local OS)             | `pnpm tests:playwright:visual:update`                               |
| Update visual snapshots (Docker, commit-ready) | `pnpm tests:playwright:visual:docker:update`                        |
| LHCI performance collect                       | `pnpm tests:lhci:perfo`                                             |
| All workspace tests                            | `pnpm test`                                                         |

Playwright requires a running app (`pnpm dev` or built+started). If e2e fails with connection refused, start the app first.

## Phase 5 — Verify before reporting done

1. Run the new test — it must pass.
2. Run the file's full suite — no regressions.
3. If reproducing a bug: first confirm the test **fails** without the fix, then apply the fix, then confirm it **passes**. Do not skip the failing step.
4. Snapshot updates: never update without inspecting the diff visually.

## Report

Print:

```
Tests added: <n>
Files: <paths>
Layer: vitest-ui | vitest-strapi | playwright-e2e-smoke | playwright-e2e-mock | playwright-visual | playwright-axe | playwright-seo
Result: pass
Command: <exact command to re-run>
```

## Notes

- Do not add new dev dependencies for testing without explicit user request.
- Do not introduce Jest, Mocha, Cypress, or other competing frameworks. POM is the one exception to "match what's already there" — it's the required pattern for new e2e page-interaction specs even though the existing `test_example.spec.ts` predates it (and the smoke/mock split).
- No Cucumber/Gherkin runner is wired in either — `qa/docs/test-cases/` (see `write-test-cases`) is documentation, not executable. Don't add a step-definition framework to make it runnable.
- Coverage reports configured in `vitest.config.ts` — don't reconfigure per-test.
- Strapi tests run in a `node` environment without booting Strapi — keep them fast and focused; isolate logic so it's testable without a running instance.
- Playwright `MOBILE_VIEWPORTS_TESTING_ENABLED=true` env var opts in mobile projects (see `playwright.config.ts`).
- Visual snapshots are platform-sensitive — generated on macOS may diff on CI. Note in PR if you regenerated locally.
