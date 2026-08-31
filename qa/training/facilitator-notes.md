# Facilitator Notes — don't hand this out

Answer key and known snags per exercise. Use it to unblock pairs without doing the exercise for them.

## General

- Everyone points `BASE_URL` at their own project's test/staging domain (same starter codebase, different branding/content) — no local Strapi/UI. A pair stuck on connection errors likely has the wrong URL or their project's environment is down, not a broken local setup.
- **Backup `BASE_URL` for no-auth projects:** `https://terapie-v3-pt-stg-31dbd1b8ada1.herokuapp.com`. It only has Login (Czech, `/login`, forgot-password at `/reset-password`) — no public registration, so it doesn't cover the "registration disabled but sign-in exists" case, only the "no auth at all" case. Confirm it's still up before the session. No `/auth/register` on someone's project: if their project still has sign-in, Exercise 0 sends them to **Login** on their own project instead of Register (worked examples already in this repo: `test-cases/login.md`, `SignInPage.ts`, `e2e/mock/sign-in.spec.ts`). Only route people with **no auth anywhere** to the backup — exercises 1, 3, 4, 5, 7 there; 2, 6, 8 stay on their own project regardless. Exercise 0 also lists picking a completely different flow (contact form, newsletter, search, filters, cookie banner, locale switcher) as a third option instead of the backup — encourage this over the backup when their own project has something usable, it's a more realistic rep than practicing on someone else's app.
- Exact UI copy (titles, error toasts) can differ per project if it's been translated/rebranded — the tables in the exercises are from the base starter. Steer people to trust their own screen over the doc when the two disagree.
- Exercise 8's smoke spec registers one real account on the participant's own project per run — a leftover test account on their project afterward, not a shared resource issue.
- Exercises 2-7 (config, SEO, axe, visual, Lighthouse, CI) are the warm-up — mechanical, lower-stakes. Exercise 8 (E2E) is the main event and should get the largest block of time. Don't let the warm-up squeeze it — exercises 2, 6, 7, 9 are the ones to shorten if it runs long.
- Exercise 5's Docker step is the likely stall point before the main block — kick off `tests:playwright:visual:docker:update` before explaining the rest of that exercise, so the image pull happens in the background.
- Pair mixed experience for exercises 1, 3, 4, 8 (judgment calls); 2, 5, 6, 7, 9 work fine solo.
- Everyone uses the same flow (Register), so everyone hits the same snags at once — address a common one to the whole room rather than pair-by-pair.
- Early finishers in Exercise 1 or 7: point them at **Forgot Password** (`/auth/forgot-password`) — no test-case doc or POM either. Reference copy: title "Forgot password", description "Enter the email you usually use to sign in. We will send instructions to reset your password to this email.", field "Email", button "Recover account", success toast "An email with password reset instructions has been sent to you." (shown regardless of whether the email exists — not a bug), error fallback "Failed to send password reset email".

## Exercise 1 answer key

This exercise is deliberately open — any flow is a valid answer, the actual grading criteria is correct Gherkin structure/tags/file placement, not "did they document Register." Most people will still default to Register since it's the worked example; here's that version for reference. **Everything stays `@manual`** — nothing is automated until Exercise 8:

Full `apps/docs/docs/reference/QA/test-cases/register.md`:

````markdown
# Register

New users create an account with an email and password on the registration
page (`/auth/register`). A successful registration signs the user in
immediately and returns them to the home page — there is no email
confirmation step in this environment.

```gherkin
Feature: Register

  Background:
    Given the user is on the registration page

  @smoke @manual
  Scenario: Registering with valid, unused details
    Given no account exists with email "new.qa.user@example.com"
    When the user fills in "E-mail address" with "new.qa.user@example.com"
    And fills in "Create password" with "Test1234!"
    And fills in "Confirm password" with "Test1234!"
    And clicks "Create account"
    Then the user is redirected to the home page
    And the user is signed in

  @mock @manual
  Scenario: Registering with an email that is already taken
    Given an account already exists with email "existing.user@example.com"
    When the user fills in "E-mail address" with "existing.user@example.com"
    And fills in "Create password" with "Test1234!"
    And fills in "Confirm password" with "Test1234!"
    And clicks "Create account"
    Then the message "Email is already taken. Please choose another one." is shown
    And the user remains on the registration page

  @mock @manual
  Scenario: Seeing a generic error when the backend is unreachable
    Given the registration backend is unreachable
    When the user fills in "E-mail address" with "new.qa.user@example.com"
    And fills in "Create password" with "Test1234!"
    And fills in "Confirm password" with "Test1234!"
    And clicks "Create account"
    Then the message "Registration failed. Please try again later." is shown
    And the user remains on the registration page

  @regression @manual
  Scenario Outline: Submitting the form with a required field left empty is blocked
    When the user clicks "Create account" without filling in "<field>"
    Then a validation error is shown on the "<field>" field
    And the user remains on the registration page

    Examples:
      | field             |
      | E-mail address    |
      | Create password   |
      | Confirm password  |

  @regression @manual
  Scenario: Entering an invalid email format
    When the user fills in "E-mail address" with "not-an-email"
    And clicks "Create account"
    Then the message "Invalid format" is shown on the "E-mail address" field
    And the user remains on the registration page

  @regression @manual
  Scenario: Entering a password shorter than the minimum length
    When the user fills in "Create password" with "abc"
    And clicks "Create account"
    Then the message "String must be at least 6 characters" is shown on the "Create password" field
    And the user remains on the registration page

  @regression @manual
  Scenario: Confirming with a password that doesn't match
    When the user fills in "Create password" with "Test1234!"
    And fills in "Confirm password" with "Different1234!"
    And clicks "Create account"
    Then the message "Passwords do not match" is shown
    And the user remains on the registration page

  @regression @manual
  Scenario: Going to "Sign in" from the registration page
    When the user clicks "Sign in."
    Then the user is taken to the sign-in page
```
````

Trip-ups: someone will want to mark something `@automated` early — keep everything `@manual` until Exercise 8. "Invalid format" is the one real message for both empty and malformed email — don't let anyone invent a second one.

## Exercise 2

Trivial by design. Main failure mode: a JSON syntax error in `urls.json` (trailing comma) — `playwright test --list` just silently shows the old count instead of erroring. Check JSON validity first if a list didn't grow.

## Exercise 3 — SEO answer key

**A real, verified gap on the base starter, not a scripted failure.** Since every participant tests their own project, results can vary slightly (a project may have already patched this), but the root cause is infra-level (layout/component code shared by every project on this starter), so expect most rooms to see it. Adding `/auth/signin` and `/auth/register` should fail: Title, Meta description, Canonical, H1, Structured data (JSON-LD), Open Graph.

**The triage answer they should reach in Step 3:** open Strapi admin, search Content Manager → Page for `/auth/register` / `/auth/signin` — **no entry exists**. These routes are hand-built Next.js pages (`apps/ui/src/app/[locale]/auth/register/page.tsx`, `signin/page.tsx`) with no `generateMetadata` and no Strapi fetch at all — there is genuinely nothing to edit in the CMS. Contrast this with `/`, which _is_ a Page entry — its SEO component (`seo-utilities.seo`: metaTitle, metaDescription, canonicalUrl, metaRobots, og/twitter sub-components, structuredData) and its Hero section's title field are exactly where a content editor would fix any of these same checks if `/` ever failed them. That contrast — "found in Strapi, fix it there" vs. "not in Strapi, it's code" — is the actual lesson, not the specific React internals.

Stays green: Robots (no tag → short-circuits), hreflang (no alternates → short-circuits), Heroku references. `/` stays green throughout (it's a real Page entry with its SEO component filled in).

Real as of when this was written — if it's since been fixed, discuss "what if it hadn't been" instead of forcing a fake failure. **Don't let anyone fix app code live** — for a code-owned gap the deliverable is a follow-up ticket (+ a `write-qa-notes` entry for tribal knowledge), not a mid-workshop patch.

## Exercise 4 — Axe answer key

Same root cause as Exercise 3: no `<main>` outside `StrapiPageView`. Expect `landmark-one-main` (and likely `region`) on both auth pages, moderate impact — best-practice rules, which is why "warning, don't block" is defensible here.

Verify exact rule ids against your own run before the session — axe-core rule sets shift between versions.

Trip-ups: typo'd rule id leaves the violation in `errorViolations` with no error pointing at the typo (diff character-for-character); `GLOBAL_WARNING_RULE_IDS` instead of `PATH_CONFIGS` suppresses it on `/` too, where it doesn't exist; someone wanting to fix `<main>` for real — same call as Exercise 3, not in scope.

## Exercise 5 — Visual

Mechanical once Docker's running. Kick off `tests:playwright:visual:docker:update` early so the image pull isn't dead air. No Docker → still do Steps 1-4, skip 5-7.

## Exercise 6 — Lighthouse

Lightest of the suite exercises. The whole point is noticing `pnpm tests:lhci:perfo` exits `0` no matter how bad the score is — if someone doesn't check the exit code, they'll miss the actual lesson and think the exercise is just "look at some scores." Nudge them to run `echo $?` themselves rather than taking your word for it.

## Exercise 7

Not E2E this time — nothing to show yet (that's Exercise 8's job). SEO + axe + visual together in one dispatch is deliberate: it's what a real pre-release CI run looks like, and participants already know what all three check from Exercises 3-5. Connection-refused/timeout errors mean `BASE_URL` is wrong or that participant's project is down — confirm before debugging Playwright config. Visual likely won't have Linux baselines yet (that's fine, covered in Step 4) — don't let anyone mistake the skip for a failure. Lighthouse is an optional add-on here (`run_lhci_perfo`) — same "can't fail" gap from Exercise 6, just remote.

## Exercise 8 answer key — the big one

The exercise the day builds toward — budget the largest single block of time for it.

`qa/tests/playwright/helpers/pages/RegisterPage.ts`:

```typescript
import type { Locator, Page } from "@playwright/test"

export class RegisterPage {
  private readonly page: Page

  readonly emailField: Locator
  readonly passwordField: Locator
  readonly confirmPasswordField: Locator
  readonly submitButton: Locator
  readonly signInLink: Locator

  constructor(page: Page) {
    this.page = page
    // Required fields render a trailing "*" in their label, so these stay
    // substring matches rather than `exact: true`.
    this.emailField = page.getByLabel("E-mail address")
    this.passwordField = page.getByLabel("Create password")
    this.confirmPasswordField = page.getByLabel("Confirm password")
    this.submitButton = page.getByRole("button", {
      name: "Create account",
      exact: true,
    })
    this.signInLink = page.getByRole("link", { name: "Sign in.", exact: true })
  }

  async goTo() {
    const response = await this.page.goto("/auth/register", {
      waitUntil: "domcontentloaded",
    })
    await this.page.waitForLoadState("networkidle")

    return response
  }

  async register(
    email: string,
    password: string,
    passwordConfirmation: string
  ) {
    await this.emailField.fill(email)
    await this.passwordField.fill(password)
    await this.confirmPasswordField.fill(passwordConfirmation)
    await this.submitButton.click()
  }
}
```

`qa/tests/playwright/e2e/smoke/register.spec.ts`:

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

`qa/tests/playwright/e2e/mock/register.spec.ts`:

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

Endpoint: `/api/auth/register-strapi` — `apps/ui/src/lib/auth.ts:80`, same Better Auth pattern as `sign-in-strapi` at line 25. The mocked `message` just needs the substring `"already taken"` — `RegisterForm.tsx`'s `onError` does a substring match.

`register.md` after Step 6 — three scenarios flip, rest stay `@manual`:

```gherkin
  # Automated by: qa/tests/playwright/e2e/smoke/register.spec.ts
  @smoke @automated
  Scenario: Registering with valid, unused details
    ...

  # Automated by: qa/tests/playwright/e2e/mock/register.spec.ts
  @mock @automated
  Scenario: Registering with an email that is already taken
    ...

  # Automated by: qa/tests/playwright/e2e/mock/register.spec.ts
  @mock @automated
  Scenario: Seeing a generic error when the backend is unreachable
    ...
```

Trip-ups:

- Guessing a Strapi-native path (`/api/auth/local/register`) instead of `/api/auth/register-strapi` — send them to `auth.ts` rather than telling them outright, if time allows.
- `getByLabel("Create password")` partially matching "Confirm password" on a typo'd label — remind them labels match by accessible name; `page.getByLabel(...).count()` catches accidental double-matches.
- Forgetting to register the mock before `goTo()`/`register()` — test hangs waiting for a toast that never comes.
- Hardcoded (not timestamped) email in the smoke spec — second run fails on "already taken" instead of succeeding. Good teaching moment on e2e data hygiene, not a bug to silently fix.
- Trying to assert the icon-only account-menu button by role/name — it has none. Assert the _absence_ of "Sign in" instead; going further needs a click first.
- Scope creep into automating the validation scenarios too — Step 1 deliberately leaves those `@manual`. Eats into time this exercise needs.

## Exercise 9

Depends on Exercise 8's tag flips existing — behind pairs get the answer key above, not a block. Keep it short; don't let it absorb time Exercise 8 needed.
