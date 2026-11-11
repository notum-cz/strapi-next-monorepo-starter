/**
 * Core Web Vitals — opens every page listed under "perfo" in
 * helpers/urls.json in a real Chrome and checks LCP, CLS, FCP and TTFB
 * against Google's "good" limits — on a phone and on a desktop, one after the
 * other. The phone is a mid-range device on slow 4G and the desktop runs
 * unthrottled, the same presets Lighthouse uses, so the numbers compare with
 * Lighthouse / PageSpeed.
 *
 * Runs in k6 (browser module), not Node, and needs Chrome or Chromium
 * installed. Target: BASE_URL from qa/tests/playwright/.env.
 *
 * See apps/docs/docs/QA/playwright/web-vitals.md.
 */
import { check } from "k6"
import { browser } from "k6/browser"
import exec from "k6/execution"
import type { Options } from "k6/options"

import {
  explain,
  investigate,
  OBSERVE_SCRIPT,
  readClues,
  recordDiagnostics,
} from "./diagnostics.ts"
import { baseUrl, pagesFor, pageUrl } from "../helpers/k6/target.ts"

// ─── Settings ────────────────────────────────────────────────────────────────
// Defaults for every run. Override any of them for one run from the command
// line, e.g. `VITALS_MODES=desktop pnpm tests:k6:vitals`.
const SETTINGS = {
  /** Visits per page; each vital is judged on the median visit, so one outlier can't skew it. Override: VITALS_RUNS */
  runs: 5,
  /** Devices to test, one after the other: mobile, desktop or both (comma-separated). Override: VITALS_MODES */
  modes: "mobile,desktop",
}
// ─────────────────────────────────────────────────────────────────────────────

const RUNS = Number(__ENV.VITALS_RUNS || SETTINGS.runs)

/** Lighthouse's mobile "slow 4G", as applied through DevTools (bytes/s). */
const SLOW_4G = {
  latency: 562.5,
  download: (1474.56 * 1024) / 8,
  upload: (675 * 1024) / 8,
}

/** The two devices, matching Lighthouse's mobile and desktop presets. */
const DEVICES = {
  mobile: {
    label: "📱 mobile",
    description: "phone on slow 4G",
    context: {
      viewport: { width: 412, height: 823 },
      deviceScaleFactor: 1.75,
      isMobile: true,
      hasTouch: true,
    },
    throttle: true,
  },
  desktop: {
    label: "🖥️ desktop",
    description: "desktop, no throttling",
    context: { viewport: { width: 1350, height: 940 } },
    throttle: false,
  },
}
type Mode = keyof typeof DEVICES

const MODES = (__ENV.VITALS_MODES || SETTINGS.modes)
  .split(",")
  .map((mode) => mode.trim())
  .filter(Boolean)
if (MODES.length === 0 || MODES.some((mode) => !Object.hasOwn(DEVICES, mode))) {
  throw new Error(
    `VITALS_MODES must list ${Object.keys(DEVICES).join(" and/or ")}, got "${MODES.join(",")}"`
  )
}
const DEVICE_MODES = MODES as Mode[]
/**
 * Append this run to perfo/web-vitals-history.md — locally and in CI.
 * Locally the file is gitignored, a personal log; CI pushes its copy to the
 * qa/web-vitals-history branch. VITALS_HISTORY=false skips it for one run.
 */
const RECORD_HISTORY = (__ENV.VITALS_HISTORY || "true") === "true"

const BASE_URL = baseUrl()
const PATHS = pagesFor("perfo", BASE_URL)

/**
 * Google's bands (https://web.dev/articles/vitals), applied to the median
 * visit:
 * 🟢 up to `good`, 🟠 up to `poor`, 🔴 above. A run passes when every page is
 * 🟢 on every vital — the thresholds below are built from `good`.
 */
const VITALS = [
  { metric: "browser_web_vital_lcp", label: "LCP", good: 2500, poor: 4000 }, // Largest Contentful Paint, ms
  { metric: "browser_web_vital_cls", label: "CLS", good: 0.1, poor: 0.25 }, // Cumulative Layout Shift, unitless
  { metric: "browser_web_vital_fcp", label: "FCP", good: 1800, poor: 3000 }, // First Contentful Paint, ms
  { metric: "browser_web_vital_ttfb", label: "TTFB", good: 800, poor: 1800 }, // Time to First Byte, ms
]

export const options: Options = {
  scenarios: {
    vitals: {
      executor: "shared-iterations",
      vus: 1,
      // Sequential (one browser at a time): a second Chrome running alongside
      // would compete for CPU and skew the throttled phone numbers.
      iterations: DEVICE_MODES.length * PATHS.length * RUNS,
      maxDuration: "15m",
      options: { browser: { type: "chromium" } },
    },
  },
  // One set of limits per page and device, so nothing hides behind an average.
  thresholds: {
    checks: ["rate==1"],
    ...Object.fromEntries(
      DEVICE_MODES.flatMap((mode) =>
        PATHS.flatMap((path) =>
          VITALS.map(({ metric, good }) => [
            `${metric}{page:${path},mode:${mode}}`,
            [`med<=${good}`],
          ])
        )
      )
    ),
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(95)"],
}

export default async function () {
  // All visits of the first device, then all of the next.
  const visit = exec.scenario.iterationInTest
  const mode = DEVICE_MODES[Math.floor(visit / (PATHS.length * RUNS))]
  const path = PATHS[visit % PATHS.length]
  const device = DEVICES[mode]
  // Tags every metric of this visit, which the thresholds key on.
  exec.vu.metrics.tags.page = path
  exec.vu.metrics.tags.mode = mode

  // A fresh context per visit: empty cache and cookies, like a first visit.
  const context = await browser.newContext(device.context)
  // Watches the LCP element, layout shifts and long tasks from the first byte.
  await context.addInitScript(OBSERVE_SCRIPT)
  const page = await context.newPage()

  try {
    if (device.throttle) {
      await page.throttleCPU({ rate: 4 })
      await page.throttleNetwork(SLOW_4G)
    }
    const response = await page.goto(pageUrl(BASE_URL, path), {
      waitUntil: "networkidle",
    })
    check(response, { "status 200": (r) => r?.status() === 200 })
    await recordDiagnostics(page, mode, path)
  } finally {
    // Closing the page reports the final LCP and CLS.
    await page.close()
    await context.close()
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────
// Replaces k6's long end-of-test printout with one row per page and device and
// a 🟢🟠🔴 dot per vital. Appends the run to perfo/web-vitals-history.md and,
// when something isn't green, writes an investigation into
// perfo/investigations/ that the history row links to.

/** Absolute path of a file next to this script (k6 hands back a file URL). */
const local = (relative: string) =>
  decodeURI(import.meta.resolve(relative)).replace(/^file:\/\//, "")

/**
 * The trend log. k6 can only write whole files, so the existing history is
 * read here (init context, the only place `open()` works) and rewritten with
 * the new rows at the end. Absolute paths: the run can start from anywhere.
 */
const HISTORY_PATH = local("./web-vitals-history.md")
/** k6 can't create directories; this one is kept in Git by a .gitkeep. */
const INVESTIGATIONS_DIR = "investigations"

function readHistory(): string {
  try {
    return open(HISTORY_PATH)
  } catch {
    return "" // first run: no history yet
  }
}

const HISTORY = readHistory()

const HISTORY_COLUMNS = [
  "Date (UTC)",
  "Target",
  "Mode",
  ...VITALS.map(({ label }) => label),
  "Result",
  "Investigation",
]
const HISTORY_HEADER = `| ${HISTORY_COLUMNS.join(" | ")} |`
const HISTORY_DIVIDER = `| ${HISTORY_COLUMNS.map(() => "---").join(" | ")} |`

/**
 * Rebuilds the file: the per-page tables keep every existing row and get the
 * new ones at the end. Anything that isn't a page section is dropped.
 */
function appendToHistory(
  existing: string,
  newRows: [page: string, row: string][]
): string {
  const sections = new Map<string, string[]>()
  let current: string[] | undefined
  for (const line of existing.split("\n")) {
    const heading = /^## (.+)$/.exec(line)
    if (heading) {
      current = heading[1].startsWith("/")
        ? (sections.get(heading[1]) ?? [])
        : undefined
      if (current) sections.set(heading[1], current)
    } else if (
      current &&
      line.startsWith("| ") &&
      !line.startsWith("| Date") &&
      !line.startsWith("| ---")
    ) {
      // Rows from before the Investigation column get an empty cell.
      const cells = line.split(" | ").length
      current.push(
        cells < HISTORY_COLUMNS.length ? line.replace(/ \|$/, " | – |") : line
      )
    }
  }
  for (const [page, row] of newRows) {
    sections.set(page, [...(sections.get(page) ?? []), row])
  }

  return [
    "# Core Web Vitals history",
    "",
    "One row per run of `pnpm tests:k6:vitals`, newest at the bottom of each page. Values are the median visit, rated with Google's bands: 🟢 good · 🟠 needs improvement · 🔴 poor. A run that isn't all green links to its investigation in `investigations/`. Compare rows with the same target and mode only.",
    "",
    ...[...sections].flatMap(([page, rows]) => [
      `## ${page}`,
      "",
      HISTORY_HEADER,
      HISTORY_DIVIDER,
      ...rows,
      "",
    ]),
  ].join("\n")
}

/** The part of k6's end-of-test data this summary reads. */
interface SummaryData {
  root_group: { checks: { name: string; passes: number; fails: number }[] }
  metrics: Record<
    string,
    | undefined
    | {
        values: Record<string, number>
        thresholds?: Record<string, { ok: boolean }>
      }
  >
}

function dot(value: number, good: number, poor: number): string {
  if (value <= good) return "🟢"
  if (value <= poor) return "🟠"

  return "🔴"
}

function format(label: string, value: number): string {
  if (label === "CLS") return value.toFixed(2)

  return value >= 1000
    ? `${(value / 1000).toFixed(1)} s`
    : `${Math.round(value)} ms`
}

/** Google's limit for a vital, in the same units the summary shows. */
function limit(label: string, value: number): string {
  return label === "CLS" ? `≤ ${value}` : `≤ ${format(label, value)}`
}

export function handleSummary(data: SummaryData): Record<string, string> {
  const results = DEVICE_MODES.flatMap((mode) =>
    PATHS.map((path) => ({ mode, path }))
  ).map(({ mode, path }) => {
    const medians = VITALS.map(
      ({ metric }) =>
        data.metrics[`${metric}{page:${path},mode:${mode}}`]?.values.med
    )
    const cells = VITALS.map(({ label, good, poor }, index) => {
      const median = medians[index]

      return median === undefined
        ? "⚪ –"
        : `${dot(median, good, poor)} ${format(label, median)}`
    })
    const notGreen = new Set(
      VITALS.filter(
        ({ good }, index) =>
          medians[index] === undefined || medians[index] > good
      ).map(({ label }) => label)
    )

    return {
      mode,
      path,
      medians,
      cells,
      notGreen,
      allGood: notGreen.size === 0,
      clues: readClues(data.root_group.checks, mode, path),
    }
  })
  const failing = results.filter(({ allGood }) => !allGood)

  const now = new Date()
  const date = now.toISOString().slice(0, 16).replace("T", " ")
  const target = BASE_URL.replace(/^\w+:\/\//, "")
  const host = target.split("/", 1)[0]
  const investigationName = `${now.toISOString().slice(0, 16).replace(":", "-")}Z_${host}.md`
  const investigationPath = `${INVESTIGATIONS_DIR}/${investigationName}`
  const writeInvestigation = RECORD_HISTORY && failing.length > 0

  // ── Terminal ────────────────────────────────────────────────────────────────
  const header = ["page", "device", ...VITALS.map(({ label }) => label)]
  const rows = results.map(({ mode, path, cells }) => [path, mode, ...cells])
  const widths = header.map((_, column) =>
    Math.max(...[header, ...rows].map((row) => row[column].length))
  )
  const line = (row: string[]) =>
    row.map((cell, column) => cell.padEnd(widths[column])).join(" ".repeat(3))
  const failedThresholds = Object.values(data.metrics).some((metric) =>
    Object.values(metric?.thresholds ?? {}).some(({ ok }) => !ok)
  )
  const devices = DEVICE_MODES.map(
    (mode) => `${mode} = ${DEVICES[mode].description}`
  ).join(", ")
  // Without an investigation file, the short clues go to the terminal so
  // they are never lost.
  const why = writeInvestigation
    ? []
    : failing.flatMap(({ mode, path, clues, notGreen }) => [
        "",
        `${DEVICES[mode].label} · ${path} — why it isn't 🟢`,
        ...explain(clues, notGreen, DEVICES[mode].throttle).map(
          (clue) => `  ${clue}`
        ),
      ])

  const terminal = [
    "",
    `Core Web Vitals — median of ${RUNS} visit(s) per page and device (${devices})`,
    "",
    line(header),
    ...rows.map(line),
    ...why,
    "",
    "🟢 good · 🟠 needs improvement · 🔴 poor · ⚪ not measured",
    failedThresholds
      ? "✗ FAIL — not every page is 🟢 on every vital on every device (or a page didn't return 200)"
      : "✓ PASS — every page is 🟢 on every vital on every device",
    "Graphs: perfo/report.html",
    RECORD_HISTORY
      ? "Trend: appended to perfo/web-vitals-history.md"
      : "Trend: not recorded (VITALS_HISTORY=false)",
    ...(writeInvestigation
      ? [`Why it isn't 🟢: perfo/${investigationPath}`]
      : []),
    "",
  ].join("\n")

  // ── History ─────────────────────────────────────────────────────────────────
  const history = appendToHistory(
    HISTORY,
    results.map(({ mode, path, cells, allGood }) => [
      path,
      `| ${[
        date,
        target,
        DEVICES[mode].label,
        ...cells,
        allGood ? "✅" : "❌",
        allGood ? "–" : `[🔍 why](${investigationPath})`,
      ].join(" | ")} |`,
    ])
  )

  // ── Investigation ───────────────────────────────────────────────────────────
  const modesUsed = [...new Set(failing.map(({ mode }) => mode))]
  const investigation = [
    `# Core Web Vitals investigation — ${date} UTC`,
    "",
    `- **Target:** ${BASE_URL}`,
    `- **Visits:** median of ${RUNS} per page and device · ${devices}`,
    "- **Back to:** [the history](../web-vitals-history.md)",
    "",
    "## Results",
    "",
    `| Page | Device | ${VITALS.map(({ label }) => label).join(" | ")} |`,
    `| --- | --- | ${VITALS.map(() => "---").join(" | ")} |`,
    ...results.map(
      ({ mode, path, cells }) =>
        `| ${path} | ${DEVICES[mode].label} | ${cells.join(" | ")} |`
    ),
    "",
    `Google's "good" limits: ${VITALS.map(({ label, good }) => `${label} ${limit(label, good)}`).join(" · ")}.`,
    "",
    ...failing.flatMap(({ mode, path, medians, notGreen, clues }) => {
      const { findings, recommendations } = investigate(
        clues,
        notGreen,
        DEVICES[mode].throttle
      )

      return [
        `## ${DEVICES[mode].label} · ${path}`,
        "",
        `**Not green:** ${VITALS.filter(({ label }) => notGreen.has(label))
          .map(({ label, good }) => {
            const index = VITALS.findIndex((vital) => vital.label === label)
            const median = medians[index]

            return `${label} ${median === undefined ? "not measured" : format(label, median)} (good ${limit(label, good)})`
          })
          .join(" · ")}`,
        "",
        "### Findings",
        "",
        ...findings.map((finding) =>
          finding.startsWith("  ") ? finding : `- ${finding}`
        ),
        "",
        "### Recommendations",
        "",
        ...recommendations.map(({ area, text }) => `- **[${area}]** ${text}`),
        "",
      ]
    }),
    "## For a coding agent",
    "",
    `- **Reproduce:** from the repository root run \`BASE_URL=${BASE_URL} VITALS_MODES=${modesUsed.join(",")} pnpm tests:k6:vitals\`. It appends a new row to \`qa/tests/playwright/perfo/web-vitals-history.md\`; compare it with this run.`,
    "- **[Content · Strapi]** items are fixed in the CMS (Media Library, page content), not in code. Hand them to whoever edits the content, or change them through the Strapi admin.",
    "- **[Code]** items usually live in `apps/ui/src/components/page-builder/components/sections/` (the section that renders the element), `apps/ui/src/components/page-builder/components/utilities/StrapiBasicImage.tsx` and `apps/ui/src/components/elementary/images/` (images), `apps/ui/src/lib/fonts.ts` (fonts) and the root layout in `apps/ui/src/app/` (scripts, CSS).",
    "- **[Infra]** items are about hosting, caching and redirects: response headers (`x-nextjs-cache`, CDN cache status), redirect rules, Strapi response times.",
    "- **Done when** the page is 🟢 on every vital in a new run. These clues come from a single lab machine; confirm with Lighthouse in Chrome DevTools or PageSpeed Insights.",
    "",
  ].join("\n")

  return {
    stdout: terminal,
    ...(RECORD_HISTORY && { [HISTORY_PATH]: history }),
    ...(writeInvestigation && {
      [local(`./${investigationPath}`)]: investigation,
    }),
  }
}
