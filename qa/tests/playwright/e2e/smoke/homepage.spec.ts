import { expect, test } from "@playwright/test"

import { HomePage } from "../../helpers/pages/HomePage"

test.describe("Homepage", () => {
  test("loads successfully and has a title", async ({ page }) => {
    const homePage = new HomePage(page)
    const response = await homePage.goTo()

    expect(response?.ok()).toBe(true)
    await expect(page).toHaveTitle(/.+/)
  })
})
