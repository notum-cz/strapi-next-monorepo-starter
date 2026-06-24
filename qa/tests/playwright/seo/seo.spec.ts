import { expect, test, type Page } from "@playwright/test"

import urls from "../helpers/urls.json"

const PATHS = [...urls]

function isHerokuBaseUrl(url: string): boolean {
  return url.includes("heroku")
}

function normalizePath(url: string): string {
  try {
    const parsedUrl = new URL(url)

    return parsedUrl.pathname.replace(/\/$/, "") || "/"
  } catch {
    return url
  }
}

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

      test("should have reasonable length (10–70 chars)", async ({ page }) => {
        const title = (await page.title()).trim()

        expect(
          title.length,
          [
            "Page title is too short (min 10 chars)",
            `URL: ${page.url()}`,
            `Current title: "${title}"`,
            `Length: ${title.length}`,
          ].join("\n")
        ).toBeGreaterThanOrEqual(10)

        expect(
          title.length,
          [
            "Page title is too long (max 70 chars)",
            `URL: ${page.url()}`,
            `Current title: "${title}"`,
            `Length: ${title.length}`,
          ].join("\n")
        ).toBeLessThanOrEqual(70)
      })
    })

    test.describe("Meta description", () => {
      test("should exist and be non-empty", async ({ page }) => {
        await expectAttrNonEmpty(page, "meta[name='description']", "content")
      })

      test("should have reasonable length (50–160 chars)", async ({ page }) => {
        const content = (
          (await page
            .locator("meta[name='description']")
            .first()
            .getAttribute("content")) ?? ""
        ).trim()

        expect(
          content.length,
          [
            "Meta description is too short (min 50 chars)",
            `URL: ${page.url()}`,
            `Current description: "${content}"`,
            `Length: ${content.length}`,
          ].join("\n")
        ).toBeGreaterThanOrEqual(50)

        expect(
          content.length,
          [
            "Meta description is too long (max 160 chars)",
            `URL: ${page.url()}`,
            `Current description: "${content}"`,
            `Length: ${content.length}`,
          ].join("\n")
        ).toBeLessThanOrEqual(160)
      })
    })

    test.describe("Robots", () => {
      test("should not have noindex directive", async ({ page }) => {
        const baseUrl = process.env.BASE_URL

        test.skip(
          !baseUrl || isHerokuBaseUrl(baseUrl),
          "Robots noindex check skipped on Heroku (dev/staging/preview) environments"
        )

        const robots = page.locator("meta[name='robots']")

        if ((await robots.count()) === 0) return

        const content = (
          (await robots.first().getAttribute("content")) ?? ""
        ).toLowerCase()

        expect(
          content,
          [
            "robots meta must not contain noindex",
            `URL: ${page.url()}`,
            `Content: "${content}"`,
          ].join("\n")
        ).not.toContain("noindex")
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

      test("should self-reference the current page", async ({ page }) => {
        const hasHreflang =
          (await page.locator("link[rel='alternate'][hreflang]").count()) > 0

        test.skip(
          hasHreflang,
          "Canonical self-reference skipped on multilingual pages — canonical may point to a language variant"
        )

        const href =
          (await page
            .locator("link[rel='canonical']")
            .first()
            .getAttribute("href")) ?? ""
        const currentUrl = page.url()

        const canonicalPath = normalizePath(href)
        const currentPath = normalizePath(currentUrl)

        expect(
          canonicalPath,
          [
            "Canonical path does not match current page path",
            `URL: ${currentUrl}`,
            `Canonical: "${href}"`,
            `Canonical path: "${canonicalPath}"`,
            `Current path: "${currentPath}"`,
          ].join("\n")
        ).toBe(currentPath)
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

        const text = ((await h1.first().textContent()) ?? "").trim()

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
          const level = Number(tagName[1])
          const text = ((await heading.textContent()) ?? "").trim()

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

        for (const [i, content] of contents.entries()) {
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
              ].join("\n"),
              { cause: e }
            )
          }
        }
      })

      test("JSON-LD schemas should have @context and @type", async ({
        page,
      }) => {
        const ld = page.locator("script[type='application/ld+json']")
        const contents = await ld.allTextContents()

        for (const [i, content] of contents.entries()) {
          let data: unknown
          try {
            data = JSON.parse(content)
          } catch {
            return
          }

          const schemas = Array.isArray(data) ? data : [data]

          for (const [j, schema] of schemas.entries()) {
            const s = schema as Record<string, unknown>

            expect(
              s["@context"],
              [
                "JSON-LD missing @context",
                `URL: ${page.url()}`,
                `Script index: ${i}, schema index: ${j}`,
              ].join("\n")
            ).toBeTruthy()

            expect(
              s["@type"],
              [
                "JSON-LD missing @type",
                `URL: ${page.url()}`,
                `Script index: ${i}, schema index: ${j}`,
              ].join("\n")
            ).toBeTruthy()
          }
        }
      })

      test("JSON-LD should be present in raw HTML (not only JS-injected)", async ({
        page,
      }) => {
        const response = await page.request.get(page.url())
        const html = await response.text()

        expect(
          html,
          [
            "JSON-LD not found in raw HTML — it may be injected only by JavaScript",
            `URL: ${page.url()}`,
          ].join("\n")
        ).toContain('type="application/ld+json"')
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
        await expectAttrNonEmpty(page, "meta[property='og:image']", "content")
        await expectAttrNonEmpty(page, "meta[property='og:url']", "content")
        await expectAttrNonEmpty(page, "meta[property='og:type']", "content")
      })
    })

    test.describe("hreflang", () => {
      test("hreflang tags should be valid if present", async ({ page }) => {
        const alternates = page.locator("link[rel='alternate'][hreflang]")

        if ((await alternates.count()) === 0) return

        const xDefaultCount = await page
          .locator("link[rel='alternate'][hreflang='x-default']")
          .count()

        expect(
          xDefaultCount,
          ["x-default hreflang tag is missing", `URL: ${page.url()}`].join("\n")
        ).toBeGreaterThan(0)

        const entries = await alternates.evaluateAll((links) =>
          links.map((l) => ({
            hreflang: l.getAttribute("hreflang") ?? "",
            href: l.getAttribute("href") ?? "",
          }))
        )

        for (const { hreflang, href } of entries) {
          expect(
            href,
            [
              "hreflang href must be absolute",
              `URL: ${page.url()}`,
              `hreflang: "${hreflang}"`,
              `href: "${href}"`,
            ].join("\n")
          ).toMatch(/^https?:\/\//)
        }

        const currentPath = normalizePath(page.url())

        const selfRef = entries.find(({ href }) => {
          try {
            return normalizePath(href) === currentPath
          } catch {
            return false
          }
        })

        expect(
          selfRef,
          [
            "Current page path is not represented in hreflang tags",
            `URL: ${page.url()}`,
            `Current path: "${currentPath}"`,
            "hreflang entries:",
            ...entries.map(({ hreflang, href }) => `  ${hreflang}: ${href}`),
          ].join("\n")
        ).toBeTruthy()
      })
    })

    test.describe("Heroku references", () => {
      test('HTML and canonical should not contain "heroku" on PROD', async ({
        page,
      }) => {
        const baseUrl = process.env.BASE_URL

        test.skip(
          !baseUrl || isHerokuBaseUrl(baseUrl),
          'Heroku reference check runs only when baseURL does not contain "heroku"'
        )

        const html = await page.content()

        if (html.toLowerCase().includes("heroku")) {
          throw new Error(
            ['HTML contains "heroku"', `URL: ${page.url()}`].join("\n")
          )
        }
      })
    })
  })
}
