/**
 * Shared Gherkin parsing used both at content-transform time (the
 * gherkin-checklist remark plugin, operating on an already-parsed code
 * node) and at plugin-load time (the test-plan-manifest plugin, scanning
 * raw file content on disk). Keeping one implementation means both stay
 * in lockstep on which scenarios count as "manual" and how block indexes
 * are assigned — that assignment determines the localStorage key a
 * GherkinChecklist instance reads/writes, so a drift here would silently
 * point the plan-level export at the wrong results.
 */

export interface Scenario {
  type: string
  title: string
  tags: string[]
}

export interface ChecklistBlock {
  blockIndex: number
  featureName: string
  scenarios: Scenario[]
}

const SCENARIO_RE = /^(Scenario(?: Outline)?):\s*(.+)$/
const FEATURE_RE = /^Feature:\s*(.+)$/
// CommonMark fences aren't always exactly ``` — a fence can use 3+
// backticks or 3+ tildes, and the closing fence just has to reuse the same
// character (matched here via the \1 backreference to whatever the opening
// fence actually was). remarkGherkinChecklist matches any of these for
// free (it reads the already-parsed AST node's `lang`, not raw text) — this
// regex has to handle them explicitly since it scans raw Markdown instead.
const GHERKIN_FENCE_RE = /(`{3,}|~{3,})gherkin\r?\n([\s\S]*?)\1/g

export function extractFeatureName(code: string): string {
  for (const rawLine of code.split("\n")) {
    const match = rawLine.trim().match(FEATURE_RE)
    if (match) return match[1]
  }
  return "Feature"
}

export function extractScenarios(code: string): Scenario[] {
  const scenarios: Scenario[] = []
  let pendingTags: string[] = []

  for (const rawLine of code.split("\n")) {
    const line = rawLine.trim()

    if (line.startsWith("@")) {
      pendingTags.push(...line.split(/\s+/).filter(Boolean))
      continue
    }

    const match = line.match(SCENARIO_RE)
    if (match) {
      scenarios.push({ type: match[1], title: match[2], tags: pendingTags })
      pendingTags = []
      continue
    }

    // Tags always sit directly above their Scenario line — any other
    // non-blank, non-comment line in between means they don't apply here.
    if (line.length > 0 && !line.startsWith("#")) {
      pendingTags = []
    }
  }

  return scenarios
}

// Only manual scenarios need a human to click through them — automated ones
// are already covered by the Playwright/Vitest spec that runs them.
export function extractManualScenarios(code: string): Scenario[] {
  return extractScenarios(code).filter((scenario) =>
    scenario.tags.includes("@manual")
  )
}

/**
 * Scans raw Markdown for ```gherkin fences and returns one block per fence
 * that has at least one manual scenario — blocks with none are skipped
 * entirely, and blockIndex only counts the ones that survive, exactly
 * matching the remark plugin's own counter.
 */
export function extractChecklistBlocks(markdown: string): ChecklistBlock[] {
  const blocks: ChecklistBlock[] = []
  let blockIndex = 0
  let match: RegExpExecArray | null

  GHERKIN_FENCE_RE.lastIndex = 0
  while ((match = GHERKIN_FENCE_RE.exec(markdown))) {
    const code = match[2]
    const scenarios = extractManualScenarios(code)
    if (scenarios.length === 0) continue

    blocks.push({
      blockIndex,
      featureName: extractFeatureName(code),
      scenarios,
    })
    blockIndex += 1
  }

  return blocks
}

/**
 * The route path a checklist is keyed by can come from two different
 * sources that don't agree on a trailing slash: the live router
 * (useLocation(), which reflects docusaurus.config.ts's trailingSlash
 * setting) on the reading/writing side in GherkinChecklist, and a
 * hand-built path from the test-plan-manifest plugin on the aggregating
 * side in TestPlanExport. Routing both through this before building the
 * storage key keeps them pointing at the same localStorage entry.
 */
export function normalizeRoutePath(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname
}

export function gherkinStorageKey(
  routePath: string,
  blockIndex: number | string
): string {
  return `gherkin-checklist:${normalizeRoutePath(routePath)}:${blockIndex}`
}

export type ChecklistStatus = "pass" | "fail" | null

export interface ScenarioResult {
  status: ChecklistStatus
  comment: string
  /** Ids into imageStore.ts's IndexedDB store — the bytes themselves
   * never live in this (localStorage-persisted) state. */
  images: string[]
}

/** Everything persisted under one gherkinStorageKey(): per-scenario
 * Pass/Fail + notes, plus one general note for the whole checklist.
 * `items` is keyed by scenarioKey(), not by array position — see there
 * for why. */
export interface ChecklistState {
  general: string
  generalImages: string[]
  items: Record<string, ScenarioResult>
}

/**
 * A scenario's stable identity within its checklist. Deliberately NOT the
 * array index: adding, removing, or reordering a Scenario in the Markdown
 * shifts every later index, which would silently reattach an old
 * Pass/Fail/note to the wrong scenario. `type` disambiguates the
 * (unlikely) case of a Scenario and a Scenario Outline sharing a title.
 * Renaming a scenario's title is the one edit this can't survive — that's
 * an accepted tradeoff, not a bug, since a title rename usually means the
 * scenario materially changed anyway.
 */
export function scenarioKey(scenario: Scenario): string {
  return `${scenario.type}:${scenario.title}`
}

export function emptyChecklistState(): ChecklistState {
  return { general: "", generalImages: [], items: {} }
}

function normalizeScenarioResult(value: unknown): ScenarioResult {
  if (value && typeof value === "object") {
    const v = value as Partial<ScenarioResult>
    return {
      status: v.status ?? null,
      comment: typeof v.comment === "string" ? v.comment : "",
      images: Array.isArray(v.images) ? v.images : [],
    }
  }
  // Oldest format: the value was the status itself (Record<number, Status>).
  return { status: (value as ChecklistStatus) ?? null, comment: "", images: [] }
}

const LEGACY_NUMERIC_KEY_RE = /^\d+$/

/**
 * Parses the raw string stored under a gherkinStorageKey(). `scenarios`
 * is the checklist's current scenario list — needed to migrate older
 * saves that keyed `items` by array position instead of scenarioKey():
 *  - oldest: a flat `Record<number, Status>` (no `items` wrapper at all)
 *  - pre-images: `{ general, items: Record<number, { status, comment }> }`
 *  - pre-scenarioKey: same shape as current, but `items` keyed by index
 *
 * A legacy numeric key only migrates if that position still falls within
 * the current list — if the list has since shrunk past it, the entry
 * can't be attributed to anything and is dropped. This one-time
 * migration can't detect a list that changed *shape* without shrinking
 * (a scenario removed from the middle, or reordered) between when the
 * result was saved and when this code first runs — the saved position no
 * longer means what it meant when it was written, and that information
 * is simply gone. That's a pre-existing limitation of the old
 * position-keyed data, not something migration can undo; every write
 * from here on uses scenarioKey() and stays correct through any future
 * addition, removal, or reorder.
 */
export function parseChecklistState(
  raw: string | null,
  scenarios: Scenario[]
): ChecklistState {
  if (!raw) return emptyChecklistState()

  try {
    const parsed = JSON.parse(raw)
    const hasItemsWrapper =
      parsed && typeof parsed === "object" && "items" in parsed
    const rawItems: Record<string, unknown> = hasItemsWrapper
      ? (parsed.items ?? {})
      : (parsed ?? {})

    const items: Record<string, ScenarioResult> = {}
    for (const [key, value] of Object.entries(rawItems)) {
      if (LEGACY_NUMERIC_KEY_RE.test(key)) {
        const scenario = scenarios[Number(key)]
        if (!scenario) continue
        items[scenarioKey(scenario)] = normalizeScenarioResult(value)
      } else {
        items[key] = normalizeScenarioResult(value)
      }
    }

    return {
      general:
        hasItemsWrapper && typeof parsed.general === "string"
          ? parsed.general
          : "",
      generalImages:
        hasItemsWrapper && Array.isArray(parsed.generalImages)
          ? parsed.generalImages
          : [],
      items,
    }
  } catch {
    return emptyChecklistState()
  }
}
