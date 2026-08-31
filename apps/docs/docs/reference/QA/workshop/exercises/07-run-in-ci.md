# Exercise 7 — Run the same suites in GitHub Actions

**Goal:** trigger the QA workflow manually and read a CI run like a local one.

**Background:** [`../reference/ci-pipeline.md`](../reference/ci-pipeline.md) — full workflow structure, artifacts, cron question. This exercise is its hands-on half.

**Needs:** push access (or fork) with Actions enabled, and your project's `base_url` (same one from Exercise 0).

## Step 1 — Find the workflow

GitHub → **Actions** → **QA** workflow (`.github/workflows/qa.yml`). Manual trigger only — nothing runs until you start it.

## Step 2 — Trigger a run

**Run workflow**, fill in:

- Checkboxes: `run_e2e`, `run_axe`, `run_seo`, `run_lhci_perfo`, `run_visual`
- `base_url` — leave empty for the repo default

Pick **SEO**, **AXE**, and **VISUAL** together, in this one run — you already know what all three check (Exercises 3-5), and checking them all at once is exactly what a real pre-release run looks like: one dispatch, three parallel jobs, one place to read results. Add **LIGHTHOUSE** too if you want to see Exercise 6's "collect only" gap play out in CI as well — same lack of a budget, just running remotely. (E2E is more interesting after Exercise 8, once your own specs exist — that's its Step 7 stretch goal, which sends you back here.)

## Step 3 — Watch it run

Each checked suite is its own parallel job on `ubuntu-latest` — SEO, axe, and visual all run at the same time, independently. Same Playwright browsers (cached, faster on repeat runs), same commands as local (`pnpm tests:playwright:seo`, `pnpm tests:playwright:axe`, `pnpm tests:playwright:visual:docker`) — nothing CI-specific.

## Step 4 — Force a failure and read the artifacts

Use your project's `base_url` again, where your Exercise 3/4 findings still apply. On failure each job uploads its own artifact:

- `seo-report` / `axe-report` / `visual-report` — same HTML report as locally
- The visual job only produces a comparison (and `visual-report`) if Linux baselines are already committed for the target pages — no baseline yet → it skips instead of failing, same reason the macOS baselines from Exercise 5 are gitignored (see `../../../apps/docs/docs/reference/QA/playwright.md#visual-regression`)
- (for `run_e2e`, once you're back after Exercise 8: `playwright-report` + `playwright-traces`, viewable via `pnpm -F @repo/tests-playwright exec playwright show-trace <file>`)
- `perfo-report` if you also checked Lighthouse — uploaded regardless of pass/fail, since there's no pass/fail to speak of yet (Exercise 6)

Download and open one — a CI failure is debuggable without reproducing locally.

## Step 5 — Discuss: should any of this run on a cron?

A commented-out `schedule:` trigger exists. Read `../reference/ci-pipeline.md#adding-a-cron-schedule` and discuss, without changing anything:

- Which suites should run unattended, nightly?
- What does `base_url` target with no human to type one?
- Is a GitHub email enough on failure, or does this need Slack/Teams?

## Checkpoint

Explain which suites you can trigger independently, what `base_url` controls, where to debug a failed run without reproducing locally, and what's missing before this could run on a schedule.

Move on to [08-e2e-smoke-and-mock.md](./08-e2e-smoke-and-mock.md).
