---
name: write-test-cases
description: >
  Use when asked to write or document test cases as Gherkin scenarios —
  e.g. "write test case", "add TC", "document test scenario", "gherkin
  feature", "write a feature file", "test case documentation". Produces
  Given/When/Then scenarios under qa/docs/test-cases — not automated
  test code (use `write-tests` for that).
argument-hint: "[feature-or-flow]"
---

# Write Test Cases

Document test cases as Gherkin `.feature` files under `qa/docs/test-cases/`. Each file has to work for **two readers at once**: a human skimming it as QA documentation, and whoever (person or agent) turns it into an automated test afterward. Neither reader gets sacrificed for the other — see "Write for both readers" below.

Reference: [Gherkin reference](https://cucumber.io/docs/gherkin/reference).

No Cucumber runner is wired into this repo, and this skill doesn't add one — `.feature` files here are documentation, read by humans and by agents preparing to implement a scenario, not executed by a step-definition framework. For automated Vitest/Playwright tests, use `write-tests` instead.

## Where files live

Mirror the automated test layers in `qa/tests/playwright/`, so a doc and its eventual automated spec are easy to pair up:

| Layer                        | Automated tests                  | Test case docs                                |
| ---------------------------- | -------------------------------- | --------------------------------------------- |
| E2E — smoke (real backend)   | `qa/tests/playwright/e2e/smoke/` | `qa/docs/test-cases/e2e/<feature>.feature`    |
| E2E — mock (stubbed backend) | `qa/tests/playwright/e2e/mock/`  | `qa/docs/test-cases/e2e/<feature>.feature`    |
| Accessibility                | `qa/tests/playwright/axe/`       | `qa/docs/test-cases/axe/<feature>.feature`    |
| SEO                          | `qa/tests/playwright/seo/`       | `qa/docs/test-cases/seo/<feature>.feature`    |
| Visual                       | `qa/tests/playwright/visual/`    | `qa/docs/test-cases/visual/<feature>.feature` |
| Performance                  | `qa/tests/playwright/perfo/`     | `qa/docs/test-cases/perfo/<feature>.feature`  |

Name the file after the feature or flow it covers, kebab-case (e.g. `homepage.feature`). Reuse the same base name as the matching automated spec when one exists or is planned (`homepage.spec.ts` ↔ `homepage.feature`).

E2E smoke and mock scenarios for the same feature share one `.feature` file — the `@smoke`/`@mock` tag (below) says which one a scenario is or will become, not the file location.

## Phase 1 — Locate convention

If `qa/docs/test-cases/<layer>/` already has `.feature` files, read one before writing a new one — match its tagging, phrasing, and level of detail. If the folder is empty, follow the template below.

## Phase 2 — Write the feature file

### Structure

```gherkin
Feature: <business-readable name>

  <optional 1-3 sentence context: what this feature does, where it lives
  (route/page), and why it matters>

  Background:
    Given <precondition every scenario below actually needs>

  @smoke @manual
  Scenario: <short, specific outcome>
    Given <initial context, with concrete example data if the scenario needs any>
    When the user clicks "<exact visible button/link text>"
    Then the message "<exact visible text>" is shown

  @regression @manual
  Scenario Outline: <parameterized case>
    When the user clicks "Submit" without filling in "<field>"
    Then a validation error is shown on the "<field>" field

    Examples:
      | field    |
      | Email    |
      | Password |
```

### Tags

- `@smoke` / `@regression` — run scope. Smoke = small critical-path set. Regression = broader coverage.
- `@mock` — for an E2E scenario, marks it as one that needs (or already has) a stubbed backend response rather than the real one — see `write-tests`' smoke-vs-mock split. Combine with `@smoke`/`@regression` as needed (e.g. `@smoke @mock` for a critical-path check that still needs a specific stubbed response). Not applicable outside E2E.
- `@manual` / `@automated` — implementation status. New scenarios start `@manual`.
- When a scenario gets automated, flip the tag to `@automated` and add a comment line above it pointing at the spec — under `e2e/smoke/` or `e2e/mock/` depending on the `@mock` tag:

  ```gherkin
  # Automated by: qa/tests/playwright/e2e/smoke/homepage.spec.ts
  @smoke @automated
  Scenario: ...

  # Automated by: qa/tests/playwright/e2e/mock/sign-in.spec.ts
  @mock @automated
  Scenario: ...
  ```

### Write for both readers

A step has to read naturally to someone who has never opened the codebase, **and** hand whoever automates it something they don't have to go hunting for. Both come from the same habit: use the exact words the app actually shows.

- **Quote exact, literal UI copy** — button labels, link text, headings, error/toast messages — pulled from the real translation strings or rendered component, not a paraphrase. `When the user clicks "Sign in"`, not `When the user submits the login form`; `Then the message "You have entered incorrect login credentials." is shown`, not `Then an error is shown`. This is still user-perspective (it's what they read on screen), not implementation detail (a CSS selector or component name would be) — and it means a step can become a Playwright locator (`getByRole("button", { name: "Sign in" })`) by copy-paste, no guessing required.
- **Use concrete example data, not vague placeholders.** `Given an account with email "qa.user@example.com" and password "Test1234!"`, not `Given a registered user`. Pick obviously-illustrative fixture values — never real credentials or anything that looks like a live secret. Concrete data doubles as the fixture the automated test will need.
- One behavior per scenario. Split instead of chaining unrelated `And`s onto one.
- `Given` sets up state, `When` is the single action under test, `Then` asserts an observable outcome — not an implementation detail.
- Reuse step wording across scenarios in the same file — consistent phrasing matters more here than in code, since nothing enforces it.
- Keep `Background` to steps every scenario in the file actually needs. If only some scenarios share a precondition, keep it inline in those scenarios instead.

## Handoff to automated tests

When a scenario is ready to become an automated check, use `write-tests` to implement it in the matching layer under `qa/tests/playwright/` (or as a Vitest test, if it turns out to be app logic rather than browser behavior — see that skill's decision table). After it lands, update the `.feature` file: flip `@manual` → `@automated` and add the `# Automated by:` comment above the scenario.

Given/When/Then map naturally onto a Playwright spec (`Given` → setup/navigation, `When` → the action, `Then` → assertions), which makes the translation mechanical — but the mapping is for whoever writes the spec, not for any tooling.
