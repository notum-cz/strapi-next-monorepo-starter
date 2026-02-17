import { expect, test, type Page } from "@playwright/test"

import urls from "helpers/urls.json"

const PATHS = [...urls]

async function expectAttrNonEmpty(page: Page, selector: string, attr: string) {
  const el = page.locator(selector)
  const count = await el.count()

  if (count !== 1) {
    const values = await el.evaluateAll((els) =>
      els.map((e) => (e.getAttribute(attr) ?? "").trim())
    )

    throw new Error(
      [
        `${selector} count mismatch`,
        `Expected: exactly 1`,
        `Found: ${count}`,
        `URL: ${page.url()}`,
        `${attr} values found:`,
        ...values.map((v, i) => `  ${i + 1}. "${v}"`),
      ].join("\n")
    )
  }

  const value = ((await el.first().getAttribute(attr)) ?? "").trim()

  expect(
    value,
    [
      `${selector} attribute is empty`,
      `Attr: ${attr}`,
      `URL: ${page.url()}`,
      `Current value: "${value}"`,
    ].join("\n")
  ).not.toBe("")
}

test.describe.configure({ mode: "parallel" })

for (const path of PATHS) {
  test.describe(`SEO checks on ${path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" })
      await page.waitForLoadState("networkidle")
    })

    test.describe("Title", () => {
      test("should exist and be non-empty", async ({ page }) => {
        const title = (await page.title()).trim()

        expect(
          title,
          [
            "Page title should not be empty",
            `URL: ${page.url()}`,
            `Current title: "${title}"`,
          ].join("\n")
        ).not.toBe("")
      })
    })

    test.describe("Meta description", () => {
      test("should exist and be non-empty", async ({ page }) => {
        await expectAttrNonEmpty(page, "meta[name='description']", "content")
      })
    })

    test.describe("Canonical tag", () => {
      test("should be present, absolute and reachable", async ({ page }) => {
        const canonical = page.locator("link[rel='canonical']")
        const count = await canonical.count()

        if (count !== 1) {
          const hrefs = await canonical.evaluateAll((els) =>
            els.map((e) => (e.getAttribute("href") ?? "").trim())
          )

          throw new Error(
            [
              "link[rel='canonical'] count mismatch",
              "Expected: exactly 1",
              `Found: ${count}`,
              `URL: ${page.url()}`,
              "hrefs found:",
              ...hrefs.map((h, i) => `  ${i + 1}. "${h}"`),
            ].join("\n")
          )
        }

        const href = (await canonical.first().getAttribute("href")) ?? ""

        expect(
          href,
          [
            "Canonical href must be absolute",
            `URL: ${page.url()}`,
            `Canonical href: "${href}"`,
          ].join("\n")
        ).toMatch(/^https?:\/\//)

        const res = await page.request.get(href)
        expect(
          res.ok(),
          [
            "Canonical URL not reachable",
            `URL: ${page.url()}`,
            `Canonical href: "${href}"`,
            `HTTP status: ${res.status()}`,
          ].join("\n")
        ).toBeTruthy()
      })
    })

    test.describe("H1 heading", () => {
      test("should exist exactly once and have non-empty text", async ({
        page,
      }) => {
        const h1 = page.locator("h1")
        const count = await h1.count()

        if (count !== 1) {
          const texts = (await h1.allInnerTexts()).map((t) => t.trim())

          throw new Error(
            [
              "H1 count mismatch",
              "Expected: exactly 1 <h1>",
              `Found: ${count}`,
              `URL: ${page.url()}`,
              "H1 texts found:",
              ...texts.map((t, i) => `  ${i + 1}. "${t}"`),
            ].join("\n")
          )
        }

        const text = (await h1.first().textContent()).trim()

        if (!text) {
          throw new Error(
            [
              "H1 text is empty",
              `URL: ${page.url()}`,
              `Current H1 text: "${text}"`,
            ].join("\n")
          )
        }
      })
    })

    test.describe("Heading hierarchy", () => {
      test("should be valid heading hierarchy", async ({ page }) => {
        const headings = page.locator("h1, h2, h3, h4, h5, h6")
        const count = await headings.count()

        let lastLevel = 0
        let lastText = ""
        let lastTag = ""

        for (let i = 0; i < count; i++) {
          const heading = headings.nth(i)

          const tagName = await heading.evaluate((el) => el.tagName)
          const level = Number.parseInt(tagName[1], 10)
          const text = (await heading.textContent()).trim()

          expect(
            level,
            [
              `Invalid heading level <${tagName}>`,
              `URL: ${page.url()}`,
              `Index: ${i}`,
              `Text: "${text}"`,
            ].join("\n")
          ).toBeLessThanOrEqual(6)

          if (i === 0) {
            lastLevel = level
            lastText = text
            lastTag = tagName
            continue
          }

          expect(
            level,
            [
              "Invalid heading hierarchy",
              `URL: ${page.url()}`,
              `Index: ${i}`,
              `Current: <${tagName}> "${text}"`,
              `Previous: <${lastTag}> "${lastText}"`,
              `Expected max level: H${lastLevel + 1}`,
              `Actual level: H${level}`,
            ].join("\n")
          ).toBeLessThanOrEqual(lastLevel + 1)

          lastLevel = level
          lastText = text
          lastTag = tagName
        }
      })
    })

    test.describe("Structured data", () => {
      test("JSON-LD should be present and valid", async ({ page }) => {
        const ld = page.locator("script[type='application/ld+json']")
        const contents = await ld.allTextContents()

        expect(
          contents.length,
          ["At least one JSON-LD script expected", `URL: ${page.url()}`].join(
            "\n"
          )
        ).toBeGreaterThan(0)

        contents.forEach((content, i) => {
          try {
            JSON.parse(content)
          } catch (e) {
            const snippet = content.trim().slice(0, 200).replaceAll(/\s+/g, " ")
            const message = e instanceof Error ? e.message : String(e)

            throw new Error(
              [
                "Invalid JSON-LD",
                `URL: ${page.url()}`,
                `Index: ${i}`,
                `Error: ${message}`,
                `Snippet: ${snippet}`,
              ].join("\n")
            )
          }
        })
      })
    })

    test.describe("Open Graph", () => {
      test("essential tags should be present and non-empty", async ({
        page,
      }) => {
        await expectAttrNonEmpty(page, "meta[property='og:title']", "content")
        await expectAttrNonEmpty(
          page,
          "meta[property='og:description']",
          "content"
        )
      })
    })
  })
}
