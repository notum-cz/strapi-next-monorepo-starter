# Exercise 6 — Lighthouse: read the report, then close a real gap

**Goal:** run Lighthouse against the Exercise 2 pages, read the report, and understand the one real gap in this suite — it can never fail today, no matter how bad a score is.

**Needs:** Exercise 2 done.

## Step 1 — Run it

```bash
pnpm tests:lhci:perfo
```

This shells out to `qa/tests/playwright/perfo/lhci.ts`, which runs `lhci collect` once per page in `urls.json` (`--numberOfRuns=1`). Slower than the other suites — one real page load plus a full Lighthouse audit per page, nothing mocked.

## Step 2 — Open the report

```bash
pnpm -F @repo/tests-playwright exec lhci open
```

Opens the most recently collected run's HTML report in your browser — Performance, Accessibility, Best Practices, SEO scores, per page.

## Checkpoint

Explain why `pnpm tests:lhci:perfo` can never fail today, and what the smallest real step to change that would look like.

Move on to [07-run-in-ci.md](./07-run-in-ci.md).
