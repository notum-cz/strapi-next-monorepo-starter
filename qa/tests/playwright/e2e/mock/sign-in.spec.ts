// Mocks the real SabbaticalHomes login modal's backend endpoint
// (see e2e/smoke/sign-in.spec.ts for the equivalent test against the live
// backend). The generic-error copy below hasn't been re-verified against a
// real network failure on the live app — re-check it if this test starts failing.
import { expect, mockTest as test } from "../../helpers/fixtures"
import { HomePage } from "../../helpers/pages/HomePage"

test.describe("Sign in — mocked backend responses", () => {
  test("shows the credentials error for a known invalid-login response", async ({
    page,
    mockJson,
  }) => {
    await mockJson(
      "**/api/auth/login",
      { message: "Invalid identifier or password" },
      { status: 401 }
    )
    const responsePromise = page.waitForResponse("**/api/auth/login")

    const homePage = new HomePage(page)
    await homePage.goTo()
    await homePage.signIn("qa.user@example.com", "WrongPassword!")

    const response = await responsePromise
    expect(response.status()).toBe(401)

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
    await page.route("**/api/auth/login", (route) => route.abort())

    const homePage = new HomePage(page)
    await homePage.goTo()
    await homePage.signIn("qa.user@example.com", "Test1234!")

    await expect(page.getByText("Sign in failed. Please try")).toBeVisible()
  })
})
