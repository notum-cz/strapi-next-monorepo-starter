# Exercise 1 — Write a Gherkin test case

**Goal:** document a flow that has no test case yet, as a proper Gherkin scenario. The specific flow doesn't matter here — what matters is correct Gherkin structure, tagging, and putting the file in the right place. Pick whatever's realistic on your own project: Register, Login, or any of the Exercise 0 alternatives (contact form, newsletter, search, filters, cookie banner, ...) — anything that doesn't already have a page under `test-cases/`.

**Read first:** `apps/docs/docs/reference/QA/test-cases/login.md` for structure/tagging/detail level. If you have the `write-test-cases` agent skill, use it and review the output — either way, understand every line.

## Step 1 — Explore the flow for real

Open your chosen flow on `<BASE_URL>` and actually use it before writing anything:

- Try the happy path end to end.
- Try obvious client-side validation errors (empty required fields, bad input format).
- Try to trigger a backend-driven error if one plausibly exists (a duplicate/invalid value, a state the backend would reject).
- Note the exact, literal copy you see — button labels, field labels, error/success messages. That's what goes in the Gherkin steps, not a paraphrase.

**Using Register** (this workshop's worked example, if you don't have another flow in mind)? Here's the base starter's reference copy — your project's branding/translations may differ, so the app in front of you is still the source of truth:

| Element                                     | Exact text                                                              |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| Card title                                  | "Registration"                                                          |
| Field labels                                | "E-mail address", "Create password", "Confirm password" (each required) |
| Submit button                               | "Create account"                                                        |
| Link to sign-in                             | "Already have an account?" + "Sign in."                                 |
| Empty/invalid email error                   | "Invalid format"                                                        |
| Password/confirmation too short (< 6 chars) | "String must be at least 6 characters"                                  |
| Passwords don't match                       | "Passwords do not match"                                                |
| Email already registered                    | "Email is already taken. Please choose another one."                    |
| Backend unreachable                         | "Registration failed. Please try again later."                          |
| On success                                  | full-page redirect to `/`, signed in — no confirmation email/activation |

## Step 2 — Write the page

Create `apps/docs/docs/reference/QA/test-cases/<your-flow>.md` — kebab-case, named after the flow (`register.md`, `contact-form.md`, `newsletter.md`, whatever fits). See `../../../.claude/skills/write-test-cases/SKILL.md` for the full convention:

1. Short prose intro (1-3 sentences: what/where/why) — style of `login.md`'s opening.
2. One fenced ` ```gherkin ` block, `Feature: <your flow>`, with a `Background` for the shared precondition.

Cover whatever scenarios make sense for **your** flow — pick tags yourself (`@smoke`/`@regression`, `@mock` where relevant, `@manual` for all of them today). As a shape to aim for, most flows end up needing something like:

- The happy path succeeds
- At least one client-side validation error is blocked (`Scenario Outline` + `Examples` if there are several similar cases — see `login.md`)
- At least one backend-driven error, if your flow plausibly has one (this is what Exercise 7 later turns into a mock test)
- Any navigation link the flow exposes goes where it says it does

If you're doing Register specifically, that shape maps to: valid registration succeeds, email-already-taken error, backend-unreachable error, each required field empty is blocked, invalid email format, too-short password, mismatched confirmation, and the "Sign in." link.

Use the **exact copy** you captured in Step 1, not paraphrased. Use concrete example data, never vague placeholders.

## Step 3 — Sanity-check it renders

Start the docs site if needed (`pnpm dev:docs`, http://localhost:3300), open your page. Confirm the Gherkin block renders and a Pass/Fail checklist appears below it (automatic — covered in Exercise 8).

## Checkpoint

Keep this page open. Exercise 7 comes back to automate some of these scenarios — if you documented Register (or Login, per Exercise 0), it walks you through that directly; if you picked something else, the same POM/smoke/mock pattern still applies, you're just pointing it at your own flow instead of copying the example verbatim.

Move on to [02-configure-qa-workspace.md](./02-configure-qa-workspace.md).
