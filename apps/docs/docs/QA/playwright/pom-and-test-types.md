---
sidebar_position: 3
---

# Page Object Model and Smoke vs Mock

## Why a Page Object (POM)

- Without one, every test repeats the same locators/navigation.
- A label/text change = fix in every test that copy-pasted it.
- POM = "how to interact with this page," written once.
- One file per page: `qa/tests/playwright/helpers/pages/<Page>Page.ts`.
- Tests read like a sentence (`registerPage.register(email, password, confirmation)`), not CSS/role soup.
- Shared by both the smoke **and** mock test of the same page.

## Anatomy of a POM

```typescript
import type { Locator, Page } from "@playwright/test"

export class RegisterPage {
  private readonly page: Page

  readonly emailField: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.emailField = page.getByLabel("E-mail address")
    this.submitButton = page.getByRole("button", {
      name: "Create account",
      exact: true,
    })
  }

  async goTo() {
    const response = await this.page.goto("/auth/register", {
      waitUntil: "domcontentloaded",
    })
    await this.page.waitForLoadState("networkidle")
    return response
  }

  async register(email: string, password: string, confirmation: string) {
    await this.emailField.fill(email)
    // ...
    await this.submitButton.click()
  }
}
```

| Rule                                                                                   | Why                                                                                       |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `getByRole`/`getByLabel`, not a CSS selector                                           | Matches what a person/screen reader perceives — a className can change, a label shouldn't |
| Multiple same-named elements → a named locator (`editFooButton`), not a bare `.nth(0)` | A named locator explains itself                                                           |
| Locator scoped inside a dialog: `page.getByRole("dialog").getByRole(...)`              | Otherwise it can match the same name hidden behind a popup                                |
| `goTo()` can return the `Response`, doesn't have to                                    | Smoke sometimes needs it (`response?.ok()`), mock usually doesn't                         |
| **No `expect()` inside a POM**                                                         | See below                                                                                 |

## Why no assertions in a POM

- POM = "how," spec = "what should be true."
- A failed `expect()` in a POM → the error points at the helper file, not the specific test.
- The POM can't be reused when a different spec needs the **opposite** outcome from the same action — example: a mock test expects an error, a smoke test expects a redirect with no error.
- Rule: locators + interactions live in the POM, `expect()` always only in the spec file.

## Smoke vs Mock

- Both live in `e2e/`, both use the same POM.
- The only difference: what answers on the other end of the network.

|                 | **Smoke** (`e2e/smoke/`)   | **Mock** (`e2e/mock/`)                                       |
| --------------- | -------------------------- | ------------------------------------------------------------ |
| Backend         | Real (app + Strapi)        | Faked (`page.route()` / `mockJson`)                          |
| Question        | "Does it work end to end?" | "Does the UI react to this response?"                        |
| Best for        | Happy path, page loads     | Errors, edge cases, hard-to-reproduce states                 |
| Risk of overuse | Slow, needs real data      | A too-perfect mock proves nothing about the real integration |
| Import          | `@playwright/test`         | `test`/`expect` from `helpers/fixtures.ts`                   |

## Which one to pick

- Default = smoke.
- Mock only when the real backend can't reliably produce that response on demand.
- Don't write the same scenario as both smoke and mock at once.

## Mocking — the mechanics

Two building blocks:

- `page.route(urlPattern, handler)` — intercept any request matching this URL instead of sending it for real.
- `route.fulfill({ status, json })` — answer it yourself, as if you were the server.

`mockJson` is just those two, wrapped into one reusable call.

### Example

```typescript
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
```

What happens, in order:

1. `mockJson(...)` — sets the trap, nothing sent yet.
2. `goTo()` + `register(...)` — form submits, the real request fires.
3. Playwright catches it, returns the fake 400 response instead of the real backend.
4. App reacts as if it were real — shows the toast.
5. `expect(...)` confirms the toast appeared.

The email value doesn't matter — the response is fully faked either way.

### Where `mockJson` comes from

Defined once in `qa/tests/playwright/helpers/fixtures.ts`:

```typescript
type MockFixtures = {
  mockJson: (
    url: string | RegExp,
    body: unknown,
    options?: { status?: number }
  ) => Promise<void>
}

export const mockTest = base.extend<MockFixtures>({
  mockJson: async ({ page }, use) => {
    await use(async (url, body, options = {}) => {
      await page.route(url, (route) =>
        route.fulfill({
          status: options.status ?? 200,
          json: body,
        })
      )
    })
  },
})
```

- `type MockFixtures` — just the shape, for TypeScript only. Nothing runs here.
- `base.extend<MockFixtures>({...})` — take Playwright's own `test`, add one more tool on top.
- `{ page }` — the tools this fixture needs to build its own tool.
- `use(...)` — whatever you pass in here is exactly what a test gets when it asks for `mockJson`.
- What's passed in is a function → that function _is_ `mockJson` inside a test.
- Inside it: the same `page.route` + `route.fulfill` from above, written once instead of copy-pasted everywhere.

Chain: fixture built once → a spec imports it → calling `mockJson(...)` sets the trap from the example above.

**Why `mockTest as test`:** ESLint's Playwright plugin looks for the literal name `test`, so specs import it aliased:

```typescript
import { expect, mockTest as test } from "../../helpers/fixtures"
```

### Rules

- **Register the mock before the action that triggers it.** Otherwise the request already went out and nothing catches it — the most common reason a mock test "just doesn't work."
- `**` in the URL is a wildcard — matches regardless of host.
- No response at all (dropped connection, not an error message) → `page.route(url, (route) => route.abort())` instead of `mockJson`.

## Most common mistakes (most frequent first)

1. Mock registered only after the click/submit.
2. Wrong URL written into the mock — looks identical to #1, verify the real endpoint.
3. `expect()` snuck into the POM "just this once."
4. The same error scenario written as both smoke and mock at the same time.
