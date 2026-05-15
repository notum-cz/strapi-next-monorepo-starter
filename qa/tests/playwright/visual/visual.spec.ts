/* eslint-disable sonarjs/no-commented-code */
import fs from "node:fs"

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
    .replaceAll("/", "-")
}

function getEnvSlug(baseUrl: string | undefined): string {
  if (!baseUrl) return "unknown"
  try {
    const hostname = new URL(baseUrl).hostname.replace(/^www\./, "")

    return hostname.replaceAll(".", "-")
  } catch {
    return "unknown"
  }
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

      // Optional: enable this on projects that respect prefers-reduced-motion.
      // It can make visual snapshots more stable for animated sections and carousels.
      // Uncomment this to try it when snapshots are flaky because of motion.
      // await page.emulateMedia({ reducedMotion: "reduce" })

      // Use baseURL from Playwright config
      await page.goto(url)
      await page.waitForLoadState("networkidle")

      // Optional: uncomment this to trigger lazy-loaded assets before screenshots.
      /*
      const height = await page.evaluate(() => document.body.scrollHeight)
      const singleScroll = 500
      const scrolls = Math.ceil(height / singleScroll)

      for (let i = 0; i < scrolls; i++) {
        await page.mouse.wheel(0, singleScroll)
        await page.waitForTimeout(100)
      }

      await page.evaluate(() => window.scrollTo(0, 0))
      */

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

      const envSlug = getEnvSlug(process.env.BASE_URL)
      const snapshotName = `${envSlug}-${prettifySlug(url)}.png`
      const baselinePath = testInfo.snapshotPath(snapshotName)
      const baselineExists = fs.existsSync(baselinePath)
      const browserName = testInfo.project.name

      // Baseline screenshots do not exist - create them and skip comparison
      if (!baselineExists) {
        console.warn(
          `🟡 Baseline snapshot missing for "${url}" and browser ${browserName} - creating: ${snapshotName}`
        )

        await page.screenshot({
          path: baselinePath,
          fullPage: true,
        })

        console.warn(
          `📷 Baseline snapshot created for "${url}" and browser ${browserName} - skipping comparison for this run.`
        )

        return
      }

      // Baseline screenshot exists - compare with current screenshot
      try {
        await expect(page).toHaveScreenshot(snapshotName, {
          fullPage: true,
          threshold: 0.2, // 0 = pixel perfect, higher = more tolerant
          maxDiffPixelRatio: 0.01, // 1% of pixels can be different
          timeout: COMPARE_TIMEOUT,
        })
      } catch (error) {
        console.warn(
          `⚠️ Snapshot comparison failed for "${url}" and browser ${browserName} - snapshot: ${snapshotName}`
        )
        throw error
      }
    })
  }
})
