import type { Locator, Page } from "@playwright/test"

import { dismissCookieBanner } from "../cookies"

export class HomePage {
  private readonly page: Page

  readonly mainNav: Locator
  readonly heroHeading: Locator
  readonly getStartedLink: Locator
  readonly openSearchButton: Locator

  constructor(page: Page) {
    this.page = page
    this.mainNav = page.getByRole("navigation", { name: "Main" })
    // The hero headline ends with a rotating word ("Websites", "Intranets"…),
    // so match on the stable prefix rather than the full string.
    this.heroHeading = page.getByRole("heading", {
      name: /Open-Source Content Framework/i,
    })
    this.getStartedLink = page.getByRole("link", {
      name: "Get Started",
      exact: true,
    })
    this.openSearchButton = page.getByRole("button", {
      name: "Open search",
      exact: true,
    })
  }

  async goTo() {
    const response = await this.page.goto("/", {
      waitUntil: "domcontentloaded",
    })
    await dismissCookieBanner(this.page)
    // "networkidle" never settles on this third-party site under WebKit, so
    // wait for the hero headline to render instead.
    await this.heroHeading.waitFor({ state: "visible" })

    return response
  }
}
