/**
 * Load test — simulates visitors on the pages listed under "load" in
 * helpers/urls.json. Runs in k6, not Node: no npm packages, local imports need
 * the `.ts` extension.
 *
 * Target: BASE_URL from qa/tests/playwright/.env. Load: SETTINGS below.
 *
 * See apps/docs/docs/QA/playwright/load-testing.md.
 */
import { check } from "k6"
import exec from "k6/execution"
import http from "k6/http"
import type { Options, Scenario } from "k6/options"

import {
  assertKnown,
  ENV_GROUPS,
  TEST_ENVS,
  TEST_GROUPS,
  testEnvForHost,
  type TestEnv,
} from "../helpers/test-groups.ts"

// ─── Settings ────────────────────────────────────────────────────────────────
// Defaults for every run. Override any of them for one run from the command
// line, e.g. `LOAD_RPS=20 pnpm tests:k6:load:spike`.
const SETTINGS = {
  /** smoke | average | spike | breakpoint (see PROFILES below). Override: LOAD_PROFILE */
  profile: "smoke",
  /** Page views per second at normal traffic; spike goes to 5×. Override: LOAD_RPS */
  rps: 5,
  /** How long `average` holds the traffic. Override: LOAD_DURATION */
  duration: "5m",
  /** 95 % of responses must be faster than this (ms), or the run fails. Override: LOAD_P95_MS */
  p95Ms: 1500,
}
// ─────────────────────────────────────────────────────────────────────────────

const PROFILE = __ENV.LOAD_PROFILE || SETTINGS.profile
const RPS = Number(__ENV.LOAD_RPS || SETTINGS.rps)
const DURATION = __ENV.LOAD_DURATION || SETTINGS.duration
const P95_MS = Number(__ENV.LOAD_P95_MS || SETTINGS.p95Ms)
// k6 takes whole arrival rates only.
if (!Number.isSafeInteger(RPS) || RPS < 1) {
  throw new Error(`LOAD_RPS must be a whole number from 1, got "${RPS}"`)
}
if (!Number.isFinite(P95_MS) || P95_MS <= 0) {
  throw new Error(`LOAD_P95_MS must be a number above 0, got "${P95_MS}"`)
}

/**
 * KEY=value pairs from ../.env (k6 can't load it on its own). Follows dotenv,
 * which the Playwright suites read the same file with: quotes are removed, and
 * in an unquoted value `#` starts a comment.
 */
function readDotEnv(): Record<string, string> {
  let content: string
  try {
    content = open("../.env")
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
const BASE_URL = (__ENV.BASE_URL || DOT_ENV.BASE_URL || "").replace(/\/$/, "")
if (!BASE_URL) throw new Error("Set BASE_URL in qa/tests/playwright/.env")

/**
 * BASE_URL's hostname, the way `URL` reads it (k6 has no `URL`): without the
 * scheme, `user:password@` and port; an IPv6 host keeps its brackets.
 */
const HOST = BASE_URL.replace(/^[a-z][\w+.-]*:\/\//i, "")
  .split(/[/?#]/, 1)[0]
  .replace(/^.*@/, "")
  .replace(/:\d*$/, "")
  .toLowerCase()

/** The environment under test — the rule resolveTestEnv() uses for the other suites. */
const ENV = testEnvForHost(HOST)

type GroupUrls = string[] | Partial<Record<TestEnv, string[]>>

/** Throws unless `urls` is a list of paths, which the test appends to BASE_URL. */
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

/**
 * The "load" pages to visit, picked like every other suite does it
 * (helpers/flatten-urls.ts and selectedGroups() in helpers/test-groups.ts):
 * groups from QA_GROUPS, else what ENV_GROUPS lists for the environment, and
 * each group's pages for that environment — or everything for a local host.
 * A mistyped group or environment fails the run instead of testing nothing.
 */
function loadPaths(): string[] {
  const suite: Record<string, unknown> =
    JSON.parse(open("../helpers/urls.json")).load ?? {}
  const groups = Object.keys(suite)
  assertKnown(groups, TEST_GROUPS, 'group under "load" in helpers/urls.json')
  const urlsByGroup = new Map<string, GroupUrls>()
  for (const group of groups) {
    const urls = suite[group]
    if (Array.isArray(urls)) {
      assertPaths(urls, `load.${group}`)
    } else if (urls && typeof urls === "object") {
      const envs = Object.keys(urls)
      assertKnown(
        envs,
        TEST_ENVS,
        `environment in helpers/urls.json group "load.${group}"`
      )
      for (const env of envs) {
        assertPaths(
          (urls as Record<string, unknown>)[env],
          `load.${group}.${env}`
        )
      }
    } else {
      assertPaths(urls, `load.${group}`)
    }
    urlsByGroup.set(group, urls as GroupUrls)
  }

  const picked = (__ENV.QA_GROUPS || DOT_ENV.QA_GROUPS || "")
    .split(/[\s,;]+/)
    .filter((group) => group && group !== "auto")
  assertKnown(picked, TEST_GROUPS, "group in QA_GROUPS")
  const envGroups = ENV ? ENV_GROUPS[ENV] : "all"
  const selected: readonly string[] | undefined =
    picked.length > 0 ? picked : envGroups === "all" ? undefined : envGroups

  return [
    ...new Set(
      groups
        .filter((group) => !selected || selected.includes(group))
        .flatMap((group) => {
          const urls = urlsByGroup.get(group) ?? []
          if (Array.isArray(urls)) return urls

          return ENV ? (urls[ENV] ?? []) : Object.values(urls).flat()
        })
    ),
  ]
}

const PATHS = loadPaths()
if (PATHS.length === 0) {
  throw new Error(
    `No "load" pages for ${ENV ?? "a local run"}${__ENV.QA_GROUPS || DOT_ENV.QA_GROUPS ? ` and QA_GROUPS=${__ENV.QA_GROUPS || DOT_ENV.QA_GROUPS}` : ""} in helpers/urls.json`
  )
}

const VUS = {
  preAllocatedVUs: Math.max(5, RPS * 5),
  maxVUs: Math.max(50, RPS * 50),
}

// Visitors keep arriving at the set rate even when the site slows down
// (ramping-arrival-rate), like real traffic does. `startRate` is where the
// first stage starts from; without it k6 starts from 0.
const rate = (
  stages: { duration: string; target: number }[],
  startRate = 0
): Scenario => ({
  executor: "ramping-arrival-rate",
  timeUnit: "1s",
  startRate,
  ...VUS,
  stages,
})

/** Each profile's k6 scenarios, keyed by scenario name. */
const PROFILES: Record<string, Record<string, Scenario>> = {
  // 1 page view/s for a minute: checks the script and the target work.
  smoke: {
    smoke: {
      executor: "constant-arrival-rate",
      rate: 1,
      timeUnit: "1s",
      duration: "1m",
      preAllocatedVUs: 1,
      maxVUs: 5,
    },
  },
  // Normal traffic: ramp up, hold, ramp down.
  average: {
    average: rate([
      { duration: "1m", target: RPS },
      { duration: DURATION, target: RPS },
      { duration: "30s", target: 0 },
    ]),
  },
  // Campaign launch: sudden 5× surge, then back to normal.
  spike: {
    spike: rate(
      [
        { duration: "1m", target: RPS },
        { duration: "15s", target: RPS * 5 },
        { duration: "3m", target: RPS * 5 },
        { duration: "15s", target: RPS },
        { duration: "1m", target: RPS },
      ],
      RPS
    ),
  },
  // Push until it breaks, then back to normal: where is the limit, and does the
  // system recover on its own? Pass / fail is judged on `recovery` only, its
  // own scenario so that its dropped visits can be counted apart from the
  // overload's.
  breakpoint: {
    breakpoint: rate(
      [
        { duration: "1m", target: RPS }, // baseline
        { duration: "10m", target: RPS * 10 }, // keep pushing; it breaks somewhere here
        { duration: "15s", target: RPS }, // drop back to normal traffic
        { duration: "1m", target: RPS }, // let it settle
      ],
      RPS
    ),
    recovery: {
      executor: "constant-arrival-rate",
      rate: RPS,
      timeUnit: "1s",
      duration: "2m",
      startTime: "12m15s", // when `breakpoint` ends: 1m + 10m + 15s + 1m
      ...VUS,
    },
  },
}

if (!Object.hasOwn(PROFILES, PROFILE)) {
  throw new Error(
    `LOAD_PROFILE must be one of: ${Object.keys(PROFILES).join(", ")}`
  )
}

// Production guard. A host counts as non-production when it is local or has a
// dev / stg / staging segment — the rule resolveTestEnv() uses for the other
// suites. Production needs LOAD_ALLOW_PROD=true on the command line for that
// one run; deliberately not a SETTINGS value, so it never stays on. Redirects
// are not followed (`maxRedirects` below), so no page can send the load on to
// another host.
const IS_NON_PROD = ENV !== "prod"
const ALLOW_PROD = __ENV.LOAD_ALLOW_PROD === "true"
if (!IS_NON_PROD && !ALLOW_PROD) {
  // Readable line first; the thrown error below arrives wrapped in a stack trace.
  console.error(
    `⛔ ${HOST} looks like PRODUCTION. Point BASE_URL in qa/tests/playwright/.env at a non-production environment (a local host, or a dev / stg / staging subdomain), or — agreed with the client and the hosting provider — run once with LOAD_ALLOW_PROD=true.`
  )
  throw new Error(
    `Refusing to load-test ${HOST}: it looks like production and LOAD_ALLOW_PROD is not "true".`
  )
}
if (!IS_NON_PROD) {
  console.warn(
    `⚠️  Load-testing PRODUCTION (${HOST}) with the "${PROFILE}" profile — LOAD_ALLOW_PROD=true.`
  )
}

/** Breaking any of these fails the run. */
const thresholds = (scope = ""): Options["thresholds"] => ({
  [`http_req_failed${scope}`]: ["rate<0.01"],
  [`http_req_duration${scope}`]: [`p(95)<${P95_MS}`],
  [`checks${scope}`]: ["rate>0.99"],
  // Every planned visit must actually be sent. When responses are so slow that
  // k6 runs out of virtual users, visits are dropped — the site is
  // overwhelmed, even if few requests "fail".
  [`dropped_iterations${scope}`]: ["count==0"],
})

export const options: Options = {
  scenarios: PROFILES[PROFILE],
  // A redirect answers 3xx and fails the `status 200` check instead of being
  // followed: list the page it lands on, and the load never leaves BASE_URL.
  maxRedirects: 0,
  // `breakpoint` is meant to break the system; what counts is that it is back
  // to normal once traffic is.
  thresholds:
    PROFILE === "breakpoint" ? thresholds("{scenario:recovery}") : thresholds(),
}

export default function () {
  // Round-robin, so every page gets an equal share.
  const path = PATHS[exec.scenario.iterationInTest % PATHS.length]
  const res = http.get(`${BASE_URL}${path}`, {
    // Ask for compression like every browser does. Without it k6 downloads
    // pages uncompressed (~6× bigger) and the run measures bandwidth, not the
    // site. k6 decompresses the response itself.
    headers: { "Accept-Encoding": "gzip, br" },
    tags: { name: path },
  })

  check(res, {
    "status 200": (r) => r.status === 200,
  })
}
