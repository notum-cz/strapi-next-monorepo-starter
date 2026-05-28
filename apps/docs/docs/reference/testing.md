---
sidebar_position: 5
---

# Testing

The repository has three testing layers:

| Area   | Tooling                                     | Location                                                                                                                     |
| ------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Strapi | Vitest, Node environment, 30 second timeout | [`apps/strapi/tests/`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/strapi/tests)                 |
| UI     | Vitest                                      | [`apps/ui/src/lib/__tests__/`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/ui/src/lib/__tests__) |
| QA     | Playwright, axe, Lighthouse CI              | [`qa/tests/playwright/`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/qa/tests/playwright)             |

## Unit And Integration Tests

Run app-level Vitest suites from the monorepo root:

```bash
pnpm test
pnpm test:strapi
pnpm test:ui
```

Use these for logic that can be tested without a real browser: helpers, API clients, schema-related utilities, Strapi services, and small integration points.

## Playwright QA Suite

The QA workspace validates the deployed or local UI through a browser.

```text
qa/tests/playwright/
├── e2e/      # end-to-end flows
├── axe/      # accessibility checks
├── seo/      # SEO checks
├── visual/   # visual regression checks
├── perfo/    # Lighthouse CI performance checks
└── helpers/  # shared test utilities
```

Create a local Playwright env file before running browser tests:

```bash
cp qa/tests/playwright/.env.example qa/tests/playwright/.env
```

Set `BASE_URL` to the app under test:

```env
BASE_URL=http://localhost:3000
```

Install Playwright browsers once:

```bash
pnpm -F @repo/tests-playwright exec playwright install --with-deps
```

## Commands

Run all commands from the monorepo root:

```bash
pnpm tests:playwright:e2e:test
pnpm tests:playwright:e2e:test:interactive
pnpm tests:playwright:axe
pnpm tests:playwright:seo
pnpm tests:playwright:visual
pnpm tests:lhci:perfo
```

Mobile browser projects can be enabled with:

```env
MOBILE_VIEWPORTS_TESTING_ENABLED=true
```

## Visual Regression

Visual tests compare screenshots against a baseline:

1. Run visual tests once to create baseline screenshots.
2. Deploy or run the version you want to validate.
3. Run visual tests again to compare the current UI against the baseline.

Commit baseline updates only when the visual change is intentional.

## What To Test Where

- Use Vitest for fast logic and API utility coverage.
- Use Playwright E2E for user flows and route-level behavior.
- Use axe tests for accessibility regressions.
- Use SEO tests for metadata, robots, sitemap, and page structure.
- Use visual tests for layout/component regressions.
- Use Lighthouse CI for performance budgets and high-level page quality.

## Related Documentation

- [Commands](./commands.md)
- [UI Built-in Pages](../ui/built-in-pages/showcase.md)
- [QA workspace](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/qa/tests)
