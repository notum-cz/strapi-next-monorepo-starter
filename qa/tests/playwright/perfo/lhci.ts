/* eslint-disable no-console */
import "dotenv/config"

import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

import { flattenUrls } from "../helpers/flatten-urls"

import urls from "../helpers/urls.json"

const BASE_URL = process.env.BASE_URL

if (!BASE_URL) {
  throw new Error("Missing BASE_URL environment variable")
}

const perfoUrls = flattenUrls(urls.perfo.dev)

if (perfoUrls.length === 0) {
  throw new Error("No sites found in urls.json")
}

const fullUrls = perfoUrls.map((p) => `${BASE_URL}${p}`)

const CWD = path.resolve("perfo")
const LHCI_OUTPUT_DIR = path.join(CWD, ".lighthouseci")
const HISTORY_FILE = path.join(CWD, "lighthouse-history.md")

fs.mkdirSync(CWD, { recursive: true })

// Start from a clean output directory so this run's report doesn't mix with
// leftovers from a previous local run.
fs.rmSync(LHCI_OUTPUT_DIR, { recursive: true, force: true })
fs.mkdirSync(LHCI_OUTPUT_DIR, { recursive: true })

const args = [
  "lhci",
  "collect",
  ...fullUrls.flatMap((url) => ["--url", url]),
  "--numberOfRuns=1",
]

// eslint-disable-next-line sonarjs/no-os-command-from-path
const result = spawnSync("pnpm", args, {
  stdio: "inherit",
  cwd: CWD,
})

if (result.status !== 0) {
  throw new Error(`LHCI failed with status ${result.status ?? 1}`)
}

interface LighthouseResult {
  requestedUrl: string
  fetchTime: string
  categories: Record<string, { score: number | null }>
}

interface HistoryEntry {
  date: string
  url: string
  performance: number | null
  accessibility: number | null
  bestPractices: number | null
  seo: number | null
}

function toScore(value: number | null | undefined): number | null {
  return typeof value === "number" ? Math.round(value * 100) : null
}

function buildHistoryEntries(): HistoryEntry[] {
  const reportFiles = fs
    .readdirSync(LHCI_OUTPUT_DIR)
    .filter((file) => /^lhr-.*\.json$/.test(file))

  return reportFiles.map((file) => {
    const lhr: LighthouseResult = JSON.parse(
      fs.readFileSync(path.join(LHCI_OUTPUT_DIR, file), "utf8")
    )

    return {
      date: lhr.fetchTime.slice(0, 10),
      url: lhr.requestedUrl,
      performance: toScore(lhr.categories.performance?.score),
      accessibility: toScore(lhr.categories.accessibility?.score),
      bestPractices: toScore(lhr.categories["best-practices"]?.score),
      seo: toScore(lhr.categories.seo?.score),
    }
  })
}

const ROW_HEADER =
  "| Date | Performance | Accessibility | Best Practices | SEO |"
const ROW_SEPARATOR = "| --- | --- | --- | --- | --- |"

interface Section {
  url: string
  rows: string[]
}

function formatCell(value: number | null): string {
  return value === null ? "–" : String(value)
}

function formatRow(entry: HistoryEntry): string {
  const cells = [
    entry.date,
    formatCell(entry.performance),
    formatCell(entry.accessibility),
    formatCell(entry.bestPractices),
    formatCell(entry.seo),
  ]

  return `| ${cells.join(" | ")} |`
}

// Parses the file's per-URL "## <url>" sections back into their row lines, so
// a new run's results land next to that page's existing history instead of
// just being appended at the end of the file.
function parseSections(content: string): Section[] {
  const sections: Section[] = []
  let current: Section | null = null

  for (const line of content.split("\n")) {
    const heading = /^## (.+)$/.exec(line)

    if (heading) {
      current = { url: heading[1], rows: [] }
      sections.push(current)
      continue
    }

    if (!current || !line.startsWith("|")) continue
    if (line === ROW_HEADER || line === ROW_SEPARATOR) continue

    current.rows.push(line)
  }

  return sections
}

function serializeSections(sections: Section[]): string {
  return (
    sections
      .map((section) =>
        [
          `## ${section.url}`,
          "",
          ROW_HEADER,
          ROW_SEPARATOR,
          ...section.rows,
        ].join("\n")
      )
      .join("\n\n") + "\n"
  )
}

const entries = buildHistoryEntries()

const existingContent = fs.existsSync(HISTORY_FILE)
  ? fs.readFileSync(HISTORY_FILE, "utf8")
  : ""

const sections = parseSections(existingContent)

for (const entry of entries) {
  const section = sections.find((s) => s.url === entry.url)

  if (section) {
    section.rows.push(formatRow(entry))
  } else {
    sections.push({ url: entry.url, rows: [formatRow(entry)] })
  }
}

fs.writeFileSync(HISTORY_FILE, serializeSections(sections))

console.log(`\nLighthouse trend (${entries.length} page(s)):`)
console.table(entries)
console.log(`Updated ${path.relative(process.cwd(), HISTORY_FILE)}`)
