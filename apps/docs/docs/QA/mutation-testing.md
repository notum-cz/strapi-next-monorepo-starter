---
sidebar_position: 3
---

# Mutation Testing

[StrykerJS](https://stryker-mutator.io/docs/stryker-js/introduction/) measures how good the Vitest suites are at catching bugs. Coverage only tells you which lines run during tests. Stryker makes small changes to the source, called **mutants**, such as flipping `>` to `>=`, replacing `&&` with `||`, or emptying a string. It runs the tests against each mutant. If a test fails, the mutant is **killed**. If every test still passes, the mutant **survived**, which means a real bug in that spot would go unnoticed.

Both Vitest apps are configured:

| App    | Config                           | Report                                    |
| ------ | -------------------------------- | ----------------------------------------- |
| UI     | `apps/ui/stryker.config.mjs`     | `apps/ui/reports/mutation/index.html`     |
| Strapi | `apps/strapi/stryker.config.mjs` | `apps/strapi/reports/mutation/index.html` |

## Commands

```bash
pnpm test:mutation          # Stryker in all apps
pnpm test:mutation:ui       # Stryker in Next.js UI
pnpm test:mutation:strapi   # Stryker in Strapi
```

Each run prints a score table and writes an HTML report, a JSON report (`mutation.json`) and an incremental file to `reports/mutation/`. That folder and the `.stryker-tmp/` sandbox are gitignored.

Open the HTML report to see each surviving mutant inline in the source.

## What Gets Mutated

Only modules that already have tests are mutated, so untested files don't drag the score down. Tested modules can still have untested branches, which show up as `No coverage`. The score over covered code tells you how good the assertions are where tests do run. The `mutate` list in each config names those modules explicitly.

**When you add a test for a module that isn't covered yet, add that module to the app's `mutate` list.** The other way round also holds: a module in `mutate` without tests only produces `No coverage` mutants.

## Reading the Results

| Status      | Meaning                                                                 | What to do                                                       |
| ----------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Killed      | A test failed on the mutant.                                            | Nothing. This is the goal.                                       |
| Survived    | Tests ran over the mutated code and still passed.                       | Add or tighten an assertion for that behavior.                   |
| No coverage | No test executes the mutated code at all.                               | Add a test for that branch, or accept that it isn't covered yet. |
| Timeout     | The mutant caused an infinite loop or a hang. It counts as detected.    | Usually nothing.                                                 |
| Ignored     | Static code (module-level constants) that is skipped by `ignoreStatic`. | Nothing.                                                         |

The **mutation score** is detected ÷ valid mutants. The table also shows the score over covered code only, which tells you how good the assertions are where tests do run.

Not every survivor is worth killing. Mutants in log messages, or equivalent mutants that don't change behavior, can be left alone.

## Incremental Mode

`incremental: true` stores the previous result in `reports/mutation/stryker-incremental.json`. The next run only retests mutants in changed source or test files and reuses the rest, so local reruns take seconds instead of a full run. Incremental mode only notices changes to mutated files and test files. After changing shared mocks, test helpers, `vitest.config.ts`, `stryker.config.mjs` or dependencies, force a full run so old results aren't reused: delete the file, or run `pnpm -F @repo/<app> exec stryker run --force`.

## CI

`.github/workflows/mutation.yml` runs a full pass for both apps every Monday at 03:00 UTC, and on demand through **Actions → Mutation Testing → Run workflow**. Each app's report is uploaded as a `mutation-report-<app>` artifact. The workflow is separate from the PR checks in `ci.yml`, because a full run is too slow for the PR gate. GitHub runs scheduled workflows from the default branch (`main`), so the weekly run starts once the workflow reaches it. The scheduled trigger only fires in the upstream starter repository. In a fork, use the manual trigger or remove the repository check from the job's `if:`.

## Thresholds

`thresholds` in each config sets the score colors: green at 80 % and above, red below 60 %. `break` is `null`, so a low score never fails the run. Once the baseline is stable, set `break` a few points below the current score to fail runs that regress.
