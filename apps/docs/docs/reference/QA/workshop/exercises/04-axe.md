# Exercise 4 — Accessibility: from violation to a documented warning

**Goal:** find a real axe violation on the Exercise 2 pages, then use `GLOBAL_WARNING_RULE_IDS` / `PATH_CONFIGS` to turn a known, not-fixed-today issue into a documented warning instead of a silent gap or a permanently red suite.

**Needs:** Exercise 2 done. Read `axe/axe.spec.ts` first — `GLOBAL_WARNING_RULE_IDS`, `GLOBAL_EXCLUDE_SELECTORS`, `PATH_CONFIGS` near the top, all empty today.

## Step 1 — Run it

```bash
pnpm tests:playwright:axe
```

`/` should stay green. For the auth-pages worked example, expect a violation on `/auth/signin` and `/auth/register` — likely `landmark-one-main`/`region`, since these pages render outside `StrapiPageView` (the only place in the app with a `<main>` element). Same infra gap as Exercise 3, so it should reproduce on your project too, unless it's already been patched there. Using a different page from Exercise 2? Whatever axe actually reports on it is your real finding — Steps 2-4's process applies regardless.

Read the actual output — rule id, help text, impact, offending node — rather than assuming it matches the prediction.

## Step 2 — Fix now, or document and defer?

Wrapping auth pages in `<main>` is a small, legitimate fix — but a real app-code change out of scope for today's timebox. This is exactly what "a known, unfixable violation becomes a warning, not a silent gap" is for. Say in the comment that it's not fixed _today_, not that it's unfixable.

## Step 3 — Add the exception

Edit `qa/tests/playwright/axe/axe.spec.ts`. Use `PATH_CONFIGS` (page-specific), not `GLOBAL_WARNING_RULE_IDS` — this is specific to the page(s) you found it on. Worked example below is for the auth pages — swap in your own path(s) if you're testing something else:

```typescript
// Auth pages render outside the page-builder's <main> wrapper (StrapiPageView),
// so they have no landmark region. Known gap, not fixed here — see the QA note
// added in Exercise 3. Downgraded to a warning instead of failing the suite.
const PATH_CONFIGS: Record<
  string,
  { excludeSelectors?: string[]; warningRuleIds?: string[] }
> = {
  "/auth/signin": { warningRuleIds: ["landmark-one-main", "region"] },
  "/auth/register": { warningRuleIds: ["landmark-one-main", "region"] },
}
```

Use the actual rule ids from your Step 1 output, not necessarily the two above.

## Step 4 — Re-run and confirm the downgrade

```bash
pnpm tests:playwright:axe
```

Should now print a 🟠 warning instead of ❌ error, and pass. Still failing? Check the rule id matches exactly what the report printed — a typo silently leaves it in `errorViolations`.

## Checkpoint

Explain `GLOBAL_WARNING_RULE_IDS` vs. `GLOBAL_EXCLUDE_SELECTORS` vs. a `PATH_CONFIGS` entry, and why this belongs in the per-path list.

This lives on your personal branch — a rep, not a change to the real suite unless the team decides to keep it.

Move on to [05-visual.md](./05-visual.md).
