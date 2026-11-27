/** robots.txt parsing (RFC 9309) and robots directives for the SEO tests. */

export type RobotsLine = { field: string; value: string; line: number }

export type RobotsFile = {
  lines: RobotsLine[]
  /** Allow/Disallow rules per user agent (lowercase), groups merged. */
  rulesByAgent: Map<string, RobotsLine[]>
  sitemaps: string[]
}

// Directives the tests check. Crawlers ignore any other one (RFC 9309), so an
// unknown directive such as Cloudflare's `Content-Signal` is only a warning.
const KNOWN_FIELDS = new Set([
  "user-agent",
  "allow",
  "disallow",
  "sitemap",
  "crawl-delay",
  "host",
])

const isRule = ({ field }: RobotsLine) =>
  field === "allow" || field === "disallow"

export const isDisallowAll = ({ field, value }: RobotsLine) =>
  field === "disallow" && value === "/"

export const quoteLine = ({ field, value, line }: RobotsLine) =>
  `Line ${line}: "${field}: ${value}"`

/** One `field: value` record per non-empty line, comments removed. */
function splitLines(body: string): RobotsLine[] {
  return body.split("\n").flatMap((raw, i) => {
    const hash = raw.indexOf("#")
    const text = (hash === -1 ? raw : raw.slice(0, hash)).trim()
    if (!text) return []

    const colon = text.indexOf(":")
    const field = colon === -1 ? text : text.slice(0, colon)
    const value = colon === -1 ? "" : text.slice(colon + 1)

    const entry: RobotsLine = {
      field: field.trim().toLowerCase(),
      value: value.trim(),
      line: i + 1,
    }

    return [entry]
  })
}

export function parseRobots(body: string): RobotsFile {
  const lines = splitLines(body)
  const rulesByAgent = new Map<string, RobotsLine[]>()
  let agents: string[] = []
  let lastWasAgent = false

  for (const entry of lines) {
    if (entry.field === "user-agent") {
      // Consecutive User-agent lines share one group; groups for the same
      // agent merge (RFC 9309), e.g. two `User-agent: *`.
      const agent = entry.value.toLowerCase()
      agents = lastWasAgent ? [...agents, agent] : [agent]
      if (!rulesByAgent.has(agent)) rulesByAgent.set(agent, [])
      lastWasAgent = true
    } else if (isRule(entry)) {
      for (const agent of agents) rulesByAgent.get(agent)?.push(entry)
      lastWasAgent = false
    }
    // Other records (Sitemap, Crawl-delay, Content-Signal …) leave groups alone.
  }

  return {
    lines,
    rulesByAgent,
    sitemaps: lines.filter((l) => l.field === "sitemap").map((l) => l.value),
  }
}

/** Lines crawlers would ignore or misread, and directives the tests don't know. */
export function lintRobots(lines: RobotsLine[]) {
  const firstAgent = lines.findIndex((l) => l.field === "user-agent")
  const problems: string[] = []
  const unknown: string[] = []

  if (firstAgent === -1) {
    problems.push(
      'There is no "User-agent" line, so no crawler applies any rule.'
    )
  }

  for (const [i, entry] of lines.entries()) {
    const quoted = quoteLine(entry)

    if (!KNOWN_FIELDS.has(entry.field)) {
      unknown.push(quoted)
    } else if (isRule(entry) && i < firstAgent) {
      problems.push(
        `${quoted} comes before any "User-agent" line, so crawlers ignore it.`
      )
    } else if (isRule(entry) && entry.value && !/^[/*]/.test(entry.value)) {
      // An empty Disallow allows everything; any other value is a path.
      problems.push(
        `${quoted} must be a path starting with "/" (for example "/admin").`
      )
    } else if (entry.field === "sitemap" && !/^https?:\/\//.test(entry.value)) {
      problems.push(
        `${quoted} must be a full URL (for example "https://example.com/sitemap.xml").`
      )
    }
  }

  return { problems, unknown }
}

/**
 * Whether a robots meta `content` or `X-Robots-Tag` value contains `noindex`
 * or `none` (`noindex, nofollow`). Matches whole directives, so a bot name
 * (`somebot: nosnippet`) can't match by accident.
 */
export const hasNoindex = (value: string) =>
  value
    .toLowerCase()
    .split(/[\s,:]+/)
    .some((token) => token === "noindex" || token === "none")
