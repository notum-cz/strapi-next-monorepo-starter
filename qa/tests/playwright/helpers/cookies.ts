import type { Page } from "@playwright/test"

/**
 * strapi.io shows a Cookiebot consent banner on first visit. In a fresh
 * browser context (every test run) it overlays the page and intercepts clicks,
 * so dismiss it — choosing the privacy-preserving "necessary only" option —
 * before driving the UI. No-op when the banner isn't shown.
 */
export async function dismissCookieBanner(page: Page) {
  const acceptNecessary = page.getByRole("button", {
    name: "Use necessary cookies only",
  })

  try {
    await acceptNecessary.click({ timeout: 5000 })
  } catch {
    // Banner not present (consent already stored) — nothing to dismiss.
  }
}
