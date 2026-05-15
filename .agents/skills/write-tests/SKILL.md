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

## Decide the test layer first

Pick before writing. Wrong layer = wasted test.

| Goal | Layer | Where |
|---|---|---|
| Pure function / utility / hook (no network, no DOM) | **Vitest unit** (`apps/ui`) | sibling `__tests__/` dir or `*.test.ts` next to source |
| Strapi service / controller / lifecycle / content-type behaviour | **Vitest integration** (`apps/strapi`) | `apps/strapi/tests/**/*.test.ts` |
| Full browser flow, navigation, user interaction | **Playwright e2e** | `qa/tests/playwright/e2e/*.spec.ts` |
| Visual regression | **Playwright visual** | `qa/tests/playwright/visual/*.spec.ts` |
| Accessibility | **Playwright axe** | `qa/tests/playwright/axe/*.spec.ts` |
| SEO meta, head, robots | **Playwright seo** | `qa/tests/playwright/seo/*.spec.ts` |

Unit > integration > e2e. Push tests down the pyramid when behavior allows.

## Phase 1 — Locate convention

Before writing, read **one existing test in the same layer** to mirror style:

- UI unit ref: `apps/ui/src/lib/__tests__/dates.test.ts`
- Strapi integration ref: `apps/strapi/tests/app.test.ts` (uses `setupStrapi` / `teardownStrapi` helpers)
- Playwright e2e ref: `qa/tests/playwright/e2e/test_example.spec.ts`
- Playwright visual ref: `qa/tests/playwright/visual/visual.spec.ts`
- Playwright axe ref: `qa/tests/playwright/axe/axe.spec.ts`

Match imports, helper usage, describe/it nesting, naming.

## Phase 2 — Write the test

### Vitest (UI + Strapi)

- Import from `vitest`: `describe`, `it`, `expect`, `beforeAll`, `afterAll`.
- `globals: true` already set — but **still import explicitly** (matches existing code).
- File pattern: `*.test.ts`. UI include: `src/**/*.test.ts`. Strapi include: `tests/**/*.test.ts`.
- Path alias `@` resolves to `apps/ui/src`.
- For Strapi tests, always wrap in `beforeAll(setupStrapi, 60000)` + `afterAll(teardownStrapi, 30000)` using `./helpers/strapi`.

### Playwright

- Import from `@playwright/test`: `test`, `expect`.
- Use `test.describe` for grouping.
- `page.goto("/")` — baseURL configured in `playwright.config.ts`.
- For visual: `await expect(page).toHaveScreenshot()`. Update snapshots only when intentional via `pnpm tests:playwright:visual:update`.
- For axe: import existing axe helper if present (read `axe.spec.ts` first).
- Do not hardcode ports — rely on config.

## Phase 3 — Naming + structure

- One `describe` per unit-under-test (function, component, route).
- One `it` per behavior. Behavior phrased as outcome: `it("returns null when input is empty")`, not `it("test 1")`.
- AAA: arrange, act, assert. Separate with a blank line if it aids reading.
- No console.log left behind. No `.only` / `.skip` committed.
- No mocking of the database in Strapi tests — use `setupStrapi`.

## Phase 4 — Run

Run only the relevant package, not the whole monorepo, while iterating.

| Test | Command |
|---|---|
| UI unit (all) | `pnpm test:ui` |
| Strapi unit (all) | `pnpm test:strapi` |
| Single Vitest file | `pnpm --filter @repo/ui exec vitest run <path>` (or `@repo/strapi`) |
| Vitest watch | `pnpm --filter @repo/ui test:watch` |
| Playwright e2e | `pnpm tests:playwright:e2e:test` |
| Playwright e2e interactive | `pnpm tests:playwright:e2e:test:interactive` |
| Playwright visual | `pnpm tests:playwright:visual` |
| Playwright axe | `pnpm tests:playwright:axe` |
| Playwright seo | `pnpm tests:playwright:seo` |
| Update visual snapshots | `pnpm tests:playwright:visual:update` |
| All workspace tests | `pnpm test` |

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
Layer: vitest-ui | vitest-strapi | playwright-e2e | playwright-visual | playwright-axe | playwright-seo
Result: pass
Command: <exact command to re-run>
```

## Notes

- Do not add new dev dependencies for testing without explicit user request.
- Do not introduce Jest, Mocha, Cypress, or other competing frameworks.
- Coverage reports configured in `vitest.config.ts` — don't reconfigure per-test.
- Strapi tests boot a real Strapi instance — slow. Keep integration tests focused; push pure logic to unit tests.
- Playwright `MOBILE_VIEWPORTS_TESTING_ENABLED=true` env var opts in mobile projects (see `playwright.config.ts`).
- Visual snapshots are platform-sensitive — generated on macOS may diff on CI. Note in PR if you regenerated locally.
