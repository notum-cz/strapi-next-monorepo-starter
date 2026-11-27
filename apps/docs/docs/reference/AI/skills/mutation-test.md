---
sidebar_position: 20.5
---

# mutation-test

Checks whether the Vitest tests for a module would actually catch bugs, then strengthens them. The skill runs [StrykerJS](../../../QA/mutation-testing.md) on one source file, lists the mutants the tests let through, and adds assertions until the ones that matter are killed. It changes tests only, never the code under test.

## Use it when

- You want to know how much a module's tests really protect it, beyond line coverage.
- A module has tests but bugs still slip through.
- `write-tests` has just added Vitest tests. It runs this skill as its last check.
- You want an overview of which modules have the weakest tests.

## What it helps solve

- Finds assertions that are missing or too loose, such as a branch that runs but whose result is never checked.
- Finds edge cases and error paths that no test reaches.
- Separates real gaps from noise. Log messages and mutants that can't change behaviour are listed rather than chased.

## How it works

1. It checks the file is in the app's `stryker.config.mjs` `mutate` list, and adds it there if the file has tests.
2. It runs Stryker narrowed to that file. Incremental mode keeps the rest of the report intact, so this takes seconds.
3. It reads the surviving mutants with a bundled script, `.claude/skills/mutation-test/scripts/survivors.mjs`, which prints each one with its line, the change, and the tests that ran over it.
4. It decides for each mutant whether to kill it, extends the existing test file, and reruns until the targeted mutants are killed.
5. It reports the score before and after, and lists the mutants it left on purpose with a reason for each.

Only covers Vitest in `apps/ui` and `apps/strapi`. Playwright and k6 tests aren't mutation-tested.

See also: [Mutation Testing](../../../QA/mutation-testing.md), [write-tests](./write-tests.md).
