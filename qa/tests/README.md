# Testing Info

## 🐞 Automated Testing Suite

This directory contains an automated testing suite designed to ensure quality across functionality, accessibility, performance, and SEO.

It can include different testing frameworks and tools depending on project needs, for example:

- **End-to-End (E2E) Tests** with tools like [Playwright](https://playwright.dev/) or [Cypress](https://www.cypress.io/)
- **Accessibility Tests** using [AXE-Core](https://classic.yarnpkg.com/en/package/@axe-core/playwright)
- **SEO Tests** for automated validation of search engine optimizations
- **Visual Tests** for automated visual validation
- **Performance Tests** using [LighthouseCI](https://github.com/GoogleChrome/lighthouse-ci/tree/main)

---

## 📂 Project Structure

```bash
qa/
├── tests/
│   └── playwright/                       ← Playwright-based tests (workspace package)
│       ├── e2e/                          ← End-to-End tests
│       ├── axe/                          ← Accessibility tests
│       ├── seo/                          ← SEO tests
│       ├── visual/                       ← Visual tests
│       ├── perfo/                        ← Performance tests using LighthouseCI
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

- **Playwright - Run SEO tests**

  ```bash
  pnpm run tests:playwright:seo
  ```

- **Playwright - Run Visual tests (compare)**

  ```bash
  pnpm tests:playwright:visual
  ```

- **Playwright - Run Visual tests (update local snapshots)**

  ```bash
  pnpm tests:playwright:visual:update
  ```

- **Playwright - Run Visual tests via Docker (compare, CI-compatible)**

  ```bash
  pnpm tests:playwright:visual:docker
  ```

- **Playwright - Run Visual tests via Docker (update Linux snapshots)**

  ```bash
  pnpm tests:playwright:visual:docker:update
  ```

- **LighthouseCI - Run Perfo tests**
  ```bash
  pnpm tests:lhci:perfo
  ```

#### Additional info for visual tests

Visual regression tests compare screenshots of the application against previously committed baseline images to detect unintended visual changes.

**Browser coverage:**

| Browser | Local | Docker / CI |
|---------|-------|-------------|
| Chromium | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| WebKit (Safari) | ✅ | ❌ |

WebKit is excluded from Docker and CI runs because WebKit on Linux produces blank or incorrectly rendered screenshots due to missing system-level graphics dependencies. On macOS, WebKit runs natively and works correctly — so it is included in local (non-Docker) test runs only.

##### Cross-platform consistency (macOS vs CI/Linux)

macOS and Linux render fonts and UI elements differently, which causes snapshots generated locally to fail when compared on a GitHub CI runner (Linux). To solve this, **baseline snapshots must be generated on Linux**.

Two approaches are available:

- **Docker (recommended for local baseline generation)** — runs Playwright inside the official Linux Docker image, producing Linux-compatible snapshots without needing to push to CI first. Requires Docker Desktop to be running.
- **CI runner** — GitHub Actions runs directly on Linux, so no Docker is needed there.

Only `*-linux-*.png` snapshots are committed to the repository. macOS (`*-darwin-*.png`) and Windows (`*-win32-*.png`) snapshots are gitignored.

##### Snapshot naming convention

Each snapshot filename encodes the environment, page, browser, and platform:

```
{env-slug}-{page}-{browser}-{platform}.png
```

- `env-slug` is derived from the `BASE_URL` hostname (`www.` is stripped automatically)
- Each environment maintains its own set of baselines — DEV compares against DEV, STG against STG, etc.
- First run on a given environment always creates baselines (pass). Failures only occur on subsequent runs when visual changes are detected.

##### Workflow

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
