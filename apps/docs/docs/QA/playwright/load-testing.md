---
sidebar_position: 4
---

# Load Testing (k6)

Simulates visitors to see how the site behaves under traffic. It uses [Grafana k6](https://grafana.com/docs/k6/latest/), and the whole test is one TypeScript file: `qa/tests/playwright/load/load-test.ts`.

This is an on-demand tool, not a routine check. Reach for it when you need one of two answers:

- **"Does it hold?"** Prove the system copes with the expected traffic, typically before a release with a traffic peak, such as a launch backed by a campaign. Profiles: `average`, `spike`.
- **"Where does it break, and does it come back?"** Find the limit and check the system recovers on its own, or chase a performance problem that only shows under load. Profile: `breakpoint`.

## Run

```bash
brew install k6                         # once (other OS: grafana.com/docs/k6/latest/set-up/install-k6/)
pnpm tests:k6:load:smoke                # 1 visit/s for 1 minute: does the test work?
pnpm tests:k6:load:average              # normal traffic
pnpm tests:k6:load:spike                # campaign launch, 5× surge
pnpm tests:k6:load:breakpoint           # push until it breaks, then check recovery
LOAD_RPS=20 pnpm tests:k6:load:spike    # override a setting for one run
```

The test runs from your machine, but the load goes to `BASE_URL` from `qa/tests/playwright/.env`, the same variable the other suites use. It visits the pages listed under `load` in `helpers/urls.json`, taking them in turn. Pages are picked the same way as in the other suites ([test groups](./index.md#test-groups)): the groups in `QA_GROUPS`, else those `ENV_GROUPS` enables for the environment read from `BASE_URL`, with each group's pages for that environment; a local `BASE_URL` gets every group and environment.

Settings live in the `SETTINGS` object at the top of `load/load-test.ts`. Change the defaults there, or override them for one run on the command line:

| Variable        | Default | Meaning                                                                |
| --------------- | ------- | ---------------------------------------------------------------------- |
| `LOAD_PROFILE`  | `smoke` | `smoke`, `average`, `spike` or `breakpoint` (the scripts above set it) |
| `LOAD_RPS`      | `5`     | Page views per second at normal traffic                                |
| `LOAD_DURATION` | `5m`    | How long `average` holds the traffic                                   |
| `LOAD_P95_MS`   | `1500`  | 95 % of responses must be faster than this                             |

Pick `LOAD_RPS` from analytics (expected peak hour ÷ 3600), not by guessing. For example, 18,000 page views in the busiest hour is 5 per second.

## Profiles

Visitors keep arriving at the set rate even when the site slows down, the way real traffic behaves.

| Profile      | Shape                                                                         | Passes when                                       |
| ------------ | ----------------------------------------------------------------------------- | ------------------------------------------------- |
| `smoke`      | 1 visit/s for 1 min                                                           | All the thresholds below hold                     |
| `average`    | Ramp up to `LOAD_RPS`, hold for `LOAD_DURATION`, ramp down                    | All the thresholds below hold                     |
| `spike`      | 1 min at `LOAD_RPS`, jump to 5× within 15 s, hold 3 min, back to normal       | All the thresholds below hold                     |
| `breakpoint` | 1 min at `LOAD_RPS`, climb to 10× over 10 min, back to normal, 3 min recovery | The last 2 minutes of recovery are back to normal |

`breakpoint` is meant to break the system, so errors during the climb are expected and don't fail the run. Only recovery is judged: once traffic is back to normal, p95 must be under `LOAD_P95_MS` and errors under 1 %. Where it broke is in the report (see below).

## How to read the result

### Pass or fail

`smoke`, `average` and `spike` **fail** when any of these is crossed. The terminal shows `✓` or `✗` next to each under **THRESHOLDS**:

| Threshold            | Limit         | Crossed means                                                                                                                                  |
| -------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `http_req_duration`  | p95 < 1500 ms | The site is too slow: 1 in 20 visitors waited longer than the limit                                                                            |
| `http_req_failed`    | < 1 %         | Requests failed: 5xx errors, timeouts or refused connections                                                                                   |
| `checks`             | > 99 %        | Pages didn't answer `200`                                                                                                                      |
| `dropped_iterations` | 0             | **Visits that were never sent.** Responses were so slow that k6 ran out of virtual users: the site is overwhelmed, even if few requests failed |

### Good signs

- p95 stays roughly flat while traffic grows.
- `dropped_iterations` is 0.
- `http_req_failed` is close to 0 %.
- After `spike` or `breakpoint`, response times return to what they were before the surge.

### Bad signs and what they mean

| What you see                                     | What it usually means                                                                  |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| p95 climbs while traffic is flat                 | Something is queuing up: CPU, database connections, a slow external call               |
| `dropped_iterations` > 0                         | The site can't keep up with the arrival rate, the clearest overload signal             |
| Errors at about 30 s (Heroku) or 60 s (k6 limit) | Timeouts: requests hang instead of failing fast                                        |
| `http_req_failed` rises at a certain rate        | That rate is the current limit (read it off the graph)                                 |
| Still slow after traffic dropped                 | No recovery: a stuck queue, leaked connections, a crashed instance that didn't restart |

### The HTML report

Every run saves `qa/tests/playwright/load/report.html` (gitignored). Open it in a browser. The report needs a run longer than ~30 s.

- **Overview → HTTP Performance overview** is the graph that matters: request rate, response time and failures over time. Find the moment response time bends upward and read the request rate at that moment. That is the limit.
- **Overview → VUs** shows how many concurrent virtual users k6 needed. When it climbs steeply, responses are slowing down.
- **Timings → Request Waiting** is time to first byte, the server's "thinking time". It usually grows first under load.
- **Summary** has every number from the end of the run. Read p95 rather than the average, which hides slow responses, or the max, which is often one outlier.

### What to do with a bad result

k6 only sees the site from the outside. Pair the time of the slowdown in the report with what the server saw at that moment:

- **Hosting metrics and logs:** CPU, memory, instance count. On Heroku, `heroku logs --tail` and the H12 (timeout), H13 or R14 (memory) codes.
- **Application:** slow database queries, slow Strapi responses, calls to external services.
- **Compare environments:** a result is only as good as the environment's resemblance to production. A smaller STG gives worse numbers than production would.

## Which environment

A load test only says something about production when the environment matches it: same instance size and count, same database tier, same CDN. Where STG matches production, test STG. Where it doesn't, which is common, testing production before a release gives the real answer.

The test refuses to start unless `BASE_URL` is `localhost` or its hostname has a `dev`, `stg` or `staging` segment (`stg.example.com`, `example-staging.herokuapp.com`). To run against production, agree on it with the client and the hosting provider first, then unlock it for that one run:

```bash
LOAD_ALLOW_PROD=true pnpm tests:k6:load:smoke
```

`LOAD_ALLOW_PROD` is deliberately not in `SETTINGS` or `.env`, so it never stays switched on.

## Before a heavy run

- Agree on the time window with the client and the hosting provider. A WAF or rate limiter (Cloudflare, Azure Front Door, Vercel Firewall) can block the test, and Vercel and Netlify bill per request.
- Have someone watch the app's own metrics during the run (see above).
- Most traffic is served from the CDN or the Next.js cache. A good result therefore tests the cache, which is realistic for a launch.
- Your connection is the ceiling: a laptop handles tens of page views per second. For hundreds, run it from a stronger machine.
