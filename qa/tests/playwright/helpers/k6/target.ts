/**
 * Shared by the k6 scripts (load/, perfo/). Runs in k6, not Node: no npm
 * packages, no `fs` — files are read with k6's `open()`, which only works
 * while a script initialises (module top level).
 *
 * Page selection follows the Node suites (helpers/flatten-urls.ts and
 * helpers/test-groups.ts) with the same groups, environments and rules; it is
 * reimplemented here only because those helpers need Node's `process` and
 * `URL`.
 */
import {
  assertKnown,
  ENV_GROUPS,
  TEST_ENVS,
  TEST_GROUPS,
  type TestEnv,
} from "../test-groups.ts"

/** Opens a file relative to this module (decoded: k6 trips on `%20` in paths). */
function openRelative(path: string): string {
  return open(decodeURI(import.meta.resolve(path)))
}

/** KEY=value pairs from qa/tests/playwright/.env (k6 can't load it on its own). */
function readDotEnv(): Record<string, string> {
  let content: string
  try {
    content = openRelative("../../.env")
  } catch {
    return {}
  }
  const vars: Record<string, string> = {}
  for (const line of content.split("\n")) {
    const separator = line.indexOf("=")
    if (separator < 1 || line.trimStart().startsWith("#")) continue

    const value = line.slice(separator + 1).trim()
    const unquoted = /^(["']).*\1$/.test(value) ? value.slice(1, -1) : value
    vars[line.slice(0, separator).trim()] = unquoted
  }

  return vars
}

const DOT_ENV = readDotEnv()

/** A variable from the command line, else from .env. */
function setting(name: string): string | undefined {
  return __ENV[name] || DOT_ENV[name] || undefined
}

/** BASE_URL from the command line, else from .env — without a trailing slash. */
export function baseUrl(): string {
  const url = (setting("BASE_URL") ?? "").replace(/\/$/, "")
  if (!url) throw new Error("Set BASE_URL in qa/tests/playwright/.env")

  return url
}

/** The hostname of a URL, lower-cased. */
export function hostOf(url: string): string {
  return url
    .replace(/^\w+:\/\//, "")
    .split(/[/:?#]/, 1)[0]
    .toLowerCase()
}

/**
 * The environment under test — the same rule as resolveTestEnv() in
 * helpers/test-groups.ts: a `dev` or `stg`/`staging` hostname segment, else
 * production; `undefined` for a local host.
 */
export function testEnv(url: string): TestEnv | undefined {
  const host = hostOf(url)
  if (
    ["localhost", "127.0.0.1", "[::1]", "host.docker.internal"].includes(host)
  ) {
    return undefined
  }
  if (/(^|[-.])dev([-.]|$)/.test(host)) return "dev"
  if (/(^|[-.])(stg|staging)([-.]|$)/.test(host)) return "stg"

  return "prod"
}

/**
 * Full URL of a page. "/" is BASE_URL itself: with a path in BASE_URL
 * (https://example.com/blog), appending "/" would ask for /blog/, which
 * Next.js answers with a redirect — and every visit would measure it.
 */
export function pageUrl(base: string, path: string): string {
  return path === "/" ? base : `${base}${path}`
}

type GroupUrls = string[] | Partial<Record<TestEnv, string[]>>

/**
 * The pages of `suite` in helpers/urls.json, picked like every other suite
 * does it: groups from QA_GROUPS, else what ENV_GROUPS lists for the
 * environment, and each group's pages for that environment — every page for
 * a local host. A mistyped group or environment fails the run instead of
 * testing nothing.
 */
export function pagesFor(suite: string, base: string): string[] {
  const urls = JSON.parse(openRelative("../urls.json")) as Record<
    string,
    Record<string, GroupUrls> | undefined
  >
  const groupsOfSuite = urls[suite] ?? {}
  const groups = Object.keys(groupsOfSuite)
  assertKnown(
    groups,
    TEST_GROUPS,
    `group under "${suite}" in helpers/urls.json`
  )
  for (const group of groups) {
    const pages = groupsOfSuite[group]
    if (!Array.isArray(pages)) {
      assertKnown(
        Object.keys(pages),
        TEST_ENVS,
        `environment in helpers/urls.json group "${suite}.${group}"`
      )
    }
  }

  const env = testEnv(base)
  const picked = (setting("QA_GROUPS") ?? "")
    .split(/[\s,;]+/)
    .filter((group) => group && group !== "auto")
  assertKnown(picked, TEST_GROUPS, "group in QA_GROUPS")
  const envGroups = env ? ENV_GROUPS[env] : "all"
  let selected: readonly string[] | undefined
  if (picked.length > 0) selected = picked
  else if (envGroups !== "all") selected = envGroups

  const paths = [
    ...new Set(
      groups
        .filter((group) => !selected || selected.includes(group))
        .flatMap((group) => {
          const pages = groupsOfSuite[group]
          if (Array.isArray(pages)) return pages

          return env ? (pages[env] ?? []) : Object.values(pages).flat()
        })
    ),
  ]
  if (paths.length === 0) {
    const qaGroups = setting("QA_GROUPS")
    throw new Error(
      `No "${suite}" pages for ${env ?? "a local run"}${qaGroups ? ` and QA_GROUPS=${qaGroups}` : ""} in helpers/urls.json`
    )
  }

  return paths
}
