import fs from "fs"
import path from "path"

import AxeBuilder from "@axe-core/playwright"
import { chromium } from "playwright"

const sites: string[] = JSON.parse(
  fs.readFileSync("tests/axe/sites.json", "utf-8")
)
if (!Array.isArray(sites) || sites.length === 0) {
  console.error("No sites found in sites.json")
  process.exit(1)
}

function urlToFilename(site: string): string {
  return site.replace(/^https?:\/\//, "").replace(/[\/.]/g, "_")
}

const runTimestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace(/\..+/, "")
const reportDir = path.resolve(
  "tests/axe/reports",
  `axe_test_run_${runTimestamp}`
)
fs.mkdirSync(reportDir, { recursive: true })

const violatingSites: { url: string; reportPath: string }[] = []

;(async () => {
  const browser = await chromium.launch()

  for (const site of sites) {
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
      await page.goto(site, { waitUntil: "load", timeout: 20000 })

      const results = await new AxeBuilder({ page }).analyze()

      if (results.violations.length > 0) {
        const filename = `${urlToFilename(site)}_${runTimestamp}.txt`
        const fullReportPath = path.join(reportDir, filename)

        const textReport = [
          `Page: ${site}`,
          ...results.violations.map((v) => {
            return (
              `🔴 ${v.id} - ${v.help}\nImpact: ${v.impact}\nDescription: ${v.description}\nHelp: ${v.helpUrl}\nAffected Nodes:\n` +
              v.nodes.map((n) => `  - ${n.html}`).join("\n") +
              "\n"
            )
          }),
        ].join("\n\n")

        fs.writeFileSync(fullReportPath, textReport)
        violatingSites.push({ url: site, reportPath: fullReportPath })

        console.error(`❌ Violations found for ${site}`)
      } else {
        console.log(`✅ No violations for ${site}`)
      }
    } catch (error) {
      console.error(`❌ Error checking ${site}:`, error)
    } finally {
      await context.close()
    }
  }

  await browser.close()

  if (violatingSites.length > 0) {
    console.error(
      `\n❌ Accessibility violations were found on ${violatingSites.length} site(s):`
    )
    violatingSites.forEach(({ url, reportPath }) => {
      console.error(`- ${url} → ${reportPath}`)
    })
    process.exit(1)
  } else {
    console.log(
      `\n✅ All ${sites.length} site(s) passed with no accessibility violations.`
    )
  }
})()
