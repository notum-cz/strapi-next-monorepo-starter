---
sidebar_position: 5
---

# Core Web Vitals (k6)

Measures how fast pages feel to a visitor: [Core Web Vitals](https://web.dev/articles/vitals), the same metrics Google uses for search ranking. It uses the [k6 browser module](https://grafana.com/docs/k6/latest/using-k6-browser/), so it shares a tool with the [load tests](./load-testing.md). The whole test is one TypeScript file: `qa/tests/playwright/perfo/web-vitals.ts`.

## Run

```bash
brew install k6                            # once; also needs Google Chrome or Chromium installed
pnpm tests:k6:vitals                       # every "perfo" page, on a phone and on a desktop
VITALS_MODES=mobile pnpm tests:k6:vitals   # phone only (or VITALS_MODES=desktop)
```

The test opens each page listed under `perfo` in `helpers/urls.json` on `BASE_URL` (from `qa/tests/playwright/.env`) in a real Chrome. Every visit starts with an empty cache, like a first visit.

Every page is measured on two devices, one after the other, using the same presets as Lighthouse so the numbers compare with Lighthouse and PageSpeed Insights:

- **📱 mobile:** a mid-range phone on slow 4G: 4× slower CPU, 562.5 ms latency, about 1.4 Mbit/s download. Without throttling, a laptop on fast Wi-Fi shows far better numbers than real phones get.
- **🖥️ desktop:** a desktop-sized window with no throttling.

The devices run one after the other, not side by side, because a second Chrome would compete for CPU and skew the throttled phone numbers.

Settings live in the `SETTINGS` object at the top of `perfo/web-vitals.ts`:

| Variable       | Default          | Meaning                                                    |
| -------------- | ---------------- | ---------------------------------------------------------- |
| `VITALS_RUNS`  | `5`              | Visits per page. Each vital is judged on the median visit. |
| `VITALS_MODES` | `mobile,desktop` | Devices to test: `mobile`, `desktop` or both.              |

## Pass or fail

Each page is judged on its own and per device, so one slow page or device can't hide behind the rest. Every vital is rated on the median visit, so one unusually slow or fast visit can't skew it, using Google's bands:

| Metric | What it measures                                      | 🟢 Good | 🟠 Needs improvement | 🔴 Poor |
| ------ | ----------------------------------------------------- | ------- | -------------------- | ------- |
| LCP    | Largest Contentful Paint: when the main content shows | ≤ 2.5 s | ≤ 4 s                | > 4 s   |
| CLS    | Cumulative Layout Shift: how much the layout jumps    | ≤ 0.1   | ≤ 0.25               | > 0.25  |
| FCP    | First Contentful Paint: when anything first shows     | ≤ 1.8 s | ≤ 3 s                | > 3 s   |
| TTFB   | Time to First Byte: when the server starts answering  | ≤ 0.8 s | ≤ 1.8 s              | > 1.8 s |

The run **passes** only when every page is 🟢 on every vital on every device and returns `200`. 🟠 and 🔴 both fail it; the colour tells you how far off it is.

At the end of the run the terminal prints one row per page:

```text
page   device    LCP        CLS       FCP        TTFB
/      mobile    🟠 3.3 s   🟢 0.00   🔴 3.3 s   🟠 1.3 s
/      desktop   🟢 1.1 s   🟢 0.00   🟢 1.1 s   🟠 879 ms
```

A graph report is saved to `qa/tests/playwright/perfo/report.html` (gitignored, see its **Timings → Browser** section). In the HTML report CLS shows as `0.01/s`; that is a display quirk of the report, and CLS has no unit.

## Trend history and investigations

Every run appends one row per page and device to `qa/tests/playwright/perfo/web-vitals-history.md`, so you can follow how each page develops. Old rows are never removed. When a run isn't all green, it also writes an **investigation** to `qa/tests/playwright/perfo/investigations/<date>_<host>.md`, and the history row links to it:

```md
## /

| Date (UTC)       | Target              | Mode      | LCP      | CLS     | FCP      | TTFB      | Result | Investigation                                                     |
| ---------------- | ------------------- | --------- | -------- | ------- | -------- | --------- | ------ | ----------------------------------------------------------------- |
| 2026-11-10 13:59 | staging.example.com | 📱 mobile | 🟠 3.3 s | 🟢 0.00 | 🔴 3.3 s | 🟢 630 ms | ❌     | [🔍 why](investigations/2026-11-10T13-59Z_staging.example.com.md) |
| 2026-11-12 09:30 | staging.example.com | 📱 mobile | 🟢 2.1 s | 🟢 0.00 | 🟢 1.4 s | 🟢 701 ms | ✅     | –                                                                 |
```

Investigations are kept too, so every past failure stays explained.

- **Where it lives:** on its own branch, `qa/web-vitals-history`, which holds nothing but the history and the investigations. Open it on GitHub by switching to that branch. It never lands in `dev`, so it adds no noise to PRs and causes no merge conflicts. On code branches these files are gitignored.
- **Who writes it:** every run. Locally the files are your own log: gitignored and never pushed, so local rows (your hardware, your network, your `BASE_URL`) don't mix with the shared CI trend. Skip recording for one run with `VITALS_HISTORY=false pnpm tests:k6:vitals`; the clues are then printed to the terminal instead.
- **How:** the `web_vitals` job (GitHub Actions and Azure DevOps) fetches the history from the branch, runs the test, which appends rows and writes an investigation, and pushes both back. Failing runs are recorded too.
- **Setup:**
  - **GitHub:** works as is. The job asks for `contents: write`, and runs queue so two at once can't overwrite each other's row.
  - **Azure DevOps:** the project's build service needs **Contribute** and **Create branch** on the repository (Project settings → Repositories → Security). Azure doesn't queue the runs: if two run at once, the second push fails with a non-fast-forward error and that run can be re-run.

Compare rows with the same **Target** and **Mode** only. A different site, environment or throttling profile gives different numbers.

**INP** (Interaction to Next Paint) is not measured. It needs a real click or keypress, and the test only loads pages.

## Reading a bad result

| Bad metric | Usually means                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| TTFB       | The server is slow to answer: uncached rendering, slow Strapi or database, distance to the server    |
| FCP        | Render-blocking CSS or JavaScript, or web fonts that hold back the first paint                       |
| LCP        | A large hero image (size, format, missing `priority`/preload) or content rendered late on the client |
| CLS        | Images or embeds without dimensions, late-loading fonts, banners pushing content down                |

Because of the throttling, TTFB always includes the 562.5 ms emulated latency. The desktop row shows the server's own response time.

### What an investigation contains

An investigation is written for a person or a coding agent picking up the fix. For every page and device that isn't fully 🟢:

- **Not green:** the vitals off target, with Google's limit next to each.
- **Findings** from Chrome's Performance APIs during the visits (the median visit for numbers, the most common value for text):
  - the LCP element and, for an image, its source, size, intrinsic and rendered dimensions, when it was requested, `loading`, `fetchpriority`, whether it was preloaded, whether it's a CSS background, and whether it **comes from the CMS** (Strapi uploads),
  - render-blocking files and which of them are third parties,
  - the TTFB breakdown (redirects, DNS, connecting, waiting for the server),
  - layout-shift sources and images without width/height,
  - page weight by type, the largest files, images downloaded at more than twice their displayed size, third parties and main-thread blocking (Total Blocking Time).
- **Recommendations**, each tagged by where the fix lives:
  - **[Content · Strapi]**: fixed in the CMS, not in code. For example, the LCP image is a heavy upload: replace it in the Media Library with a compressed, smaller version.
  - **[Code]**: fixed in `apps/ui`. For example, the LCP image is a CSS background or lazy-loaded, a third-party script blocks rendering, or the page ships too many fonts. These point to the files involved, such as `StrapiBasicImage.tsx`, `ImgproxyImage.tsx` or `lib/fonts.ts`.
  - **[Infra]**: hosting, caching and redirects.
- **For a coding agent:** the command that reproduces the run, where each kind of fix usually lives in the repository, and when the work is done.

The findings point to where to look; they are not a full audit. For the complete list of opportunities, run Lighthouse in Chrome DevTools or [PageSpeed Insights](https://pagespeed.web.dev/) on that page. Sizes of third-party files can show as 0 when their server doesn't allow timing access.

The clues reach the summary as passing checks named `ⓘ …` (k6 passes nothing else with text to the summary), so they also appear in the HTML report's checks. They never fail a run.

## What this is not

- **Not field data.** These are lab numbers from one machine and one network profile. What real visitors experience is in the Chrome UX Report, PageSpeed Insights' field data, or your analytics.
- **Not under load.** It visits pages one at a time. How the site holds traffic is what [load testing](./load-testing.md) covers.
- **No overall score.** Unlike Lighthouse, there is no 0–100 score and no "Best Practices" audit. Accessibility and SEO are covered by the [axe and SEO suites](./index.md).

## CI

The QA workflow (GitHub Actions and Azure DevOps) has a **Core Web Vitals (k6)** checkbox. It installs k6, runs `pnpm tests:k6:vitals` against `base_url`, and uploads `report.html` as the `web-vitals-report` artifact on every run, pass or fail.
