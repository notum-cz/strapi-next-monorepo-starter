# Testing Info

## 🐞 Automated Testing Suite

This directory contains an automated testing suite designed to ensure quality across functionality, accessibility, performance, and SEO.

It can include different testing frameworks and tools depending on project needs, for example:

- **End-to-End (E2E) Tests** with tools like [Playwright](https://playwright.dev/) or [Cypress](https://www.cypress.io/)
- **Accessibility Tests** using [AXE-Core](https://classic.yarnpkg.com/en/package/@axe-core/playwright)
- **SEO Tests** for automated validation of search engine optimizations

---

## 📂 Project Structure

```bash
qa/
├── tests/
│   ├── cypress/                          ← Cypress-based tests
│   └── playwright/                       ← Playwright-based tests (workspace package)
│       ├── axe/                          ← Accessibility tests
│       ├── e2e/                          ← End-to-End tests
│       ├── helpers/                      ← Shared test utilities/helpers
│       ├── .env.example                  ← Example environment variables file
│       ├── package.json                  ← Test dependencies & scripts for this package
│       ├── playwright.config.ts          ← Playwright configuration
│       ├── tsconfig.json                 ← TypeScript configuration for this package
```

### Playwright

#### 🔧 Environment Variables

Playwright tests require a `.env` file.

1. Copy the example file:
   ```bash
   cp qa/tests/playwright/.env.example qa/tests/playwright/.env
   ```
2. Update the `BASE_URL` value to point to the environment you want to test.
   ```bash
    BASE_URL=http://localhost:3000
   ```
   `BASE_URL` defines the base URL of the application under test and is used as the starting point for all Playwright test suites.

#### 🌎 Install Playwright Browsers

Before running tests for the first time, install the required browsers:

```bash
# From project root
pnpm -F @repo/tests-playwright exec playwright install --with-deps

# Or from the playwright directory
cd qa/tests/playwright && pnpm exec playwright install --with-deps
```

#### �📱 Mobile Viewport Testing

Mobile browser projects can be enabled via an environment variable.

```env
MOBILE_VIEWPORTS_TESTING_ENABLED=true
```

#### ▶️ Running Tests

All test commands are run from the **project root**, not from inside the `qa/` folder.

- **Playwright - Run E2E tests (headless)**

  ```bash
  pnpm run tests:playwright:e2e:test
  ```

- **Playwright - Run E2E tests in interactive mode (headed)**

  ```bash
  pnpm run tests:playwright:e2e:test:interactive
  ```

- **Playwright - Run AXE tests**
  ```bash
  pnpm run tests:playwright:axe
  ```
