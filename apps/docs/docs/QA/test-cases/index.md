# Test Cases

Gherkin-style test case documentation, one page per feature or flow — part of QA convention for tracking manual and automated test coverage. Every manual scenario across every page below is tracked in the export below — a QA engineer doesn't have to visit each page to see where things stand.

<TestPlanExport planId="all" planName="All Test Cases" />

## Writing a test case

Each page is one Markdown file with a single fenced ` ```gherkin ` block — see [Login](./login.md) for a full example. A few rules keep every page useful to the same three readers (a person skimming the rendered docs, a person reading raw Gherkin, and whoever automates the scenario next):

- **Exact, literal UI copy** in steps — button labels, error messages — not paraphrased. A step should be verifiable purely by looking at the screen.
- **Tags** carry the scenario's status and scope:
  - `@smoke` / `@regression` — how central the flow is (critical path vs broader coverage)
  - `@mock` — this scenario needs a stubbed backend to trigger (an error state, a dropped connection)
  - `@manual` / `@automated` — whether a spec covers it yet
- Once a `@manual` scenario gets automated, flip its tag to `@automated` and add a comment above it pointing at the spec: `# Automated by: qa/tests/playwright/e2e/mock/sign-in.spec.ts`.

There's no Cucumber (or any other Gherkin) runner wired into this repo — these pages are read by humans and agents, nothing executes the `.feature`-style blocks directly.

## The Pass/Fail checklist

Every ` ```gherkin ` block rendered on the docs site gets a checklist generated automatically below it — one row per `@manual` scenario (`@automated` ones are skipped, since a spec already covers them). Checking a row saves to **the browser's `localStorage`** — per device, not shared between people and not git-versioned.

`<TestPlanExport>` turns those results into a one-click export:

- `planId="all"` (as used above) — every scenario, on every page, in one view. The default; add anything more specific only when it earns its keep.
- A **Test Plan** is a named, narrowed selection of pages — a release regression pass, an accessibility sweep — built by passing an explicit `pages` array instead of relying on `"all"`.
