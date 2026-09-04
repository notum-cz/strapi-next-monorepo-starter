---
name: write-test-cases
description: >
  Use when asked to write or document test cases as Gherkin scenarios —
  e.g. "write test case", "add TC", "document test scenario", "gherkin
  feature", "test case documentation". Produces Given/When/Then
  scenarios as Markdown pages under
  apps/docs/docs/QA/test-cases/ — not automated test
  code (use `write-tests` for that). For QA tribal-knowledge notes
  (not test cases), see `write-qa-notes` instead.
argument-hint: "[feature-or-flow]"
---

# Write Test Cases

Document test cases as Gherkin scenarios, written as Markdown pages under `apps/docs/docs/QA/test-cases/` so Docusaurus builds them into browsable docs. Each page has to work for **three readers at once**: a human skimming the rendered docs site, a human reading the raw Markdown/Gherkin, and whoever (person or agent) turns a scenario into an automated test afterward. No reader gets sacrificed for the others — see "Write for every reader" below.

Reference: [Gherkin reference](https://cucumber.io/docs/gherkin/reference).

No Cucumber runner is wired into this repo, and this skill doesn't add one — these pages are documentation, read by humans and by agents preparing to implement a scenario, not executed by a step-definition framework. For automated Vitest/Playwright tests, use `write-tests` instead. For freeform QA notes that aren't test cases (gotchas, environment quirks), use `write-qa-notes` — its docs live in the sibling `common-knowledge/` folder, not here.

## Where files live

Feature pages live flat, directly under `apps/docs/docs/QA/test-cases/<feature>.md` — no required subfolder per layer or plan. Name the file after the feature or flow it covers, kebab-case (e.g. `homepage.md`). Reuse the same base name as the matching automated spec when one exists or is planned (`homepage.spec.ts` ↔ `homepage.md`).

Scenarios that will run against a real backend and ones that need a stubbed backend for the same feature share one page — the `@smoke`/`@regression`/`@mock` tags (below) say what each scenario is, not the file location.

Every manual scenario on every page is automatically covered by the site-wide export on `test-cases/index.md` (see "Interactive checklist" below) — adding a new feature page needs nothing else to show up there.

### Test Plans (optional)

A Test Plan is a page that curates a named subset of existing feature pages for a specific purpose (a release regression pass, an accessibility sweep) — it doesn't own or contain those pages, it just references them by id, so the same page can belong to more than one plan. Nothing requires creating one; only add a plan when a QA engineer actually wants a narrower, named view than "everything."

To create one, add a single Markdown page anywhere under `test-cases/` (a flat file is enough — no `_category_.json` or folder needed):

```markdown
# <Plan Name> Test Plan

<What this plan covers and when a QA engineer runs it.>

<TestPlanExport planId="<plan-id>" planName="<Plan Name> Test Plan" pages={["<pageId>", "<pageId>"]} />
```

A `pageId` is the target page's path relative to `test-cases/`, without the `.md` extension — `login.md` at the top level is `"login"`; a page nested one level down would be `"subfolder/feature"`. `<TestPlanExport>` is a global component (no import needed, see `apps/docs/src/theme/MDXComponents.tsx`).

**Routing constraint:** don't add custom `slug` frontmatter to a test-case page. The `test-plan-manifest` build plugin (`apps/docs/src/plugins/testPlanManifest.ts`) computes each page's route — and its `pageId` — from its file path to match it up with the browser's `localStorage` results and with `pages` lists in Test Plans. A custom slug would desync all three and silently drop the page from exports.

## Phase 1 — Locate convention

If `test-cases/` already has pages, read one before writing a new one — match its tagging, phrasing, and level of detail. If the folder is empty, follow the template below.

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

### Interactive checklist (automatic, don't add it yourself)

Every ` ```gherkin ` block on the rendered docs site automatically gets a Pass/Fail checklist injected right below it — one row per `@manual`-tagged `Scenario`/`Scenario Outline`, labeled with its title and tags. `@automated` scenarios are deliberately left out of this checklist — they're already covered by the Playwright/Vitest spec that runs them, so there's nothing for a human to click through. This is build-time tooling (a remark plugin + `GherkinChecklist` component, see `apps/docs/src/remark/gherkin-checklist.ts`), not something you write into the page. Just author the fenced block as shown above and the checklist appears for free.

Results (pass/fail per scenario) are saved to the viewing QA engineer's browser `localStorage` only — per-device, not shared across the team and not git-versioned. There's no export button on the checklist itself — `test-cases/index.md` renders `<TestPlanExport planId="all" planName="All Test Cases" />` (no `pages` prop, so it covers every page) once for the whole section, with the same component narrower Test Plans use. Nothing to do differently in the Markdown either way.

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
