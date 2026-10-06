import { expect, test } from "@playwright/test"

import { HomePage } from "../../helpers/pages/HomePage"
import { tags } from "../../helpers/test-groups"

test.describe("Homepage", tags("homepage"), () => {
  test("loads successfully and has a title", async ({ page }) => {
    const homePage = new HomePage(page)
    const response = await homePage.goTo()

    expect(response?.ok()).toBe(true)
    await expect(page).toHaveTitle(/.+/)
  })
})
