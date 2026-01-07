import { expect, test } from "@playwright/test"

test.describe("Example E2E Test", () => {
  test("Should navigate to the homepage and check title on the page", async ({
    page,
  }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveTitle(/.+/)
  })
})
