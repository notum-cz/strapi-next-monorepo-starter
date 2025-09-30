import { test } from "@playwright/test"

test.describe("Example E2E Test", () => {
  test("Should navigate to the homepage", async ({ page }) => {
    await page.goto("/")
  })
})
