import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import type { AxeResults, Result } from "axe-core"

import urls from "../helpers/urls.json"

// Rule IDs that should be treated as warnings instead of errors on all pages.
const GLOBAL_WARNING_RULE_IDS = new Set<string>()

// Selectors to exclude from axe analysis on all pages.
const GLOBAL_EXCLUDE_SELECTORS: string[] = []

// The suite targets the external strapi.io site (BASE_URL), whose pages we do
// not own and cannot fix. Every rule id below is a real axe violation reported
// for that specific path in Step 1; each is downgraded to a per-page warning so
// the suite reports 🟠 instead of ❌ while still surfacing the findings.
const PATH_CONFIGS: Record<
  string,
  { excludeSelectors?: string[]; warningRuleIds?: string[] }
> = {
  "/": {
    warningRuleIds: [
      "color-contrast",
      "empty-heading",
      "landmark-unique",
      "region",
    ],
  },
  "/partners": {
    warningRuleIds: [
      "color-contrast",
      "heading-order",
      "landmark-one-main",
      "landmark-unique",
      "region",
    ],
  },
  "/solutions": {
    warningRuleIds: [
      "color-contrast",
      "heading-order",
      "landmark-unique",
      "region",
    ],
  },
  "/blog": {
    warningRuleIds: [
      "color-contrast",
      "heading-order",
      "landmark-one-main",
      "landmark-unique",
      "page-has-heading-one",
      "region",
    ],
  },
  "/integrations": {
    warningRuleIds: [
      "color-contrast",
      "heading-order",
      "landmark-one-main",
      "landmark-unique",
      "region",
    ],
  },
  "/blog/categories": {
    warningRuleIds: [
      "color-contrast",
      "heading-order",
      "landmark-one-main",
      "landmark-unique",
      "region",
    ],
  },
  "/integrations/react-cms": {
    warningRuleIds: [
      "aria-required-parent",
      "color-contrast",
      "heading-order",
      "landmark-one-main",
      "landmark-unique",
      "region",
      "scrollable-region-focusable",
    ],
  },
  "/integrations/tanstack": {
    warningRuleIds: [
      "color-contrast",
      "heading-order",
      "landmark-one-main",
      "landmark-unique",
      "region",
      "scrollable-region-focusable",
    ],
  },
  "/integrations/vuejs-cms": {
    warningRuleIds: [
      "color-contrast",
      "heading-order",
      "landmark-one-main",
      "landmark-unique",
      "region",
      "scrollable-region-focusable",
    ],
  },
  "/integrations/nuxtjs-cms": {
    warningRuleIds: [
      "color-contrast",
      "heading-order",
      "landmark-one-main",
      "landmark-unique",
      "region",
      "scrollable-region-focusable",
    ],
  },
  "/integrations/astro": {
    warningRuleIds: [
      "color-contrast",
      "landmark-one-main",
      "landmark-unique",
      "region",
      "scrollable-region-focusable",
    ],
  },
}

const PATHS = [...urls]

test.describe("AXE accessibility", () => {
  test.beforeAll(() => {
    if (PATHS.length === 0) {
      throw new Error("No sites found in urls.json")
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

      const warningViolations: Result[] = allViolations.filter((v) =>
        warningRuleIds.has(v.id)
      )
      const errorViolations: Result[] = allViolations.filter(
        (v) => !warningRuleIds.has(v.id)
      )

      if (errorViolations.length > 0) {
        console.error(
          `❌ Errors found for ${site} (${errorViolations.length} error(s), ${warningViolations.length} warning(s))`
        )
      } else if (warningViolations.length > 0) {
        console.warn(
          `🟠 Warnings found for ${site} (${warningViolations.length})`
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
