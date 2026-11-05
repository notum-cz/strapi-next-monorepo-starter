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

import { flattenUrls } from "../helpers/flatten-urls.ts"

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

/** KEY=value pairs from ../.env (k6 can't load it on its own). */
function readDotEnv(): Record<string, string> {
  let content: string
  try {
    content = open("../.env")
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

const BASE_URL = (__ENV.BASE_URL || readDotEnv().BASE_URL || "").replace(
  /\/$/,
  ""
)
if (!BASE_URL) throw new Error("Set BASE_URL in qa/tests/playwright/.env")

const PATHS = flattenUrls(JSON.parse(open("../helpers/urls.json")).load ?? [])
if (PATHS.length === 0) throw new Error('No pages under "load" in urls.json')

// Visitors keep arriving at the set rate even when the site slows down
// (ramping-arrival-rate), like real traffic does.
const rate = (stages: { duration: string; target: number }[]): Scenario => ({
  executor: "ramping-arrival-rate",
  timeUnit: "1s",
  preAllocatedVUs: Math.max(5, RPS * 5),
  maxVUs: Math.max(50, RPS * 50),
  stages,
})

const PROFILES: Record<string, Scenario> = {
  // 1 page view/s for a minute: checks the script and the target work.
  smoke: {
    executor: "constant-arrival-rate",
    rate: 1,
    timeUnit: "1s",
    duration: "1m",
    preAllocatedVUs: 1,
    maxVUs: 5,
  },
  // Normal traffic: ramp up, hold, ramp down.
  average: rate([
    { duration: "1m", target: RPS },
    { duration: DURATION, target: RPS },
    { duration: "30s", target: 0 },
  ]),
  // Campaign launch: sudden 5× surge, then back to normal.
  spike: rate([
    { duration: "1m", target: RPS },
    { duration: "15s", target: RPS * 5 },
    { duration: "3m", target: RPS * 5 },
    { duration: "15s", target: RPS },
    { duration: "1m", target: RPS },
  ]),
  // Push until it breaks, then back to normal: where is the limit, and does the
  // system recover on its own? Pass / fail is judged on recovery only.
  breakpoint: rate([
    { duration: "1m", target: RPS }, // baseline
    { duration: "10m", target: RPS * 10 }, // keep pushing; it breaks somewhere here
    { duration: "15s", target: RPS }, // drop back to normal traffic
    { duration: "3m", target: RPS }, // recovery
  ]),
}

if (!Object.hasOwn(PROFILES, PROFILE)) {
  throw new Error(
    `LOAD_PROFILE must be one of: ${Object.keys(PROFILES).join(", ")}`
  )
}

// Production guard. A host counts as non-production when it is local or has a
// dev / stg / staging segment — the same rule as resolveTestEnv() in the
// test-groups work. Production needs LOAD_ALLOW_PROD=true on the command line
// for that one run; deliberately not a SETTINGS value, so it never stays on.
const HOST = BASE_URL.replace(/^\w+:\/\//, "")
  .split(/[/:?#]/, 1)[0]
  .toLowerCase()
const IS_LOCAL = ["localhost", "127.0.0.1", "host.docker.internal"].includes(
  HOST
)
const IS_NON_PROD = IS_LOCAL || /(^|[-.])(dev|stg|staging)([-.]|$)/.test(HOST)
const ALLOW_PROD = __ENV.LOAD_ALLOW_PROD === "true"
if (!IS_NON_PROD && !ALLOW_PROD) {
  // Readable line first; the thrown error below arrives wrapped in a stack trace.
  console.error(
    `⛔ ${HOST} looks like PRODUCTION. Point BASE_URL in qa/tests/playwright/.env at a non-production environment (localhost, dev, stg, staging), or — agreed with the client and the hosting provider — run once with LOAD_ALLOW_PROD=true.`
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

/**
 * Breakpoint recovery is judged on its last 2 minutes: the recovery stage
 * starts at 1m + 10m + 15s, plus 1 minute to settle.
 */
const RECOVERY_FROM_MS = (60 + 600 + 15 + 60) * 1000

export const options: Options = {
  scenarios: { [PROFILE]: PROFILES[PROFILE] },
  // Breaking any of these fails the run.
  thresholds:
    PROFILE === "breakpoint"
      ? {
          // The system is meant to break under load; what counts is that it
          // is back to normal once traffic is.
          "http_req_duration{phase:recovery}": [`p(95)<${P95_MS}`],
          "http_req_failed{phase:recovery}": ["rate<0.01"],
        }
      : {
          http_req_failed: ["rate<0.01"],
          http_req_duration: [`p(95)<${P95_MS}`],
          checks: ["rate>0.99"],
          // Every planned visit must actually be sent. When responses are so
          // slow that k6 runs out of virtual users, visits are dropped — the
          // site is overwhelmed, even if few requests "fail".
          dropped_iterations: ["count==0"],
        },
}

export default function () {
  // Round-robin, so every page gets an equal share.
  const path = PATHS[exec.scenario.iterationInTest % PATHS.length]
  const tags: Record<string, string> = { name: path }
  if (PROFILE === "breakpoint") {
    tags.phase =
      exec.instance.currentTestRunDuration >= RECOVERY_FROM_MS
        ? "recovery"
        : "load"
  }
  const res = http.get(`${BASE_URL}${path}`, {
    // Ask for compression like every browser does. Without it k6 downloads
    // pages uncompressed (~6× bigger) and the run measures bandwidth, not the
    // site. k6 decompresses the response itself.
    headers: { "Accept-Encoding": "gzip, br" },
    tags,
  })

  check(res, {
    "status 200": (r) => r.status === 200,
  })
}
