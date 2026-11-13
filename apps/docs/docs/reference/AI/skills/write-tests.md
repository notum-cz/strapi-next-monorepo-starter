---
sidebar_position: 20
---

# write-tests

Add or extend tests for a feature or a bug, following the project's existing testing setup (fast unit tests and browser/end-to-end suites). The skill picks the right kind of test, mirrors existing ones, writes it, and runs it.

## Use it when

- You want coverage for new or existing behavior.
- You want to reproduce a bug with a failing test before fixing it.

## What it helps solve

- Adds confidence around new behavior.
- Reproduces bugs before they are fixed.
- Protects important user flows from regressions.
- Documents expected behavior in executable form.

It uses the test tools already in the project.

## Playwright feature groups

Playwright tests run by [feature group](../../../QA/playwright/index.md#test-groups), so the skill follows these rules for Playwright specs:

- It tags every top-level `test.describe` with `tags("<group>")` from `qa/tests/playwright/helpers/test-groups.ts`, never with a hand-written `{ tag: … }`. An untagged test stops running once an environment's groups are narrowed.
- It marks tests that must stay off production with `no-prod`, or `NO_PROD` on a nested test.
- For the `seo`, `axe`, `visual` and `perfo` suites, it adds pages under their group in `helpers/urls.json` and reads them with `urlsByGroup`.
- After adding or retagging tests, it runs the untagged-test check from the [Playwright docs](../../../QA/playwright/index.md#checking-for-untagged-tests).

See also: [Testing](../../../QA/overview.md).
