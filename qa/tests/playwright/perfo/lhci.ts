/* eslint-disable no-console */
import "dotenv/config"

import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

import { urlsByGroup } from "../helpers/flatten-urls"
import { selectedGroups } from "../helpers/test-groups"

import urls from "../helpers/urls.json"

const BASE_URL = process.env.BASE_URL

if (!BASE_URL) {
  throw new Error("Missing BASE_URL environment variable")
}

const groups = selectedGroups()

// LHCI is not Playwright, so the config's tag filter never reaches it.
// A Set, because two selected groups may list the same page.
const PATHS = [
  ...new Set(
    urlsByGroup(urls.perfo)
      .filter(({ group }) => !groups || groups.includes(group))
      .map(({ path }) => path)
  ),
]

const CWD = path.resolve("perfo")
const LHCI_OUTPUT_DIR = path.join(CWD, ".lighthouseci")
const HISTORY_FILE = path.join(CWD, "lighthouse-history.md")

/**
 * Throws when a page does not answer with a 2xx status. Lighthouse would
 * otherwise score the 404 page and record it in the history as that URL.
 */
async function assertPagesExist(paths: string[]): Promise<void> {
  const failed: string[] = []
  for (const p of paths) {
    const response = await fetch(`${BASE_URL}${p}`)
    // Only the status is needed. An unread body keeps the connection open.
    await response.body?.cancel()
    if (!response.ok) failed.push(`${p} (${response.status})`)
  }

  if (failed.length > 0) {
    throw new Error(`Pages did not respond with 2xx: ${failed.join(", ")}`)
  }
}

/** Runs `lhci collect` once per path into a freshly emptied output directory. */
function collect(paths: string[]): void {
  const fullUrls = paths.map((p) => `${BASE_URL}${p}`)

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

/** Appends this run's scores to the per-URL sections of the history file. */
function writeHistory(): void {
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
}

async function main(): Promise<void> {
  if (PATHS.length === 0) {
    console.log(
      `No LHCI pages for the selected groups (${groups?.join(", ") ?? "all"}), nothing to run.`
    )

    return
  }

  await assertPagesExist(PATHS)
  collect(PATHS)
  writeHistory()
}

// tsx runs this package as CommonJS, which has no top-level await. A rejection
// still exits non-zero.
// eslint-disable-next-line unicorn/prefer-top-level-await
main()
