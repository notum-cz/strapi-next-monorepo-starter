import { expect, test } from "@playwright/test"

import { HomePage } from "../../helpers/pages/HomePage"

test.describe("Homepage", () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
  })

  test("loads successfully and has a title", async ({ page }) => {
    const response = await homePage.goTo()

    expect(response?.ok()).toBe(true)
    await expect(page).toHaveTitle(/.+/)
  })

  test("renders the hero headline and primary call to action", async () => {
    await homePage.goTo()

    await expect(homePage.heroHeading).toBeVisible()
    await expect(homePage.getStartedLink).toBeVisible()
  })

  test("shows the primary navigation and the search trigger", async () => {
    await homePage.goTo()

    await expect(homePage.mainNav).toBeVisible()
    await expect(homePage.openSearchButton).toBeVisible()
  })
})
