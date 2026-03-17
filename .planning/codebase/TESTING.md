# Testing Patterns

**Analysis Date:** 2026-03-17

## Test Framework

**Runner (Unit/Integration):**

- Vitest — used in both `apps/ui` and `apps/strapi`
- `apps/ui` config: `apps/ui/vitest.config.ts`
- `apps/strapi` config: `apps/strapi/vitest.config.ts`

**Runner (E2E / Visual / SEO):**

- Playwright — used in `qa/tests/playwright/`
- Config: `qa/tests/playwright/playwright.config.ts`

**Assertion Library:**

- Vitest built-in (`expect`)
- Playwright built-in (`expect` from `@playwright/test`)

**Run Commands:**

```bash
pnpm test                        # Run all vitest tests across monorepo (turbo)
pnpm test:ui                     # Run only apps/ui vitest tests
pnpm test:strapi                 # Run only apps/strapi vitest tests
pnpm test:ci                     # All tests except strapi (turbo filter)

# Per-app (from app directory)
pnpm test                        # vitest run (single pass)
pnpm test:watch                  # vitest (watch mode)

# Playwright
pnpm tests:playwright:e2e:test           # Run e2e tests headless
pnpm tests:playwright:e2e:test:interactive  # Run e2e tests in Playwright UI
pnpm tests:playwright:visual             # Run visual regression tests
pnpm tests:playwright:seo                # Run SEO checks
pnpm tests:playwright:axe                # Run accessibility (axe) checks
```

## Test File Organization

**Unit Tests (apps/ui):**

- Location: `src/lib/__tests__/` — co-located under `__tests__` subdirectory alongside source
- Naming: `[module].test.ts`
- Example: `apps/ui/src/lib/__tests__/dates.test.ts` tests `apps/ui/src/lib/dates.ts`

**Integration Tests (apps/strapi):**

- Location: `apps/strapi/tests/` — separate `tests/` directory at app root
- Naming: `[feature].test.ts`
- Helpers: `apps/strapi/tests/helpers/` — shared setup/teardown utilities

**E2E / Playwright Tests:**

- Location: `qa/tests/playwright/`
- Subdirectories by type: `e2e/`, `visual/`, `seo/`
- Naming: `*.spec.ts`

**ESLint test file detection patterns** (from `packages/eslint-config/src/utils/helpers.js`):

```
**/*.test.*
**/*_test.*
**/*Test.*
**/*.spec.*
**/*_spec.*
**/*Spec.*
**/__tests__/**/*
**/__integration__/**/*
**/__regression__/**/*
**/__mocks__/**/*
```

## Test Structure

**Suite Organization (Vitest):**

```typescript
import { beforeAll, describe, expect, it } from "vitest"

// Top-level setup (when needed)
beforeAll(() => {
  setupDayJs()
})

describe("module/feature name", () => {
  describe("functionName", () => {
    it("does specific thing given specific input", () => {
      const result = functionName(input)
      expect(result).toBe(expectedValue)
    })
  })
})
```

**Naming rules:**

- Use `it` not `test` — enforced by `vitest/consistent-test-it: { fn: "it" }`
- `describe` titles may be any case; `it` titles must be lowercase — `vitest/prefer-lowercase-title`
- Maximum 3 nested `describe` levels — `vitest/max-nested-describe: { max: 3 }`
- No duplicate `describe`/`it` hooks — `vitest/no-duplicate-hooks`
- Hooks (`beforeAll`, `beforeEach`, etc.) must be declared at the top of describe blocks — `vitest/prefer-hooks-on-top`

**Strapi Integration Test Structure:**

```typescript
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { setupStrapi, strapi, teardownStrapi } from "./helpers/strapi"

describe("App Test Suite", () => {
  beforeAll(async () => {
    await setupStrapi()
  }, 60000) // 30s timeout for Strapi boot

  afterAll(async () => {
    await teardownStrapi()
  }, 30000)

  describe("feature group", () => {
    it("verifies behavior", () => {
      expect(strapi).toBeDefined()
    })
  })
})
```

**Playwright Test Structure:**

```typescript
import { expect, test } from "@playwright/test"

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" })
    await page.waitForLoadState("networkidle")
  })

  test("should do specific thing", async ({ page }) => {
    await expect(page).toHaveTitle(/.+/)
  })
})
```

**Padding rules** (enforced by `vitest/padding-around-*` rules):

- Blank lines required before and after `beforeAll`, `beforeEach`, `afterAll`, `afterEach` blocks
- Blank lines required before and after `describe` blocks
- Blank lines required before and after `it`/`test` blocks
- Blank lines required before and after `expect` groups

## Mocking

**Framework:** Vitest built-in mock utilities (`vi.fn()`, `vi.mock()`, `vi.spyOn()`)

No `__mocks__` directories detected in the current codebase. Mocking is minimal given low test coverage.

**Strapi test isolation:**
The Strapi integration tests use a real Strapi instance with an in-memory/temp database rather than mocking. The `setupStrapi` helper in `apps/strapi/tests/helpers/strapi.ts` boots a full Strapi instance in a temp directory:

```typescript
// apps/strapi/tests/helpers/strapi.ts
export const setupStrapi = async () => {
  if (!instance) {
    const options = {
      appDir: process.cwd(),
      distDir: resolve(process.cwd(), "dist"),
      autoReload: false,
      serveAdminPanel: false,
    }
    await compileStrapi(options)
    instance = await createStrapi(options).load()
    instance.server.mount()
  }
  return { instance }
}
```

**`strapi` proxy export** — allows tests to reference `strapi` before `setupStrapi` completes:

```typescript
export const strapi = new Proxy({} as Core.Strapi, {
  get(_, prop) {
    if (!instance)
      throw new Error("Strapi not initialized. Call setupStrapi() first.")
    return (instance as unknown as Record<string, unknown>)[prop as string]
  },
})
```

**ESLint mock rules:**

- `vitest/prefer-spy-on`: OFF (manual `vi.fn()` assignment acceptable)
- `vitest/no-mocks-import`: OFF (importing from `__mocks__` allowed)

**What to Mock:**

- External services and HTTP calls for unit tests
- Environment variables via `process.env` overrides

**What NOT to Mock:**

- The Strapi instance in integration tests — a real instance is spun up
- Core library logic being tested

## Fixtures and Factories

**Test Data:**

- Inline literals used directly in test cases (see `dates.test.ts`)
- No factory helpers or fixture files detected in current test suite
- Playwright tests load URL lists from JSON fixtures: `qa/tests/playwright/helpers/urls-all-components-page.json` and `helpers/urls.json`

**Location:**

- JSON fixtures: `qa/tests/playwright/helpers/*.json`
- Strapi test helpers: `apps/strapi/tests/helpers/strapi.ts`

## Coverage

**Configuration:**

- `apps/ui/vitest.config.ts` configures coverage reporters: `["text", "json", "html"]`
- `apps/strapi/vitest.config.ts` does not configure coverage reporters

**Requirements:** No coverage thresholds enforced (no `coverage.thresholds` in any config)

**View Coverage:**

```bash
# From apps/ui directory
pnpm vitest run --coverage

# Output formats: text (terminal), JSON (coverage/coverage-final.json), HTML (coverage/index.html)
```

## Test Types

**Unit Tests:**

- Scope: Pure utility functions
- Location: `apps/ui/src/lib/__tests__/`
- Approach: Input/output assertions with no mocking required
- Example: `dates.test.ts` tests all exported functions from `dates.ts` with concrete values

**Integration Tests:**

- Scope: Full Strapi application bootstrap — content types, schemas, server startup
- Location: `apps/strapi/tests/`
- Approach: Real Strapi instance in temp directory; assertions on `strapi.contentTypes` object
- Timeout: 60s for `beforeAll` (Strapi boot), 30s for `afterAll` (teardown)

**E2E Tests (Playwright):**

- Location: `qa/tests/playwright/e2e/`
- Scope: User flows in running application
- Browsers: Chromium, Firefox, WebKit (desktop); optionally Pixel 7 / iPhone 15 via `MOBILE_VIEWPORTS_TESTING_ENABLED=true`
- CI: 2 retries, 3 parallel workers

**Visual Regression Tests:**

- Location: `qa/tests/playwright/visual/`
- Approach: Full-page screenshot comparison with 2% pixel threshold (`threshold: 0.02`)
- Baseline creation: Auto-creates baseline on first run if missing; skips comparison
- Optimizations: Aborts font/image requests, disables animations via injected CSS, hides dynamic elements

**SEO Tests:**

- Location: `qa/tests/playwright/seo/`
- Project: Dedicated `seo` Playwright project (no retries, no trace/video/screenshot)
- Checks: Page title, meta description, canonical tag (absolute + reachable), H1 count and content, heading hierarchy order, JSON-LD structured data validity, Open Graph tags
- Mode: `test.describe.configure({ mode: "parallel" })` — all URL checks run in parallel

**Accessibility Tests:**

- Location: `qa/tests/playwright/axe/` (script via `tsx axe/axe-test.ts`)
- Tool: `@axe-core/playwright`

## Common Patterns

**Async Testing (Vitest):**

```typescript
it("handles async result", async () => {
  const result = await someAsyncFunction()
  expect(result).toBe(expectedValue)
})
```

**Setup with lifecycle hooks:**

```typescript
beforeAll(async () => {
  await setupStrapi()
}, 60_000) // explicit timeout as second argument

afterAll(async () => {
  await teardownStrapi()
}, 30_000)
```

**Preferring resolves for promise assertions:**

- `vitest/prefer-expect-resolves: error` — use `await expect(promise).resolves.toBe(x)` instead of `expect(await promise).toBe(x)`

**Snapshot rules:**

- Max snapshot size: 100 lines, inline max: 20 lines — `vitest/no-large-snapshots`
- Prefer `it.todo("description")` over empty test bodies — `vitest/prefer-todo: error`

**Iterative tests:**

```typescript
// Prefer .each over manual loops
it.each([
  ["2024-03-15", "15/03/24"],
  ["2024-01-01", "01/01/24"],
])("formats %s as %s", (input, expected) => {
  expect(formatDate(input)).toBe(expected)
})
// vitest/prefer-each: error
```

**Error Testing:**

```typescript
it("throws on invalid input", () => {
  expect(() => riskyFunction(badInput)).toThrow()
})

// For async:
await expect(asyncFn()).rejects.toThrow("expected message")
```

**Playwright — waiting for page state:**

```typescript
await page.goto(url, { waitUntil: "domcontentloaded" })
await page.waitForLoadState("networkidle")
```

**Playwright — custom assertion messages:**

```typescript
expect(
  value,
  ["Error description", `URL: ${page.url()}`, `Value: "${value}"`].join("\n")
).not.toBe("")
```

---

_Testing analysis: 2026-03-17_
