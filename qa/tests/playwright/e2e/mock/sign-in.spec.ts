// Mocked responses approximate the real sign-in endpoint's error contract
// (see the strapiAuthPlugin in the UI app's auth setup). Re-check the shape
// against a real response if this drifts.
import { expect, test } from "../../helpers/fixtures"
import { SignInPage } from "../../helpers/pages/SignInPage"

test.describe("Sign in — mocked backend responses", () => {
  test("shows the credentials error for a known invalid-login response", async ({
    page,
    mockJson,
  }) => {
    await mockJson(
      "**/api/auth/sign-in-strapi",
      { message: "Invalid identifier or password" },
      { status: 401 }
    )

    const signInPage = new SignInPage(page)
    await signInPage.goTo()
    await signInPage.signIn("qa.user@example.com", "WrongPassword!")

    await expect(
      page.getByText("You have entered incorrect login credentials.")
    ).toBeVisible()
  })

  test("shows the generic error when the backend is unreachable", async ({
    page,
  }) => {
    // A dropped connection has no response body to parse, unlike the mocked
    // JSON error above — this is the case mocking earns its keep, since a
    // real backend outage isn't something you can trigger on demand.
    await page.route("**/api/auth/sign-in-strapi", (route) => route.abort())

    const signInPage = new SignInPage(page)
    await signInPage.goTo()
    await signInPage.signIn("qa.user@example.com", "Test1234!")

    await expect(
      page.getByText("Sign in failed. Please try again later.")
    ).toBeVisible()
  })
})
