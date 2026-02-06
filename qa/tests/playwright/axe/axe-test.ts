import fs from "fs"
import path from "path"

import AxeBuilder from "@axe-core/playwright"
import { chromium } from "@playwright/test"
import dotenv from "dotenv"
import urls from "helpers/urls.json"

import type { AxeResults, NodeResult, Result } from "axe-core"

dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true })

// import { fetchSitemap } from "../helpers/get-sitemap-links"

// Rule IDs that should be treated as warnings instead of errors
const WARNING_RULE_IDS = new Set<string>()

type SiteOutcome = {
  url: string
  hasErrors: boolean
  hasWarnings: boolean
  analysisFailed: boolean
}

function formatViolationsSection(
  title: string,
  violations: Result[],
  icon: string
): string {
  if (violations.length === 0) return `${title}\n———\nNone\n`

  const blocks = violations.map((v: Result) => {
    const nodes = v.nodes?.length
      ? v.nodes
          .map((n: NodeResult, idx: number) => {
            const target = Array.isArray(n.target) ? n.target.join(", ") : ""
            return `  ${idx + 1}. ${n.html}\n     target: ${target}`
          })
          .join("\n")
      : "  (no affected nodes listed by axe)"

    return [
      `${icon} ${v.id} - ${v.help}`,
      `Impact: ${v.impact ?? "unknown"}`,
      `Description: ${v.description}`,
      `Help: ${v.helpUrl}`,
      `Affected Nodes:\n${nodes}`,
    ].join("\n")
  })

  return `${title}\n———\n${blocks.join("\n\n")}\n`
}

;(async () => {
  const baseUrl = process.env.BASE_URL
  if (!baseUrl) {
    console.error("Missing BASE_URL environment variable")
    process.exit(1)
  }

  // If the sitemap is available, we can fetch pages directly from there
  // await fetchSitemap(baseUrl + "/sitemap.xml", "--json")
  // const sitesPath = path.join(__dirname, "../helpers/sites.json")
  // const sites: string[] = JSON.parse(fs.readFileSync(sitesPath, "utf-8"))

  const PATHS = [...urls]

  if (!Array.isArray(urls) || urls.length === 0) {
    console.error("No sites found in sites.json")
    process.exit(1)
  }

  // For now, we use the URLs defined in helpers/urls.json
  const sites: string[] = PATHS.map((p) => new URL(p, baseUrl).toString())

  const runTimestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")

  const reportDir = path.resolve("axe/reports", `axe_test_run_${runTimestamp}`)
  fs.mkdirSync(reportDir, { recursive: true })

  const reportFilePath = path.join(reportDir, `report_axe_${runTimestamp}.txt`)
  fs.writeFileSync(
    reportFilePath,
    `AXE accessibility REPORT (run summary)\nTimestamp: ${runTimestamp}\nTotal pages: ${sites.length}\n\n`
  )

  const siteOutcomes: SiteOutcome[] = []
  const browser = await chromium.launch()

  try {
    for (const site of sites) {
      const context = await browser.newContext()
      const page = await context.newPage()

      try {
        await page.goto(site, { waitUntil: "load", timeout: 20000 })

        const results: AxeResults = await new AxeBuilder({ page }).analyze()
        const allViolations: Result[] = results.violations ?? []

        const warningViolations = allViolations.filter((v) =>
          WARNING_RULE_IDS.has(v.id)
        )
        const errorViolations = allViolations.filter(
          (v) => !WARNING_RULE_IDS.has(v.id)
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
          console.log(`✅ No violations for ${site}`)
        }

        const headerPerPage = [
          `Page: ${site}`,
          `Total: ${allViolations.length} | Errors: ${errorViolations.length} | Warnings: ${warningViolations.length}`,
          ``,
        ].join("\n")

        const errorsSection = formatViolationsSection(
          "ERRORS (must fix)",
          errorViolations,
          "🔴"
        )
        const warningsSection = formatViolationsSection(
          "WARNINGS (FYI, out of our control)",
          warningViolations,
          "🟠"
        )

        fs.appendFileSync(
          reportFilePath,
          [headerPerPage, errorsSection, warningsSection, ""].join("\n")
        )

        siteOutcomes.push({
          url: site,
          hasErrors: errorViolations.length > 0,
          hasWarnings: warningViolations.length > 0,
          analysisFailed: false,
        })
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`❌ Error checking ${site}:`, message)
        fs.appendFileSync(
          reportFilePath,
          [
            `AXE accessibility REPORT`,
            `Timestamp: ${runTimestamp}`,
            `Page: ${site}`,
            `ERROR running analysis: ${message}`,
            ``,
          ].join("\n")
        )
        siteOutcomes.push({
          url: site,
          hasErrors: false,
          hasWarnings: false,
          analysisFailed: true,
        })
      } finally {
        await context.close()
      }
    }
  } finally {
    await browser.close()
  }

  const analysisFailedSites = siteOutcomes.filter((s) => s.analysisFailed)
  const sitesWithErrors = siteOutcomes.filter(
    (s) => s.hasErrors && !s.analysisFailed
  )
  const sitesWithOnlyWarnings = siteOutcomes.filter(
    (s) => !s.hasErrors && s.hasWarnings && !s.analysisFailed
  )
  const cleanSites = siteOutcomes.filter(
    (s) => !s.hasErrors && !s.hasWarnings && !s.analysisFailed
  )

  if (sitesWithErrors.length > 0) {
    console.error(
      `\n❌ Accessibility errors found on ${sitesWithErrors.length} site(s):`
    )
    sitesWithErrors.forEach(({ url }) => console.error(`- ${url}`))
  }

  if (sitesWithOnlyWarnings.length > 0) {
    console.warn(
      `\n🟠 Accessibility warnings on ${sitesWithOnlyWarnings.length} site(s):`
    )
    sitesWithOnlyWarnings.forEach(({ url }) => console.warn(`- ${url}`))
  }

  if (cleanSites.length > 0) {
    console.log(
      `\n✅ ${cleanSites.length} site(s) passed with no accessibility violations.`
    )
  }

  if (analysisFailedSites.length > 0) {
    console.error(
      `\n⚠️ Analysis failed on ${analysisFailedSites.length} site(s):`
    )
    analysisFailedSites.forEach(({ url }) => console.error(`- ${url}`))
  }

  process.exit(
    sitesWithErrors.length > 0 || analysisFailedSites.length > 0 ? 1 : 0
  )
})()
