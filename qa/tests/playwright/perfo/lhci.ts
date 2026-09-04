/* eslint-disable no-console */
import "dotenv/config"

import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

import urls from "../helpers/urls.json"

const BASE_URL = process.env.BASE_URL

if (!BASE_URL) {
  throw new Error("Missing BASE_URL environment variable")
}

if (!Array.isArray(urls) || urls.length === 0) {
  throw new Error("No sites found in sites.json")
}

const fullUrls = urls.map((p) => `${BASE_URL}${p}`)

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

const TABLE_HEADER = [
  "| Date | URL | Performance | Accessibility | Best Practices | SEO |",
  "| --- | --- | --- | --- | --- | --- |",
].join("\n")

function formatCell(value: number | null): string {
  return value === null ? "–" : String(value)
}

function formatRow(entry: HistoryEntry): string {
  const cells = [
    entry.date,
    entry.url,
    formatCell(entry.performance),
    formatCell(entry.accessibility),
    formatCell(entry.bestPractices),
    formatCell(entry.seo),
  ]

  return `| ${cells.join(" | ")} |`
}

const entries = buildHistoryEntries()

const hasHeader =
  fs.existsSync(HISTORY_FILE) &&
  fs.readFileSync(HISTORY_FILE, "utf8").trim() !== ""

fs.appendFileSync(
  HISTORY_FILE,
  (hasHeader ? "" : `${TABLE_HEADER}\n`) +
    entries.map(formatRow).join("\n") +
    "\n"
)

console.log(`\nLighthouse trend (${entries.length} page(s)):`)
console.table(entries)
console.log(`Appended results to ${path.relative(process.cwd(), HISTORY_FILE)}`)
