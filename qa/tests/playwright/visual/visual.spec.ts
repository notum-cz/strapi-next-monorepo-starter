import fs from "fs"

import { expect, test } from "@playwright/test"

import urls from "../helpers/urls-all-components-page.json"

const COMPARE_TIMEOUT = 20000

function prettifySlug(url: string): string {
  if (url === "/") {
    return "home"
  }

  return url
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .replace(/\.html$/, "")
    .replace(/\//g, "-")
}

test.describe("Visual Regression", () => {
  for (const url of urls) {
    test(`Compare snapshot for ${url}`, async ({ page }, testInfo) => {
      // abort non essential requests to speed up tests
      await page.route("**/*", (route, request) => {
        const type = request.resourceType()

        if (["font", "document", "stylesheet", "image"].includes(type)) {
          route.continue()
        } else {
          route.abort()
        }
      })

      // Use baseURL from Playwright config
      await page.goto(url)
      await page.waitForLoadState("networkidle")

      await page.addStyleTag({
        content: `
          * { animation: none !important; transition: none !important; }
          #logo-carousel { visibility: hidden !important; }
        `,
      })

      for (const el of await page.locator("img, video").elementHandles()) {
        await el.evaluate((el) =>
          (el as HTMLElement).style.setProperty("opacity", "0", "important")
        )
      }

      const snapshotName = `${prettifySlug(url)}.png`
      const baselinePath = testInfo.snapshotPath(snapshotName)
      const baselineExists = fs.existsSync(baselinePath)
      const browserName = testInfo.project.name

      // Baseline screenshots do not exist - create them and skip comparison
      if (!baselineExists) {
        console.warn(
          `Baseline snapshot missing for "${url}" and browser ${browserName} - creating: ${snapshotName} and skipping comparison for this run.`
        )

        await page.screenshot({
          path: baselinePath,
          fullPage: true,
        })

        return
      }

      // Baseline screenshot exists - compare with current screenshot
      await expect(page).toHaveScreenshot(snapshotName, {
        fullPage: true,
        threshold: 0.02, // 0 = pixel perfect, higher = more tolerant
        timeout: COMPARE_TIMEOUT,
      })
    })
  }
})
