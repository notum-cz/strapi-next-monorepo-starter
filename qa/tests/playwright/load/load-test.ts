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
  baseUrl,
  hostOf,
  pagesFor,
  pageUrl,
  testEnv,
} from "../helpers/k6/target.ts"

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

const BASE_URL = baseUrl()
const HOST = hostOf(BASE_URL)
const ENV = testEnv(BASE_URL)
const PATHS = pagesFor("load", BASE_URL)

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
  // Only the status is read; k6 still downloads every page and times it.
  discardResponseBodies: true,
  // `breakpoint` is meant to break the system; what counts is that it is back
  // to normal once traffic is.
  thresholds:
    PROFILE === "breakpoint" ? thresholds("{scenario:recovery}") : thresholds(),
}

export default function () {
  // Round-robin, so every page gets an equal share.
  const path = PATHS[exec.scenario.iterationInTest % PATHS.length]
  const res = http.get(pageUrl(BASE_URL, path), {
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
