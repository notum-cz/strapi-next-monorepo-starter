---
name: write-test-cases
description: >
  Use when asked to write or document test cases as Gherkin scenarios —
  e.g. "write test case", "add TC", "document test scenario", "gherkin
  feature", "test case documentation". Produces Given/When/Then
  scenarios as Markdown pages under
  apps/docs/docs/reference/QA/test-cases/ — not automated test
  code (use `write-tests` for that). For QA tribal-knowledge notes
  (not test cases), see `write-qa-notes` instead.
argument-hint: "[feature-or-flow]"
---

# Write Test Cases

Document test cases as Gherkin scenarios, written as Markdown pages under `apps/docs/docs/reference/QA/test-cases/` so Docusaurus builds them into browsable docs. Each page has to work for **three readers at once**: a human skimming the rendered docs site, a human reading the raw Markdown/Gherkin, and whoever (person or agent) turns a scenario into an automated test afterward. No reader gets sacrificed for the others — see "Write for every reader" below.

Reference: [Gherkin reference](https://cucumber.io/docs/gherkin/reference).

No Cucumber runner is wired into this repo, and this skill doesn't add one — these pages are documentation, read by humans and by agents preparing to implement a scenario, not executed by a step-definition framework. For automated Vitest/Playwright tests, use `write-tests` instead. For freeform QA notes that aren't test cases (gotchas, environment quirks), use `write-qa-notes` — its docs live in the sibling `common-knowledge/` folder, not here.

## Where files live

Mirror the automated test layers in `qa/tests/playwright/`, so a doc and its eventual automated spec are easy to pair up:

| Layer                        | Automated tests                  | Test case docs                                               |
| ---------------------------- | -------------------------------- | ------------------------------------------------------------ |
| E2E — smoke (real backend)   | `qa/tests/playwright/e2e/smoke/` | `apps/docs/docs/reference/QA/test-cases/e2e/<feature>.md`    |
| E2E — mock (stubbed backend) | `qa/tests/playwright/e2e/mock/`  | `apps/docs/docs/reference/QA/test-cases/e2e/<feature>.md`    |
| Accessibility                | `qa/tests/playwright/axe/`       | `apps/docs/docs/reference/QA/test-cases/axe/<feature>.md`    |
| SEO                          | `qa/tests/playwright/seo/`       | `apps/docs/docs/reference/QA/test-cases/seo/<feature>.md`    |
| Visual                       | `qa/tests/playwright/visual/`    | `apps/docs/docs/reference/QA/test-cases/visual/<feature>.md` |
| Performance                  | `qa/tests/playwright/perfo/`     | `apps/docs/docs/reference/QA/test-cases/perfo/<feature>.md`  |

Name the file after the feature or flow it covers, kebab-case (e.g. `homepage.md`). Reuse the same base name as the matching automated spec when one exists or is planned (`homepage.spec.ts` ↔ `homepage.md`).

E2E smoke and mock scenarios for the same feature share one page — the `@smoke`/`@mock` tag (below) says which one a scenario is or will become, not the file location.

**First doc in a new layer folder** (`axe/`, `seo/`, `visual/`, `perfo/` — `e2e/` already has one): also add a `_category_.json` next to it, copied from `test-cases/e2e/_category_.json` with `label` changed to match (e.g. `"Accessibility"`, `"SEO"`, `"Visual"`, `"Performance"`) and `position` set to the next free number after the existing layer folders. Without it, Docusaurus still renders the page, just with a less readable auto-generated folder label.

## Phase 1 — Locate convention

If `apps/docs/docs/reference/QA/test-cases/<layer>/` already has pages, read one before writing a new one — match its tagging, phrasing, and level of detail. If the folder is empty, follow the template below.

## Phase 2 — Write the page

### Structure

A page is a short prose intro (what the feature does, where it lives, why it matters — this is what renders as normal text on the docs site) followed by one fenced ` ```gherkin ` block with the full feature:

````markdown
# <Business-readable name>

<1-3 sentence context: what this feature does, where it lives (route/page),
and why it matters. This is plain Markdown, not part of the Gherkin block.>

```gherkin
Feature: <business-readable name>

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
````

The `# <name>` heading is the Docusaurus page title (and sidebar label) — don't skip it even though `Feature: <name>` right below repeats it; they serve different renderers. Everything outside the fence is prose for the docs site; everything inside stays valid, copy-pasteable Gherkin.

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

### Write for every reader

A step has to read naturally to someone who has never opened the codebase, render cleanly on the docs site, **and** hand whoever automates it something they don't have to go hunting for. All three come from the same habit: use the exact words the app actually shows.

- **Quote exact, literal UI copy** — button labels, link text, headings, error/toast messages — pulled from the real translation strings or rendered component, not a paraphrase. `When the user clicks "Sign in"`, not `When the user submits the login form`; `Then the message "You have entered incorrect login credentials." is shown`, not `Then an error is shown`. This is still user-perspective (it's what they read on screen), not implementation detail (a CSS selector or component name would be) — and it means a step can become a Playwright locator (`getByRole("button", { name: "Sign in" })`) by copy-paste, no guessing required.
- **Use concrete example data, not vague placeholders.** `Given an account with email "qa.user@example.com" and password "Test1234!"`, not `Given a registered user`. Pick obviously-illustrative fixture values — never real credentials or anything that looks like a live secret. Concrete data doubles as the fixture the automated test will need.
- One behavior per scenario. Split instead of chaining unrelated `And`s onto one.
- `Given` sets up state, `When` is the single action under test, `Then` asserts an observable outcome — not an implementation detail.
- Reuse step wording across scenarios in the same file — consistent phrasing matters more here than in code, since nothing enforces it.
- Keep `Background` to steps every scenario in the file actually needs. If only some scenarios share a precondition, keep it inline in those scenarios instead.
- No other Markdown formatting (headings, bold, lists) inside the fenced block — it has to stay valid Gherkin a reader could copy out verbatim.

## Handoff to automated tests

When a scenario is ready to become an automated check, use `write-tests` to implement it in the matching layer under `qa/tests/playwright/` (or as a Vitest test, if it turns out to be app logic rather than browser behavior — see that skill's decision table). After it lands, update the page: flip `@manual` → `@automated` and add the `# Automated by:` comment above the scenario.

Given/When/Then map naturally onto a Playwright spec (`Given` → setup/navigation, `When` → the action, `Then` → assertions), which makes the translation mechanical — but the mapping is for whoever writes the spec, not for any tooling.
