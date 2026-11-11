---
sidebar_position: 1
slug: /QA
---

# Testing

Testing is split between fast app-level Vitest suites and browser-based QA checks.

| Area          | Tooling                | Location                     |
| ------------- | ---------------------- | ---------------------------- |
| Strapi        | Vitest                 | `apps/strapi/tests`          |
| UI            | Vitest                 | `apps/ui/**/*.test.ts`       |
| E2E           | Playwright             | `qa/tests/playwright/e2e`    |
| Accessibility | Playwright + axe-core  | `qa/tests/playwright/axe`    |
| SEO           | Playwright             | `qa/tests/playwright/seo`    |
| Visual        | Playwright screenshots | `qa/tests/playwright/visual` |
| Web Vitals    | k6 browser             | `qa/tests/playwright/perfo`  |
| Load          | k6 (TypeScript)        | `qa/tests/playwright/load`   |

## References

- [Unit Testing](./unit-testing.md) — Vitest tests for Strapi and UI code.
- [Playwright Testing](./playwright/index.md) — E2E, accessibility, SEO, and visual regression.
- [Core Web Vitals (k6)](./playwright/web-vitals.md) — LCP, CLS, FCP and TTFB per page, on an emulated phone.
- [Load Testing (k6)](./playwright/load-testing.md) — simulated visitor traffic: does the site hold, where does it break, does it recover.
- [GitHub Actions QA Pipeline](./playwright/ci-pipeline.md) — how the `qa.yml` workflow triggers, runs, and reports.
- [Page Object Model and Smoke vs Mock](./playwright/pom-and-test-types.md) — POM conventions and when to use a mocked backend.
- [Test Cases](./test-cases/index.md) — Gherkin-style test case docs with a live Pass/Fail checklist and one-click results export.
- [Common Knowledge](./common-knowledge/index.md) — QA tribal knowledge: environment quirks, known issues, and workarounds worth not forgetting.

## What To Test Where

- Use Vitest for fast logic and API utility coverage.
- Use Playwright E2E for user flows and route-level behavior.
- Use axe tests for accessibility regressions.
- Use SEO tests for metadata, robots, sitemap, and page structure.
- Use visual tests for layout/component regressions.
- Use k6 Core Web Vitals to check how fast pages feel to a visitor.
- Use k6 load tests to check that the site holds expected traffic, on STG before a launch with a traffic peak.
