import fs from "node:fs"
import path from "node:path"

import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import type { AxeResults, NodeResult, Result } from "axe-core"

import urlsAllComponentsPage from "helpers/urls-all-components-page.json"
import urls from "helpers/urls.json"

function createWarningRuleIds(...ruleIds: string[]): ReadonlySet<string> {
  return new Set(ruleIds)
}

function createWarningRuleIdsByPath(
  entries: readonly (readonly [string, ReadonlySet<string>])[] = []
): ReadonlyMap<string, ReadonlySet<string>> {
  return new Map(entries)
}

// Rule IDs that should be treated as warnings instead of errors.
const WARNING_RULE_IDS = createWarningRuleIds()

// Specific paths that should have certain rule IDs treated as warnings instead of errors.
const WARNING_RULE_IDS_BY_PATH = createWarningRuleIdsByPath()

type SiteOutcome = {
  url: string
  hasErrors: boolean
  hasWarnings: boolean
  analysisFailed: boolean
}

const PATHS = Array.from(new Set<string>([...urls, ...urlsAllComponentsPage]))

// Component-only pages are informational for AXE checks, so findings there
// should not fail the run. URLs that are also regular site pages still fail.
const WARNING_ONLY_PATHS = new Set<string>(
  urlsAllComponentsPage.filter((pathname) => !urls.includes(pathname))
)

const runTimestamp = new Date()
  .toISOString()
  .replaceAll(/[-:.]/g, "")
  .replace(/\..+/, "")
const reportDir = path.resolve(
  __dirname,
  "reports",
  `axe_test_run_${runTimestamp}`
)
const reportFilePath = path.join(reportDir, `report_axe_${runTimestamp}.txt`)
const siteOutcomes = new Map<string, SiteOutcome>()

function formatViolationsSection(
  title: string,
  violations: Result[],
  icon: string
): string {
  if (violations.length === 0) return `${title}\n---\nNone\n`

  const blocks = violations.map((violation: Result) => {
    const nodes = violation.nodes?.length
      ? violation.nodes
          .map((node: NodeResult, index: number) => {
            const target = Array.isArray(node.target)
              ? node.target.join(", ")
              : ""

            return `  ${index + 1}. ${node.html}\n     target: ${target}`
          })
          .join("\n")
      : "  (no affected nodes listed by axe)"

    return [
      `${icon} ${violation.id} - ${violation.help}`,
      `Impact: ${violation.impact ?? "unknown"}`,
      `Description: ${violation.description}`,
      `Help: ${violation.helpUrl}`,
      `Affected Nodes:\n${nodes}`,
    ].join("\n")
  })

  return `${title}\n---\n${blocks.join("\n\n")}\n`
}

function appendReport(lines: string[]): void {
  fs.appendFileSync(reportFilePath, `${lines.join("\n")}\n`)
}

function initializeReport(): void {
  fs.mkdirSync(reportDir, { recursive: true })
  fs.writeFileSync(
    reportFilePath,
    [
      "AXE accessibility REPORT (run summary)",
      `Timestamp: ${runTimestamp}`,
      `Total pages: ${PATHS.length}`,
      "",
    ].join("\n")
  )
}

test.describe("AXE accessibility", () => {
  test.beforeAll(() => {
    if (PATHS.length === 0) {
      throw new Error(
        "No sites found in urls.json or urls-all-components-page.json"
      )
    }
  })

  for (const pathname of PATHS) {
    test(`Check ${pathname}`, async ({ page, baseURL }, testInfo) => {
      const shouldWriteReport = testInfo.retry === 0

      if (shouldWriteReport && !fs.existsSync(reportFilePath)) {
        initializeReport()
      }

      const resolvedBaseUrl = baseURL ?? process.env.BASE_URL

      expect(
        resolvedBaseUrl,
        "Missing BASE_URL environment variable"
      ).toBeTruthy()

      const site = new URL(pathname, resolvedBaseUrl).toString()
      let warningViolations: Result[] = []
      let errorViolations: Result[] = []
      let allViolations: Result[] = []

      try {
        await page.goto(site, {
          waitUntil: "domcontentloaded",
          timeout: 20000,
        })
        await page.waitForLoadState("networkidle")

        const results: AxeResults = await new AxeBuilder({ page }).analyze()

        allViolations = results.violations ?? []

        const warningOnlySite = WARNING_ONLY_PATHS.has(pathname)
        const pageSpecificWarningRuleIds =
          WARNING_RULE_IDS_BY_PATH.get(pathname) ?? createWarningRuleIds()

        warningViolations = warningOnlySite
          ? allViolations
          : allViolations.filter(
              (violation) =>
                WARNING_RULE_IDS.has(violation.id) ||
                pageSpecificWarningRuleIds.has(violation.id)
            )
        errorViolations = warningOnlySite
          ? []
          : allViolations.filter(
              (violation) =>
                !WARNING_RULE_IDS.has(violation.id) &&
                !pageSpecificWarningRuleIds.has(violation.id)
            )
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)

        console.error(`Error checking ${site}: ${message}`)
        if (shouldWriteReport) {
          appendReport([
            `Page: ${site}`,
            `ERROR running analysis: ${message}`,
            "",
          ])
          siteOutcomes.set(site, {
            url: site,
            hasErrors: false,
            hasWarnings: false,
            analysisFailed: true,
          })
        }

        throw error
      }

      if (errorViolations.length > 0) {
        console.error(
          `❌ Errors found for ${site} (${errorViolations.length} error(s), ${warningViolations.length} warning(s))`
        )
      } else if (warningViolations.length > 0) {
        const warningOnlySite = WARNING_ONLY_PATHS.has(pathname)

        console.warn(
          `🟠 Warnings found for ${site} (${warningViolations.length})${warningOnlySite ? " - warning-only page" : ""}`
        )
      } else {
        console.log(`✅ No violations for ${site}`)
      }

      if (shouldWriteReport) {
        appendReport([
          `Page: ${site}`,
          `Total: ${allViolations.length} | Errors: ${errorViolations.length} | Warnings: ${warningViolations.length}`,
          "",
          formatViolationsSection("ERRORS (must fix)", errorViolations, "🔴"),
          formatViolationsSection(
            "WARNINGS (FYI, out of our control)",
            warningViolations,
            "🟠"
          ),
          "",
        ])

        siteOutcomes.set(site, {
          url: site,
          hasErrors: errorViolations.length > 0,
          hasWarnings: warningViolations.length > 0,
          analysisFailed: false,
        })
      }

      expect(
        errorViolations.length,
        errorViolations.length > 0
          ? `Accessibility errors for ${site}: ${errorViolations.map((violation) => violation.id).join(", ")}`
          : undefined
      ).toBe(0)
    })
  }

  test.afterAll(() => {
    if (!fs.existsSync(reportFilePath) || siteOutcomes.size === 0) {
      return
    }

    const outcomes = Array.from(siteOutcomes.values())
    const analysisFailedSites = outcomes.filter((site) => site.analysisFailed)
    const sitesWithErrors = outcomes.filter(
      (site) => site.hasErrors && !site.analysisFailed
    )
    const sitesWithOnlyWarnings = outcomes.filter(
      (site) => !site.hasErrors && site.hasWarnings && !site.analysisFailed
    )
    const cleanSites = outcomes.filter(
      (site) => !site.hasErrors && !site.hasWarnings && !site.analysisFailed
    )

    appendReport([
      "SUMMARY",
      "---",
      `Pages checked: ${outcomes.length}`,
      `Clean pages: ${cleanSites.length}`,
      `Pages with warnings only: ${sitesWithOnlyWarnings.length}`,
      `Pages with errors: ${sitesWithErrors.length}`,
      `Pages with analysis failure: ${analysisFailedSites.length}`,
      "",
      ...(sitesWithErrors.length > 0
        ? [
            "Accessibility errors on:",
            ...sitesWithErrors.map((site) => `- ${site.url}`),
            "",
          ]
        : []),
      ...(sitesWithOnlyWarnings.length > 0
        ? [
            "Accessibility warnings on:",
            ...sitesWithOnlyWarnings.map((site) => `- ${site.url}`),
            "",
          ]
        : []),
      ...(analysisFailedSites.length > 0
        ? [
            "Analysis failed on:",
            ...analysisFailedSites.map((site) => `- ${site.url}`),
            "",
          ]
        : []),
    ])

    console.log(`🖊️ AXE summary report written to ${reportFilePath}`)
  })
})
