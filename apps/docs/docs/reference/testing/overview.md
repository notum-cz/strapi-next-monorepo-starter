---
sidebar_position: 1
slug: /reference/testing
---

# Testing

Testing is split between fast app-level Vitest suites and browser-based QA checks.

| Area          | Tooling                | Location                     |
| ------------- | ---------------------- | ---------------------------- |
| Strapi        | Vitest                 | `apps/strapi/tests`          |
| UI            | Vitest                 | `apps/ui/**/*.test.ts`       |
| Browser QA    | Playwright             | `qa/tests/playwright/e2e`    |
| Accessibility | Playwright + axe-core  | `qa/tests/playwright/axe`    |
| SEO           | Playwright             | `qa/tests/playwright/seo`    |
| Visual        | Playwright screenshots | `qa/tests/playwright/visual` |
| Performance   | Lighthouse CI          | `qa/tests/playwright/perfo`  |

## References

- [Unit Testing](./unit-testing.md) — Vitest tests for Strapi and UI code.
- [Playwright Testing](./playwright.md) — browser QA, accessibility, SEO, visual regression, and Lighthouse CI.

## What To Test Where

- Use Vitest for fast logic and API utility coverage.
- Use Playwright E2E for user flows and route-level behavior.
- Use axe tests for accessibility regressions.
- Use SEO tests for metadata, robots, sitemap, and page structure.
- Use visual tests for layout/component regressions.
- Use Lighthouse CI for performance budgets and high-level page quality.
