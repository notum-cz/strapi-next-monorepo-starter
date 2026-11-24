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
  testEnvForHost,
  type TestEnv,
} from "../test-groups.ts"

/** Opens a file relative to this module (decoded: k6 trips on `%20` in paths). */
function openRelative(path: string): string {
  return open(decodeURI(import.meta.resolve(path)))
}

/**
 * KEY=value pairs from qa/tests/playwright/.env (k6 can't load it on its
 * own). Follows dotenv, which the Playwright suites read the same file with:
 * quotes are removed, and in an unquoted value `#` starts a comment.
 */
function readDotEnv(): Record<string, string> {
  let content: string
  try {
    content = openRelative("../../.env")
  } catch {
    return {}
  }
  const vars: Record<string, string> = {}
  for (const line of content.split(/\r?\n/)) {
    const separator = line.indexOf("=")
    if (separator < 1 || line.trimStart().startsWith("#")) continue

    const key = line
      .slice(0, separator)
      .trim()
      .replace(/^export\s+/, "")
    const raw = line.slice(separator + 1).trim()
    const quoted = /^(["'`])(.*?)\1/.exec(raw)
    vars[key] = quoted ? quoted[2] : raw.split("#", 1)[0].trim()
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
  // Without a protocol every visit fails ("Cannot navigate to invalid URL").
  if (!/^https?:\/\//.test(url)) {
    throw new Error(
      `BASE_URL must start with http:// or https://, got "${url}"`
    )
  }

  return url
}

/**
 * The hostname of a URL, the way `URL` reads it (k6 has no `URL`): without
 * the scheme, `user:password@` and port, lower-cased; an IPv6 host keeps its
 * brackets.
 */
export function hostOf(url: string): string {
  return url
    .replace(/^[a-z][\w+.-]*:\/\//i, "")
    .split(/[/?#]/, 1)[0]
    .replace(/^.*@/, "")
    .replace(/:\d*$/, "")
    .toLowerCase()
}

/** The environment under test — the rule resolveTestEnv() uses for the other suites. */
export function testEnv(url: string): TestEnv | undefined {
  return testEnvForHost(hostOf(url))
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

/** Throws unless `urls` is a list of paths, which the tests append to BASE_URL. */
function assertPaths(urls: unknown, where: string): asserts urls is string[] {
  if (
    !Array.isArray(urls) ||
    urls.some((path) => typeof path !== "string" || !path.startsWith("/"))
  ) {
    throw new Error(
      `helpers/urls.json "${where}" must be a list of paths starting with "/".`
    )
  }
}

/** A plain JSON object. */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

/** QA_GROUPS from the shell, else from .env. An empty shell value still wins, as in selectedGroups(). */
const QA_GROUPS = __ENV.QA_GROUPS ?? DOT_ENV.QA_GROUPS ?? ""

/**
 * The pages of `suite` in helpers/urls.json, picked like every other suite
 * does it: groups from QA_GROUPS, else what ENV_GROUPS lists for the
 * environment, and each group's pages for that environment — every page for
 * a local host. A mistyped group or environment fails the run instead of
 * testing nothing.
 */
export function pagesFor(suite: string, base: string): string[] {
  const urlsJson: unknown = JSON.parse(openRelative("../urls.json"))
  const groupsOfSuite = isRecord(urlsJson) ? (urlsJson[suite] ?? {}) : undefined
  if (!isRecord(groupsOfSuite)) {
    throw new Error(`helpers/urls.json "${suite}" must be an object of groups.`)
  }
  const groups = Object.keys(groupsOfSuite)
  assertKnown(
    groups,
    TEST_GROUPS,
    `group under "${suite}" in helpers/urls.json`
  )
  const urlsByGroup = new Map<string, GroupUrls>()
  for (const group of groups) {
    const pages: unknown = groupsOfSuite[group]
    if (!isRecord(pages)) {
      assertPaths(pages, `${suite}.${group}`)
      urlsByGroup.set(group, pages)
      continue
    }
    const envs: string[] = Object.keys(pages)
    assertKnown(
      envs,
      TEST_ENVS,
      `environment in helpers/urls.json group "${suite}.${group}"`
    )
    const perEnv: Partial<Record<TestEnv, string[]>> = {}
    for (const env of envs) {
      const list = pages[env]
      assertPaths(list, `${suite}.${group}.${env}`)
      perEnv[env as TestEnv] = list
    }
    urlsByGroup.set(group, perEnv)
  }

  const env = testEnv(base)
  const picked = QA_GROUPS.split(/[\s,;]+/).filter(
    (group) => group && group !== "auto"
  )
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
          const pages = urlsByGroup.get(group) ?? []
          if (Array.isArray(pages)) return pages

          return env ? (pages[env] ?? []) : Object.values(pages).flat()
        })
    ),
  ]
  if (paths.length === 0) {
    throw new Error(
      `No "${suite}" pages for ${env ?? "a local run"}${QA_GROUPS ? ` and QA_GROUPS=${QA_GROUPS}` : ""} in helpers/urls.json`
    )
  }

  return paths
}
