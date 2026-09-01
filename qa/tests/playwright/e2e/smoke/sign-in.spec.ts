import { expect, test } from "@playwright/test"

import { HomePage } from "../../helpers/pages/HomePage"

const email = process.env.SMOKE_SIGN_IN_EMAIL
const password = process.env.SMOKE_SIGN_IN_PASSWORD

test.describe("Sign in", () => {
  test("redirects to the homepage after signing in with valid credentials", async ({
    page,
  }) => {
    test.skip(
      !email || !password,
      "SMOKE_SIGN_IN_EMAIL/SMOKE_SIGN_IN_PASSWORD are not set"
    )

    const homePage = new HomePage(page)
    await homePage.goTo()

    await expect(page).toHaveURL("?showLogin=True")
    await homePage.signIn(email!, password!)

    await expect(homePage.signInHeading).toBeHidden()
    await expect(page).toHaveURL("?showLogin=True")
  })
})
