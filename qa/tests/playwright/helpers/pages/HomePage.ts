import type { Locator, Page } from "@playwright/test"

export class HomePage {
  private readonly page: Page

  readonly signInDialog: Locator
  readonly signInHeading: Locator
  readonly emailField: Locator
  readonly passwordField: Locator
  readonly submitButton: Locator
  readonly signInNavLink: Locator

  constructor(page: Page) {
    this.page = page
    // The "Password" label isn't associated with the input via for/aria-labelledby
    // (it wraps both the input and the "Show password" toggle button), so
    // getByLabel resolves ambiguously. Target controls by role/name instead,
    // scoped to the dialog since "Log In" also appears as the nav toggle button.
    this.signInDialog = page.getByRole("dialog", { name: "Sign In" })
    // The dialog exposes two "Sign In" headings (one for its accessible name,
    // one visible in the content) — `.last()` targets the visible one.
    this.signInHeading = this.signInDialog
      .getByRole("heading", { name: "Sign In" })
      .last()
    this.emailField = this.signInDialog.getByRole("textbox", {
      name: "User Name",
    })
    this.passwordField = this.signInDialog.getByRole("textbox", {
      name: "Password",
    })
    this.submitButton = this.signInDialog.getByRole("button", {
      name: "Log In",
      exact: true,
    })
    this.signInNavLink = page.getByRole("navigation").getByRole("button", {
      name: "Log In",
      exact: true,
    })
  }

  async goTo() {
    const response = await this.page.goto("?showLogin=True", {
      waitUntil: "domcontentloaded",
    })
    await this.page.waitForLoadState("networkidle")

    return response
  }

  async fillCredentials(email: string, password: string) {
    await this.emailField.fill(email)
    await this.passwordField.fill(password)
  }

  async signIn(email: string, password: string) {
    await this.fillCredentials(email, password)
    await this.submitButton.click()
  }
}
