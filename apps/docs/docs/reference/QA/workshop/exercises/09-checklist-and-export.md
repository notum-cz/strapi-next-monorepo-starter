# Exercise 9 — Pass/Fail checklist and Test Plan export

**Goal:** the manual-testing side of the QA docs — a page you click through, not a command you run.

**Needs:** docs site running (`pnpm dev:docs`, http://localhost:3300), your test case doc from Exercise 1.

## Step 1 — Find the checklist

Open your page at `http://localhost:3300/reference/QA/test-cases/` followed by whatever you named your file in Exercise 1 (e.g. `register`). Below the Gherkin block, a Pass/Fail checklist is already rendered — one row per `@manual` scenario, generated at build time.

Confirm: the scenarios you tagged `@automated` in Exercise 8 are missing here — automated scenarios are deliberately excluded.

## Step 2 — Actually run the manual scenarios

For each remaining `@manual` scenario, perform it against your flow on `<BASE_URL>` and mark Pass/Fail.

Results save to your browser's `localStorage` — survive a refresh, gone in another browser. Per-device, not shared, not git-versioned — a personal working log, not a release sign-off record.

## Step 3 — Export from the site-wide view

Go to http://localhost:3300/reference/QA/test-cases (`test-cases/index.md`). Renders `<TestPlanExport planId="all" planName="All Test Cases" />` — every manual scenario, every page, one export. Try it.

## Step 4 — Make a narrower Test Plan (stretch)

```markdown
# Auth Flows Test Plan

Manual regression pass for authentication — login, logout, registration.

<TestPlanExport planId="auth-flows" planName="Auth Flows Test Plan" pages={["login", "logout", "register"]} />
```

Save flat under `apps/docs/docs/reference/QA/test-cases/` (no folder needed). Each `pages` entry is the target's path relative to `test-cases/`, without `.md` (see `../../../apps/docs/src/plugins/testPlanManifest.ts` for how the id is computed).

**Don't** add a custom `slug` to any test-case page — it breaks the id matching between route, `localStorage`, and `pages` list.

## Checkpoint

Explain what the checklist is for, why results aren't shared across the team, and when a named Test Plan beats "All Test Cases."

Last exercise — back to [../index.md](../index.md) for wrap-up.
