import type { Locator, Page } from "@playwright/test"

import { dismissCookieBanner } from "../cookies"

export class SearchPage {
  private readonly page: Page

  readonly openSearchButton: Locator
  readonly dialog: Locator
  readonly searchInput: Locator
  readonly suggestions: Locator
  readonly results: Locator
  readonly closeButton: Locator

  constructor(page: Page) {
    this.page = page
    this.openSearchButton = page.getByRole("button", {
      name: "Open search",
      exact: true,
    })
    // Everything below is scoped inside the dialog so a locator can't match
    // page content sitting behind the open search overlay.
    this.dialog = page.getByRole("dialog")
    // The dialog has a single combobox (the query field), so no name needed.
    this.searchInput = this.dialog.getByRole("combobox")
    this.suggestions = this.dialog.getByRole("listbox", { name: "Suggestions" })
    this.results = this.suggestions.getByRole("option")
    this.closeButton = this.dialog.getByRole("button", {
      name: "Close search",
      exact: true,
    })
  }

  async goTo() {
    const response = await this.page.goto("/", {
      waitUntil: "domcontentloaded",
    })
    await dismissCookieBanner(this.page)
    // strapi.io holds connections open (analytics, the Ask-AI widget), so
    // "networkidle" never settles on WebKit. Wait for the search trigger to
    // render instead — that's the element the search flow actually needs.
    await this.openSearchButton.waitFor({ state: "visible" })

    return response
  }

  async openSearch() {
    await this.openSearchButton.click()
    await this.searchInput.waitFor()
  }

  async search(query: string) {
    // Results load live as the query is typed — there is no submit button.
    await this.searchInput.fill(query)
  }
}
