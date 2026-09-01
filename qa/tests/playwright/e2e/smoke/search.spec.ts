import { expect, test } from "@playwright/test"

import { SearchPage } from "../../helpers/pages/SearchPage"

test.describe("Site search — real backend", () => {
  test("opening search and typing a query returns grouped results", async ({
    page,
  }) => {
    const searchPage = new SearchPage(page)
    await searchPage.goTo()
    await searchPage.openSearch()
    await searchPage.search("headless cms")

    // The real search returns matches for a common term — results are shown,
    // grouped by content type (the "Strapi Docs" group reliably matches here).
    await expect(searchPage.suggestions).toBeVisible()
    await expect(searchPage.results.first()).toBeVisible()
    await expect(searchPage.dialog.getByText("Strapi Docs")).toBeVisible()
  })
})
