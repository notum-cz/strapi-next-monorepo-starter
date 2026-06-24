import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import type { AxeResults, Result } from "axe-core"

import urlsAllComponentsPage from "../helpers/urls-all-components-page.json"
import urls from "../helpers/urls.json"

// Rule IDs that should be treated as warnings instead of errors on all pages.
const GLOBAL_WARNING_RULE_IDS = new Set<string>()

// Selectors to exclude from axe analysis on all pages.
const GLOBAL_EXCLUDE_SELECTORS: string[] = []

// Per-path configuration for excluding selectors or treating rule IDs as warnings.
const PATH_CONFIGS: Record<
  string,
  { excludeSelectors?: string[]; warningRuleIds?: string[] }
> = {}

const PATHS = Array.from(new Set<string>([...urls, ...urlsAllComponentsPage]))

// Component-only pages are informational for AXE checks, so findings there
// should not fail the run. URLs that are also regular site pages still fail.
const WARNING_ONLY_PATHS = new Set<string>(
  urlsAllComponentsPage.filter((pathname) => !urls.includes(pathname))
)

test.describe("AXE accessibility", () => {
  test.beforeAll(() => {
    if (PATHS.length === 0) {
      throw new Error(
        "No sites found in urls.json or urls-all-components-page.json"
      )
    }
  })

  for (const pathname of PATHS) {
    test(`Check ${pathname}`, async ({ page, baseURL }) => {
      const resolvedBaseUrl = baseURL ?? process.env.BASE_URL

      expect(
        resolvedBaseUrl,
        "Missing BASE_URL environment variable"
      ).toBeTruthy()

      const siteUrl = new URL(pathname, resolvedBaseUrl)
      const site = siteUrl.href
      const warningOnlySite = WARNING_ONLY_PATHS.has(pathname)
      const config = PATH_CONFIGS[pathname]
      const warningRuleIds = new Set([
        ...GLOBAL_WARNING_RULE_IDS,
        ...(config?.warningRuleIds ?? []),
      ])
      const excludeSelectors = [
        ...GLOBAL_EXCLUDE_SELECTORS,
        ...(config?.excludeSelectors ?? []),
      ]

      await page.goto(site, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      })
      await page.waitForLoadState("networkidle")

      const results: AxeResults = await excludeSelectors
        .reduce(
          (builder, selector) => builder.exclude(selector),
          new AxeBuilder({ page })
        )
        .analyze()

      const allViolations = results.violations ?? []

      const warningViolations: Result[] = warningOnlySite
        ? allViolations
        : allViolations.filter((v) => warningRuleIds.has(v.id))
      const errorViolations: Result[] = warningOnlySite
        ? []
        : allViolations.filter((v) => !warningRuleIds.has(v.id))

      if (errorViolations.length > 0) {
        console.error(
          `❌ Errors found for ${site} (${errorViolations.length} error(s), ${warningViolations.length} warning(s))`
        )
      } else if (warningViolations.length > 0) {
        console.warn(
          `🟠 Warnings found for ${site} (${warningViolations.length})${warningOnlySite ? " - warning-only page" : ""}`
        )
      } else {
        // eslint-disable-next-line no-console
        console.log(`✅ No violations for ${site}`)
      }

      expect(
        errorViolations.length,
        [
          `Accessibility errors on ${site}`,
          `Total: ${allViolations.length} | Errors: ${errorViolations.length} | Warnings: ${warningViolations.length}`,
          "",
          ...errorViolations.flatMap((v) => [
            `🔴 ${v.id} — ${v.help} (impact: ${v.impact ?? "unknown"})`,
            `   ${v.helpUrl}`,
            ...v.nodes.flatMap((n, i) => [
              `  ${i + 1}. ${n.html}`,
              `     target: ${Array.isArray(n.target) ? n.target.join(", ") : String(n.target)}`,
            ]),
            "",
          ]),
          ...(warningViolations.length > 0
            ? [
                "WARNINGS (FYI, out of our control)",
                "---",
                ...warningViolations.flatMap((v) => [
                  `🟠 ${v.id} — ${v.help} (impact: ${v.impact ?? "unknown"})`,
                  `   ${v.helpUrl}`,
                  ...v.nodes.flatMap((n, i) => [
                    `  ${i + 1}. ${n.html}`,
                    `     target: ${Array.isArray(n.target) ? n.target.join(", ") : String(n.target)}`,
                  ]),
                  "",
                ]),
              ]
            : []),
        ].join("\n")
      ).toBe(0)
    })
  }
})
