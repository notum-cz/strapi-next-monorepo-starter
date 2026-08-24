import type { Page } from "@playwright/test"

export class HomePage {
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goTo() {
    const response = await this.page.goto("/", {
      waitUntil: "domcontentloaded",
    })
    await this.page.waitForLoadState("networkidle")

    return response
  }
}
