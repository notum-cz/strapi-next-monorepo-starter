import { test as base } from "@playwright/test"

type MockFixtures = {
  /**
   * Fulfills every request matching `url` with a JSON response, without
   * hitting the real backend. See https://playwright.dev/docs/mock
   */
  mockJson: (
    url: string | RegExp,
    body: unknown,
    options?: { status?: number }
  ) => Promise<void>
}

export const test = base.extend<MockFixtures>({
  mockJson: async ({ page }, use) => {
    // Playwright's fixture callback parameter, not a React hook.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(async (url, body, options = {}) => {
      await page.route(url, (route) =>
        route.fulfill({
          status: options.status ?? 200,
          contentType: "application/json",
          body: JSON.stringify(body),
        })
      )
    })
  },
})

export { expect } from "@playwright/test"
