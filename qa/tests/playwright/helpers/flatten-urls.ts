import {
  assertKnown,
  resolveTestEnv,
  TEST_ENVS,
  TEST_GROUPS,
  type TestEnv,
  type TestGroup,
} from "./test-groups"

/** A group's paths: one list for every environment, or one per environment when the content differs. */
type GroupUrls = string[] | Partial<Record<TestEnv, string[]>>

type UrlSuite = Partial<Record<TestGroup, GroupUrls>>

/**
 * Throws when `BASE_URL` is missing or not a full URL. Kept out of
 * `playwright.config.ts`, which has to load without it (`--list`, the VS Code
 * extension).
 */
function assertBaseUrl(baseUrl = process.env.BASE_URL): void {
  if (!baseUrl) {
    throw new Error(
      "BASE_URL is not set. Please fill BASE_URL in qa/tests/playwright/.env (see .env.example)."
    )
  }

  if (!URL.parse(baseUrl)) {
    throw new Error(
      `BASE_URL "${baseUrl}" is not a valid URL. Please fill BASE_URL in qa/tests/playwright/.env with the scheme, e.g. https://staging.example.com.`
    )
  }
}

/**
 * Every path of a suite with the group it belongs to, so each generated test
 * can carry its tag. A group split per environment contributes the list for
 * the environment under test, or every list merged for a local host.
 */
export function urlsByGroup(
  suite: UrlSuite
): { group: TestGroup; path: string }[] {
  // tsc misses it: a JSON import skips excess property checks.
  const groups = Object.keys(suite)
  assertKnown(groups, TEST_GROUPS, "group in helpers/urls.json")
  for (const group of groups) {
    const urls = suite[group] ?? []
    if (!Array.isArray(urls)) {
      assertKnown(
        Object.keys(urls),
        TEST_ENVS,
        `environment in helpers/urls.json group "${group}"`
      )
    }
  }

  // After the data checks, so a urls.json typo is reported even without a `.env`.
  assertBaseUrl()
  const env = resolveTestEnv()

  return groups.flatMap((group) =>
    Array.from(new Set(pathsForEnv(suite[group] ?? [], env)), (path) => ({
      group,
      path,
    }))
  )
}

/** A group's paths for `env`, or every environment's paths when `env` is unknown. */
function pathsForEnv(urls: GroupUrls, env: TestEnv | undefined): string[] {
  if (Array.isArray(urls)) return urls
  if (env) return urls[env] ?? []

  return Object.values(urls).flat()
}
