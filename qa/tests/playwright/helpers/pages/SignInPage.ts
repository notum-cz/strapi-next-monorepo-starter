import type { Locator, Page } from "@playwright/test"

export class SignInPage {
  private readonly page: Page

  readonly emailField: Locator
  readonly passwordField: Locator
  readonly submitButton: Locator
  readonly forgotPasswordLink: Locator
  readonly createAccountLink: Locator

  constructor(page: Page) {
    this.page = page
    // Required fields render a trailing "*" in their label, so this stays a
    // substring match rather than `exact: true`.
    this.emailField = page.getByLabel("Email")
    this.passwordField = page.getByLabel("Password")
    this.submitButton = page.getByRole("button", {
      name: "Sign in",
      exact: true,
    })
    this.forgotPasswordLink = page.getByRole("link", {
      name: "Forgot password?",
      exact: true,
    })
    this.createAccountLink = page.getByRole("link", {
      name: "Create an account",
      exact: true,
    })
  }

  async goTo() {
    const response = await this.page.goto("/auth/signin", {
      waitUntil: "domcontentloaded",
    })
    await this.page.waitForLoadState("networkidle")

    return response
  }

  async signIn(email: string, password: string) {
    await this.emailField.fill(email)
    await this.passwordField.fill(password)
    await this.submitButton.click()
  }
}
