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
const GHERKIN_FENCE_RE = /```gherkin\r?\n([\s\S]*?)```/g

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
  return extractScenarios(code).filter((scenario) => scenario.tags.includes("@manual"))
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
    const code = match[1]
    const scenarios = extractManualScenarios(code)
    if (scenarios.length === 0) continue

    blocks.push({ blockIndex, featureName: extractFeatureName(code), scenarios })
    blockIndex += 1
  }

  return blocks
}
