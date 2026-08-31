# Exercise 8 — E2E: smoke and mock

**Goal:** the main event — turn Exercise 1's scenarios into real, automated coverage. One Page Object, one **smoke** spec against the real backend, two **mock** specs against a stubbed one, then run everything built today.

**Read first:** `../reference/pom-and-test-types.md` — POM rules and the smoke-vs-mock heuristic this exercise applies for real. Skim `qa/tests/playwright/e2e/smoke/homepage.spec.ts` and `qa/tests/playwright/e2e/mock/sign-in.spec.ts` as style references.

If you have the `write-tests` agent skill, use it for Steps 2-4 and review the output line by line — same deal as `write-test-cases` in Exercise 1. `write-qa-notes` makes another appearance in Step 3, for the one finding worth writing down rather than fixing.

**Needs:** the test case doc from Exercise 1 (whatever flow you documented). `BASE_URL` configured (Exercise 0) pointing at your own project.

Everything below walks through **Register** as the worked example — code, exact strings, the lot. If you documented Register (or Login, via Exercise 0's fallback), follow it directly. If you documented something else, apply the same reasoning to your own scenarios: same POM shape, same smoke-vs-mock split, just your own page, fields, and backend errors instead of copying the Register code verbatim.

## Step 1 — Decide the layer per scenario, on paper first

For Register, that split looks like this — do the same exercise for your own scenarios if you picked a different flow:

| Scenario                   | Layer         | Why                                                                           |
| -------------------------- | ------------- | ----------------------------------------------------------------------------- |
| Valid, unused details      | **smoke**     | Real backend can do this on demand.                                           |
| Email already taken        | **mock**      | Reliably reproducing this against a real, possibly-shared backend is fragile. |
| Backend unreachable        | **mock**      | Can't make a real backend go down on demand.                                  |
| Field-validation scenarios | _(not today)_ | Client-side zod validation — out of scope for browser-level automation today. |

## Step 2 — Build the Page Object

New: `qa/tests/playwright/helpers/pages/RegisterPage.ts`, same shape as `SignInPage.ts`:

- Locators: email, password, confirm-password, submit (`getByLabel`/`getByRole` — required fields render a trailing `*`, so skip `exact: true` on the label match)
- `goTo()` — navigates to `/auth/register`
- `register(email, password, passwordConfirmation)` — fills and submits
- No assertions — this POM is shared by three specs

## Step 3 — The smoke spec (real backend)

New: `qa/tests/playwright/e2e/smoke/register.spec.ts`. Creates a real Strapi user on your project every run — use a **unique email** so repeat runs don't collide:

```typescript
import { expect, test } from "@playwright/test"

import { RegisterPage } from "../../helpers/pages/RegisterPage"

test.describe("Register — real backend", () => {
  test("registers a new account and signs the user in", async ({ page }) => {
    const uniqueEmail = `qa.training.${Date.now()}@example.com`

    const registerPage = new RegisterPage(page)
    await registerPage.goTo()
    await registerPage.register(uniqueEmail, "Test1234!", "Test1234!")

    await expect(page).toHaveURL("/")
    await expect(page.getByRole("link", { name: "Sign in" })).not.toBeVisible()
  })
})
```

No visible "signed in" text — confirm the "Sign in" link is gone instead. Further: the signed-in account menu is an icon-only button with no accessible name; click it to reveal "Sign out" / "Account".

**Data hygiene:** this creates a permanent Strapi user on your project every run, no cleanup — a real limitation of testing registration against a real backend. Flag it, don't fix it here — write it up with `write-qa-notes` (`common-knowledge/index.md`) so the next person to write a smoke test against a real backend doesn't rediscover it the hard way.

## Step 4 — The mock specs (stubbed backend)

New: `qa/tests/playwright/e2e/mock/register.spec.ts`, two tests — both mocking mechanisms:

```typescript
import { expect, test } from "../../helpers/fixtures"
import { RegisterPage } from "../../helpers/pages/RegisterPage"

test.describe("Register — mocked backend responses", () => {
  test("shows an error when the email is already taken", async ({
    page,
    mockJson,
  }) => {
    await mockJson(
      "**/api/auth/register-strapi",
      { message: "Email or Username are already taken" },
      { status: 400 }
    )

    const registerPage = new RegisterPage(page)
    await registerPage.goTo()
    await registerPage.register(
      "existing.user@example.com",
      "Test1234!",
      "Test1234!"
    )

    await expect(
      page.getByText("Email is already taken. Please choose another one.")
    ).toBeVisible()
  })

  test("shows the generic error when the backend is unreachable", async ({
    page,
  }) => {
    await page.route("**/api/auth/register-strapi", (route) => route.abort())

    const registerPage = new RegisterPage(page)
    await registerPage.goTo()
    await registerPage.register(
      "new.qa.user@example.com",
      "Test1234!",
      "Test1234!"
    )

    await expect(
      page.getByText("Registration failed. Please try again later.")
    ).toBeVisible()
  })
})
```

Endpoint: `/api/auth/register-strapi` (`apps/ui/src/lib/auth.ts`, same pattern as `sign-in-strapi`) — infra wiring, the same across every project on this starter. The toast text asserted above is the base starter's — swap in your own project's actual wording from Exercise 1 if it's been translated/rebranded. Register each mock **before** navigating/submitting.

## Step 5 — Run everything

```bash
pnpm tests:playwright:e2e:smoke   # your smoke spec + the existing homepage one
pnpm tests:playwright:e2e:mock    # your mock spec + the existing sign-in one
pnpm tests:playwright:e2e:test    # both together
```

All should pass. Open the report and confirm your three new tests sit alongside the pre-existing ones.

Then try the same suite in **UI mode**, Playwright's interactive test runner:

```bash
pnpm tests:playwright:e2e:test:interactive
```

Run your smoke and mock specs from there instead of the CLI: step through actions one at a time, see the DOM/network/console at each step, and time-travel back through a failed run instead of re-running it blind. This is what you reach for once a test fails and the terminal output alone doesn't say why.

## Step 6 — Close the loop in the docs

Back in your Exercise 1 test case doc, flip the now-automated scenarios `@manual` → `@automated` (Register example below — adjust scenario names/paths to whatever you actually documented and built):

```gherkin
  # Automated by: qa/tests/playwright/e2e/smoke/register.spec.ts
  @smoke @automated
  Scenario: Registering with valid, unused details

  # Automated by: qa/tests/playwright/e2e/mock/register.spec.ts
  @mock @automated
  Scenario: Registering with an email that is already taken

  # Automated by: qa/tests/playwright/e2e/mock/register.spec.ts
  @mock @automated
  Scenario: Seeing a generic error when the backend is unreachable
```

Leave the validation scenarios `@manual` — a "not today" call, not a forgotten one.

## Step 7 — Stretch: see it run in CI

If time allows, go back to Exercise 7 and trigger the workflow again with **E2E** checked — now it includes what you just wrote.

## Checkpoint

For each new test, explain _why_ it's smoke or mock, not just that it is one. Re-run `pnpm tests:playwright:e2e:test` from a clean state to confirm nothing is order-dependent.

Move on to [09-checklist-and-export.md](./09-checklist-and-export.md).
