---
title: Slides
sidebar_position: 3
marp: true
paginate: true
---

# QA Team Workshop

### Test types, tooling, and the new QA docs

1.9. — half-day, hands-on

---

## Goals for today

- One shared map of **everything we test and how** in this project
- Hands-on with **every Playwright layer**: e2e/axe/seo/visual, Lighthouse, CI
- Comfortable with the **new QA docs**: Gherkin test cases, Pass/Fail checklist, Test Plan export
- Know the two agent skills that do a lot of this for you: **`write-test-cases`** and **`write-tests`**
- By the end: you've written a test case, automated it, run it locally and in CI

---

## How today is structured

1. **Project map** — what test types we have, where they live
2. **Walk each test type** — SEO, axe, visual, Lighthouse, CI
3. **E2E, in depth** — POM, smoke vs. mock — the finale of the walkthrough
4. **Hands-on** — 9 exercises, your own machine

**Register/Login in the examples is just that — an example, not a requirement.** Wherever it shows up in the exercises, swap in anything real on your own project instead (a contact form, search, anything with a real backend and an error state).

---

## The testing pyramid, as it exists here

| Area          | Tooling                | Location                     |
| ------------- | ---------------------- | ---------------------------- |
| E2E           | Playwright             | `qa/tests/playwright/e2e`    |
| Accessibility | Playwright + axe-core  | `qa/tests/playwright/axe`    |
| SEO           | Playwright             | `qa/tests/playwright/seo`    |
| Visual        | Playwright screenshots | `qa/tests/playwright/visual` |
| Performance   | Lighthouse CI          | `qa/tests/playwright/perfo`  |

---

## Workspace `qa/tests/playwright`

```text
qa/tests/playwright/
├── e2e/
│   ├── smoke/     # critical-path scenarios against the real app + real backend
│   └── mock/      # same scenarios, network layer stubbed
├── axe/           # accessibility checks
├── seo/           # SEO checks
├── visual/        # visual regression checks
├── perfo/         # Lighthouse CI performance checks
└── helpers/       # page objects + shared fixtures
```

One dedicated pnpm package. One `.env` with `BASE_URL` drives every suite. `helpers/urls.json` is the shared page list — read by SEO, axe, visual **and** Lighthouse.

---

## SEO — what it does

- Title, meta description, robots, canonical, H1/heading hierarchy, structured data (JSON-LD), Open Graph, hreflang
- One `test.describe` block per page from `urls.json`, mirrored in `seo/seo.spec.ts`

```typescript
test.describe("Title", () => {
  test("should exist and be non-empty", async ({ page }) => {
    const title = (await page.title()).trim()
    expect(title).not.toBe("")
  })
})
```

**How to modify it:**

- New page → add to `helpers/urls.json` (one entry, tested automatically)
- New check → new `test.describe` block inside the `for (const path of PATHS)` loop
- Production-specific checks (robots, Heroku references) auto-`test.skip` elsewhere

---

## Axe (accessibility) — what it does

- axe-core via `@axe-core/playwright`, one test per page from `urls.json`
- Distinguishes error vs. warning — `GLOBAL_WARNING_RULE_IDS` / `PATH_CONFIGS`

```typescript
const PATH_CONFIGS: Record<string, { warningRuleIds?: string[] }> = {
  "/auth/signin": { warningRuleIds: ["landmark-one-main", "region"] },
}
```

**How to modify it:**

- A known, not-fixed-today violation on a specific page → `warningRuleIds` in `PATH_CONFIGS` (not globally)
- An element axe should ignore entirely → `excludeSelectors`
- A violation that applies everywhere → `GLOBAL_WARNING_RULE_IDS` / `GLOBAL_EXCLUDE_SELECTORS`

---

## Visual — what it does

- Screenshot vs. committed baseline, one test per page from `urls.json`
- **Baselines must be generated on Linux** (Docker) — macOS and CI render fonts differently

```typescript
await expect(page).toHaveScreenshot(snapshotName, {
  fullPage: true,
  threshold: 0.2, // 0 = pixel perfect
  maxDiffPixelRatio: 0.01, // 1% of pixels can differ
})
```

**How to modify it:**

- Comparison sensitivity → `threshold` / `maxDiffPixelRatio`
- A flickering/animated element ruins snapshots → `page.addStyleTag` (`animation: none`) or hide it entirely
- New baseline after an intentional change → `pnpm tests:playwright:visual:docker:update`

---

## Lighthouse (performance) — what it does

- `lhci collect` for every page in `urls.json` — gathers the report, no pass/fail budgets wired in yet
- Report is read manually in `perfo/.lighthouseci`, or as a CI artifact

```typescript
const args = [
  "lhci",
  "collect",
  ...fullUrls.flatMap((url) => ["--url", url]),
  "--numberOfRuns=1",
]
```

---

## The QA docs, reorganized

```text
apps/docs/docs/reference/QA/
├── overview.md
├── playwright.md
├── unit-testing.md
├── test-cases/          # Gherkin scenarios, one page per feature
│   └── index.md         # <TestPlanExport planId="all" /> — every scenario, one view
└── common-knowledge/     # tribal knowledge, one page, accordion entries
```

Three purposes, three places. Don't mix them.

---

## Test cases: Gherkin as documentation

- One Markdown page per feature/flow, one ` ```gherkin ` fenced block
- **Exact, literal UI copy** — button text, messages — not paraphrased
- Tags: `@smoke`/`@regression` (scope), `@mock` (e2e needs a stub), `@manual`/`@automated` (status)
- Once automated: flip the tag, add `# Automated by: <spec path>` above the scenario

No Cucumber runner — these are read by humans (and agents), nothing executes them.

---

## The Pass/Fail checklist — for free

- Every ` ```gherkin ` block on the docs site gets a checklist generated below it
- One row per `@manual` scenario — `@automated` ones are skipped (a spec already covers them)
- Results save to **your browser's `localStorage`** — per device, not shared, not git-versioned
- `test-cases/index.md` renders `<TestPlanExport planId="all" />` — one export button for every scenario on every page

**Test Plan** = a named, narrowed selection of pages (a release regression pass, an a11y sweep) — optional, add one only when "everything" is too broad.

---

## CI: the same suites, on demand

`.github/workflows/qa.yml` — manual `workflow_dispatch` only, nothing runs on push/PR. One checkbox per suite (E2E / AXE / SEO / Visual / Lighthouse) + a `base_url` input, off by default.

Failed runs upload the Playwright report / traces as artifacts — you don't need to reproduce locally to see what broke.

---

## How the pipeline is put together

- **5 independent jobs** (`e2e`, `axe`, `seo`, `visual`, `lhci_perfo`), each gated by its own `if: inputs.run_X` — checked suites run **in parallel**, unchecked ones show as _skipped_
- Same steps every time: checkout → pnpm setup → cache/install Playwright browsers → the same `pnpm tests:playwright:...` command as locally
- Empty `base_url` → falls back to the repo's `BASE_URL` variable (Settings → Actions → Variables)
- **Visual job** first looks for committed Linux baselines — none → skips the run instead of failing (not a broken test, just not initialized)
- A push to the same PR **cancels** an in-flight run for it; two manual dispatches never cancel each other

Deep dive: `reference/ci-pipeline.md`

---

## Can this run on a schedule?

Almost — a `cron` trigger already exists, just commented out:

```yaml
# schedule:
#   - cron: "0 0 * * 1-5"    # weekdays, 00:00 UTC
```

**Not enough on its own** — `if: inputs.run_X` is always `false` outside `workflow_dispatch`, so the pipeline would run and every job would skip. Each job needs `|| github.event_name == 'schedule'` added too.

Decide first: which suites run every night (not the slow Visual+Lighthouse combo), what `BASE_URL` targets (no one types it in by hand), how a failure gets noticed (the default email is easy to miss).

---

# E2E, in depth

The finale — POM, and the one distinction that actually matters: smoke vs. mock

---

## Smoke vs. mock — the one distinction that matters

- **`e2e/smoke/`** — real browser, real app, real backend. Small, critical path. "Does the page load, does the main flow complete."
- **`e2e/mock/`** — same browser flow, but backend responses stubbed via Playwright route mocking. For states that are hard/slow to trigger for real: a specific error, a dropped connection.

Both share the **same Page Object** — one POM per page, used by both.

---

## Smoke vs. mock, side by side

|          | Smoke                      | Mock                                              |
| -------- | -------------------------- | ------------------------------------------------- |
| Backend  | Real                       | Stubbed (`mockJson` / `route.abort()`)            |
| Answers  | "Does it work end to end?" | "Does the UI react correctly to _this_ response?" |
| Best for | Happy path, page loads     | Error states, hard-to-reproduce situations        |
| Import   | `@playwright/test`         | `test`/`expect` from `helpers/fixtures`           |

**Default choice is smoke.** Reach for mock only when the real backend can't reliably produce that response on demand.

⚠️ Register the mock **before** triggering the request it catches — the most common reason a new mock spec "just doesn't work."

Deep dive: `reference/pom-and-test-types.md`

---

## Page Object Model, in one slide

- One class per page: `qa/tests/playwright/helpers/pages/<Page>Page.ts`
- Exposes **locators** (`getByRole`, `getByLabel`) + a `goTo()` method
- No assertions inside the POM — those live in the spec
- Multiple same-named elements → `.nth(0)`, `.nth(1)`, exposed as named locators

Exactly what you'll build in Exercise 7 for a page that doesn't have one yet.

---

## Why no assertions inside a POM?

POM = "how to interact with the page." Spec = "what should be true." Mix them, and:

- A failed `expect()` hidden in a POM method hides **which test** actually caught the regression
- The POM becomes unusable the moment another spec needs the **opposite** assertion from the same action

One POM, many specs, zero assertions inside it.

---

## Today's hands-on flow

1. **Write** a Gherkin test case for a flow that has none yet — documentation only, nothing automated yet
2. **Configure** `.env` + `urls.json` — the shared config behind SEO/axe/visual/Lighthouse
3. **SEO** — find and document a real gap on the new pages
4. **Axe** — find a real violation, turn it into a documented warning
5. **Visual** — local baseline, then a Linux-consistent one
6. **Lighthouse** — read the report, see why it can never fail today, close the gap
7. **Run** SEO, axe, and visual together in GitHub Actions
8. **E2E — smoke and mock.** The main block: POM, a real smoke spec, two mock specs, the full suite, and interactive UI mode. By far the biggest piece of today.
9. **Use** the Pass/Fail checklist and export a Test Plan

Exact instructions: `qa/training/exercises/`. Ask when you get stuck — that's what today is for.

---

# Let's go

Setup check → Exercise 1
