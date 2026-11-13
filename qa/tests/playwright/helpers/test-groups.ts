/** Every feature group a spec can be tagged with (`@homepage`, `@auth`, …). */
export const TEST_GROUPS = ["homepage", "auth"] as const

export type TestGroup = (typeof TEST_GROUPS)[number]

export const TEST_ENVS = ["dev", "stg", "prod"] as const

export type TestEnv = (typeof TEST_ENVS)[number]

// What is live on each environment. Promoting a feature is a one-line change here.
export const ENV_GROUPS: Record<TestEnv, readonly TestGroup[] | "all"> = {
  dev: "all",
  stg: "all",
  prod: "all",
}

/**
 * Throws when a name is not in `known`. Without it a mistyped group or
 * environment runs nothing (`QA_GROUPS`) or silently drops tests and pages
 * from stg and prod (`tags()`, `helpers/urls.json`), and the job still passes
 * with zero tests.
 */
export function assertKnown<T extends string>(
  names: string[],
  known: readonly T[],
  label: string
): asserts names is T[] {
  const unknown = names.filter(
    (name) => !(known as readonly string[]).includes(name)
  )
  if (unknown.length > 0) {
    throw new Error(
      `Unknown ${label}: ${unknown.join(", ")}. Known: ${known.join(", ")}.`
    )
  }
}

/** Tags that are not feature groups. `@no-prod` keeps a test off production (`grepInvert` in playwright.config.ts). */
const EXTRA_TAGS = ["no-prod"] as const

const TEST_TAGS = [...TEST_GROUPS, ...EXTRA_TAGS]

type TestTag = (typeof TEST_TAGS)[number]

/**
 * Playwright details that tag a top-level test or describe with `@`-prefixed
 * names. Throws while specs load, so a mistyped tag fails every run, filtered
 * or not, instead of silently dropping the test from stg, prod and `QA_GROUPS`
 * runs. The first name must be a group, because a test tagged only `@no-prod`
 * never matches a group selection either.
 */
export function tags(group: TestGroup, ...rest: TestTag[]): { tag: string[] } {
  assertKnown([group], TEST_GROUPS, "group as the first name in tags()")
  assertKnown(rest, TEST_TAGS, "tag in tags()")

  return { tag: [group, ...rest].map((name) => `@${name}`) }
}

/**
 * For a nested test that has to stay off production. Its describe already
 * carries the group, and `tags(group, "no-prod")` would repeat that tag.
 */
export const NO_PROD = { tag: ["@no-prod"] }

/** Hosts of a local run, which tests every group and every environment's pages. */
const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "[::1]",
  "host.docker.internal",
])

/**
 * The environment under test, read from the `BASE_URL` hostname: a `dev` or
 * `stg`/`staging` segment, else production. `undefined` for a local host and
 * a missing `BASE_URL`.
 */
export function resolveTestEnv(
  baseUrl = process.env.BASE_URL
): TestEnv | undefined {
  const host = baseUrl ? URL.parse(baseUrl)?.hostname : undefined
  if (!host || LOCAL_HOSTS.has(host)) return undefined

  if (/(^|[-.])dev([-.]|$)/.test(host)) return "dev"
  if (/(^|[-.])(stg|staging)([-.]|$)/.test(host)) return "stg"

  // Any other host counts as production, so a domain the segments miss
  // (`www.example.com`) never runs @no-prod tests.
  return "prod"
}

/**
 * Groups to run: `QA_GROUPS` when set, else what `ENV_GROUPS` lists for the
 * environment under test. `undefined` means every group, which is also the
 * default for a local host.
 */
export function selectedGroups(): TestGroup[] | undefined {
  const picked = (process.env.QA_GROUPS ?? "")
    .split(/[\s,;]+/)
    .filter((group) => group && group !== "auto")

  if (picked.length > 0) {
    assertKnown(picked, TEST_GROUPS, "group in QA_GROUPS")

    return picked
  }

  const env = resolveTestEnv()
  const groups = env ? ENV_GROUPS[env] : "all"

  return groups === "all" ? undefined : [...groups]
}

/** Playwright `grep` for the selected groups, or `undefined` to run everything. */
export function groupsGrep(): RegExp | undefined {
  const groups = selectedGroups()

  // The lookahead keeps `@auth` from also matching a longer tag such as `@authoring`.
  return groups && new RegExp(String.raw`@(${groups.join("|")})(?![\w-])`)
}
