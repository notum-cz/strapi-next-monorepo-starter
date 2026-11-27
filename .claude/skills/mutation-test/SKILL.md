---
name: mutation-test
description: >
  Use when checking whether Vitest tests would actually catch bugs, or when
  tightening weak tests — e.g. "mutation test", "run stryker", "surviving
  mutants", "kill mutants", "are these tests good enough", "improve test
  quality", "mutation score". Also the final check of `write-tests` after it
  adds unit tests. Not for browser end-to-end or load tests.
argument-hint: "[ui|strapi] [file-under-test]"
---

# Mutation Test

Use StrykerJS to find behaviour the Vitest tests in `apps/ui` and `apps/strapi` don't pin down, then add assertions until those mutants are killed. The tests change; the source under test does not.

Reference: `apps/docs/docs/QA/mutation-testing.md` (statuses, incremental mode, CI). Configs: `apps/ui/stryker.config.mjs`, `apps/strapi/stryker.config.mjs`.

## Phase 1 — Scope

Work on **one module at a time**: the source file whose tests you are judging.

1. Pick the app (`ui` or `strapi`) and the source file, relative to the app (e.g. `src/lib/dates.ts`).
2. Check the file is in the app's `mutate` list in `stryker.config.mjs`.
   - Listed: continue.
   - Not listed, but has tests: add it to `mutate` (keep the list explicit — name files, or at most `<dir>/*.ts` for one fully tested directory), then continue.
   - No tests at all: stop and use `write-tests` first. Mutating untested code only produces `NoCoverage`.
3. Without a target (user asked "how good are our tests"), run Phase 2 for the whole app and Phase 3 with no file, then pick the lowest-scoring files and ask the user which to work on.

## Phase 2 — Run Stryker

From the repo root:

```bash
pnpm -F @repo/<app> exec stryker run --mutate <file>
```

- Narrowing with `--mutate` keeps the run to seconds. The incremental file in `reports/mutation/` keeps results for every other file, so the report stays complete once one full `pnpm test:mutation:<app>` has run. On a fresh clone the report holds only the narrowed file.
- For a large file, narrow to lines: `--mutate "<file>:40-90"`.
- Whole app instead: `pnpm test:mutation:<app>` (also builds workspace packages first).
- If it fails to resolve `@repo/logging` or `@repo/shared-data`, the workspace packages aren't built: run `pnpm test:mutation:<app>` once, or `pnpm build --filter=@repo/<app>^...`.
- If the initial test run fails, the normal suite is broken — fix it with `pnpm test:<app>` before going further.

Don't read the clear-text output for survivors; it repeats every file from the incremental report. Use Phase 3.

## Phase 3 — Read what survived

```bash
node .claude/skills/mutation-test/scripts/survivors.mjs <app> <file>
```

It prints the file's score and every `Survived` / `NoCoverage` mutant: `line:column`, the mutator, original → replacement, and the tests that ran over it. Prefix with `STATUSES=Survived` to hide `NoCoverage`. With no file, it prints one score line per mutated file.

## Phase 4 — Triage each mutant

Open the source at the reported line and decide:

| Situation                                                                                                                        | Action                                     |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **Survived**: the change alters behaviour a caller depends on (wrong branch, wrong boundary, wrong value returned, missing call) | **Kill it** — add or tighten an assertion. |
| **NoCoverage** on a branch that matters (error path, edge case)                                                                  | Add a test case that reaches it.           |
| Only changes a log message, error text nobody reads, or a debug label                                                            | Skip. List it in the report.               |
| **Equivalent mutant** — behaviour cannot change (e.g. `>=` vs `>` where the equal case can't occur)                              | Skip. List it with the reason.             |
| Killing it would need a test that asserts implementation details (private call order, internal var names)                        | Skip. List it.                             |

Prioritise `ConditionalExpression`, `EqualityOperator`, `LogicalOperator`, `BlockStatement` and `ArithmeticOperator` survivors — those are real bugs slipping through. `StringLiteral` survivors are often only messages; kill them when the string is part of the contract (an HTTP error body, a cache tag, a URL segment, a UID passed to Strapi).

## Phase 5 — Kill

- Add assertions to the **existing test file** for that module, following `write-tests` conventions (explicit `vitest` imports, existing mocks and helpers, matching `describe`/`it` style).
- Prefer strengthening an existing `it` (assert the return value, the exact argument passed to a mock, the status code) over adding near-duplicate tests.
- One assertion should usually kill several related mutants — assert the observable outcome, not each line.
- **Do not** edit the source under test to make mutants die, raise `timeoutMS`, narrow `mutate`, lower `thresholds`, or add `// Stryker disable` comments unless the user asks.

## Phase 6 — Verify

1. `pnpm test:<app>` — the normal suite passes.
2. Rerun the Phase 2 command. Incremental mode only re-tests the affected mutants.
3. Rerun Phase 3 and confirm the mutants you targeted are now `Killed`.

Incremental mode only notices changes to mutated files and test files. If you also changed a shared mock, a test helper, `vitest.config.ts` or `stryker.config.mjs`, add `--force` to the Phase 2 command so old results aren't reused.

## Report

```
Module: apps/<app>/<file>
Score: <before>% -> <after>%
Killed: <n> (tests touched: <test file paths>)
Left on purpose: <line> <mutator> — <reason>   (one per line)
Command: pnpm -F @repo/<app> exec stryker run --mutate <file>
```

Report the remaining survivors honestly; don't claim a module is "fully covered" while survivors remain.
