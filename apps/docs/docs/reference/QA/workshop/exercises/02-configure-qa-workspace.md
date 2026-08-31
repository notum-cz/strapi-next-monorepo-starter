# Exercise 2 — Configure the shared QA workspace (env + urls.json)

**Goal:** edit the two files every remaining suite (SEO, accessibility, visual) reads from.

## Step 1 — The `.env` file

Already done in Exercise 0 — confirm `qa/tests/playwright/.env` has your `BASE_URL` (your own project's test/staging URL, not localhost) and `MOBILE_VIEWPORTS_TESTING_ENABLED=false`:

```bash
cp qa/tests/playwright/.env.example qa/tests/playwright/.env
```

`BASE_URL` decides what "the app" means for every suite (`playwright.config.ts`'s `use.baseURL` and several specs' `process.env.BASE_URL`). Leave mobile viewports off — it doubles the browser projects on every suite.

## Step 2 — `helpers/urls.json`

Currently:

```json
["/"]
```

Imported unmodified by three specs — `seo/seo.spec.ts` (one describe block per entry), `axe/axe.spec.ts` (one test per entry), `visual/visual.spec.ts` (one screenshot per entry).

Add the page(s) for whatever flow you're testing today — the worked example throughout this workshop uses the auth pages, but add your own instead if you picked something else in Exercise 1 (a contact page, a search results page, whatever it is):

```json
["/", "/auth/signin", "/auth/register"]
```

## Step 3 — Confirm the suites picked it up, without running anything yet

```bash
pnpm -F @repo/tests-playwright exec playwright test --list seo/seo.spec.ts
pnpm -F @repo/tests-playwright exec playwright test --list axe/axe.spec.ts
```

`--list` prints tests without running them — should now show three times as many. If not, check `urls.json` is valid JSON (trailing comma is the usual culprit).

## Checkpoint

Explain what `urls.json` is for and why one edit changes three suites.

Move on to [03-seo.md](./03-seo.md).
