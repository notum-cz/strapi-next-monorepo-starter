import { test as base, expect } from "@playwright/test"

import {
  isDisallowAll,
  lintRobots,
  parseRobots,
  quoteLine,
  type RobotsFile,
} from "../helpers/robots"
import {
  checkSitemapPage,
  countOccurrences,
  isAbsolute,
  isLoaded,
  isOn,
  loadChildSitemaps,
  loadSitemap,
  pageLocs,
  readProblems,
  requestTarget,
  SITEMAP_MAX_URLS,
  SITEMAP_ROOTS,
  type LoadedSitemap,
  type SitemapFile,
} from "../helpers/sitemap"
import { resolveTestEnv, tags } from "../helpers/test-groups"

// `undefined` on a local host: only the structure is checked there, because
// the app's own environment (APP_ENV) can be anything.
const ENV = resolveTestEnv()

// Dev and staging may have no sitemap at all (404), which is as good as an
// empty one: search engines find nothing to index there.
const SITEMAP_MAY_BE_MISSING = ENV === "dev" || ENV === "stg"

// Pages opened from each sitemap file (each part of an index) to check they load.
const PAGE_SAMPLE_SIZE = 3

// Longer lists are cut so one broken generator doesn't flood the report.
const MAX_LISTED = 10

/**
 * A failure message for people who don't read test code: what is wrong, the
 * offending items, how to fix it, and the URL that was checked.
 */
function explain(
  title: string,
  fix: string,
  url: string,
  items: string[] = []
) {
  const listed = items.slice(0, MAX_LISTED).map((item) => `  • ${item}`)
  if (items.length > MAX_LISTED)
    listed.push(`  … and ${items.length - MAX_LISTED} more`)

  return [
    title,
    ...(listed.length > 0 ? ["", ...listed] : []),
    "",
    `How to fix: ${fix}`,
    `Checked URL: ${url}`,
    "",
  ].join("\n")
}

function expectNoProblems(
  problems: string[],
  title: string,
  fix: string,
  url: string
) {
  expect(problems.length, explain(title, fix, url, problems)).toBe(0)
}

function expectLoaded(
  ok: boolean,
  path: string,
  reason: string | null,
  url: string
) {
  expect(
    ok,
    explain(
      `${path} ${reason}`,
      `make sure the site serves ${path} and that BASE_URL points to the right site.`,
      url
    )
  ).toBe(true)
}

const warn = (description: string) => {
  test.info().annotations.push({ type: "warning", description })
}

/** Prefixes a problem with its file when more than one sitemap is checked. */
const inFile = (file: SitemapFile, count: number, text: string) =>
  count > 1 ? `${file.url}: ${text}` : text

type Robots = RobotsFile & { url: string; contentType: string }

type Sitemaps = {
  root: LoadedSitemap
  /** The files a `<sitemapindex>` lists; empty for a single `<urlset>`. */
  children: SitemapFile[]
  /** Every file that loaded and is valid XML, the root first. */
  readable: LoadedSitemap[]
}

const test = base.extend<{
  site: { baseURL: string; origin: string }
  robots: Robots
  /** `/sitemap.xml`, or `null` when it is missing (404) on dev or staging. */
  rootSitemap: LoadedSitemap | null
  /** `/sitemap.xml` and its children; skips the test when there is no sitemap. */
  sitemaps: Sitemaps
}>({
  site: async ({ baseURL }, provide) => {
    expect(
      baseURL,
      "BASE_URL is not set. Set it to the site you want to test."
    ).toBeTruthy()
    await provide({ baseURL: baseURL!, origin: new URL(baseURL!).origin })
  },

  robots: async ({ request, site }, provide) => {
    const url = new URL("/robots.txt", site.origin).href
    const response = await request.get(requestTarget(url, site.baseURL))
    expectLoaded(
      response.ok(),
      "/robots.txt",
      `could not be loaded (HTTP ${response.status()}).`,
      url
    )

    await provide({
      ...parseRobots(await response.text()),
      url,
      contentType: response.headers()["content-type"] ?? "(none)",
    })
  },

  rootSitemap: async ({ request, page, site }, provide) => {
    const url = new URL("/sitemap.xml", site.origin).href
    const file = await loadSitemap(request, page, site.baseURL, url)

    if (SITEMAP_MAY_BE_MISSING && file.status === 404) {
      await provide(null)

      return
    }
    expectLoaded(isLoaded(file), "/sitemap.xml", file.loadError, url)
    await provide(file as LoadedSitemap)
  },

  sitemaps: async ({ request, page, site, rootSitemap }, provide, testInfo) => {
    testInfo.skip(
      rootSitemap === null,
      `No sitemap on ${ENV} (404), which is fine outside production; nothing to check.`
    )
    const root = rootSitemap!
    const children = await loadChildSitemaps(request, page, site.baseURL, root)
    const readable = [root, ...children.filter(isLoaded)].filter(
      (file) => !file.doc.parseError
    )

    await provide({ root, children, readable })
  },
})

// No retries: the checks are plain requests, so a retry would only hide a
// flaky robots.txt or sitemap (overrides the seo project's `retries: 1`).
test.describe.configure({ mode: "parallel", retries: 0 })

test.describe("robots.txt", tags("crawling"), () => {
  test("should respond with plain text", async ({ robots }) => {
    expect(
      robots.contentType,
      explain(
        `robots.txt is served as "${robots.contentType}" instead of plain text.`,
        'serve robots.txt with the "Content-Type: text/plain" header.',
        robots.url
      )
    ).toContain("text/plain")
  })

  test("should contain only valid directives", async ({ robots }) => {
    const { problems, unknown } = lintRobots(robots.lines)

    if (unknown.length > 0) {
      warn(
        `robots.txt has directives this test does not check (crawlers that don't know them ignore them): ${unknown.join("; ")}`
      )
    }
    expectNoProblems(
      problems,
      `robots.txt has ${problems.length} problem(s):`,
      "correct the lines listed above in the robots.txt configuration.",
      robots.url
    )
  })

  test("should allow crawling and point to the sitemap on production", async ({
    robots,
    site,
  }) => {
    test.skip(ENV !== "prod", "Crawling is allowed only on production")

    expectNoProblems(
      (robots.rulesByAgent.get("*") ?? []).filter(isDisallowAll).map(quoteLine),
      "robots.txt blocks all search engines on production, so the site will drop out of search results.",
      'remove "Disallow: /" from the "User-agent: *" group. Check the robots settings in Strapi and that APP_ENV is "production" and Basic Auth is off.',
      robots.url
    )

    const expected = new URL("/sitemap.xml", site.origin).href
    expect(
      robots.sitemaps,
      explain(
        "robots.txt does not tell search engines where the sitemap is.",
        "check that APP_PUBLIC_URL is set to the public address of the site.",
        robots.url,
        [
          `Expected: Sitemap: ${expected}`,
          `Found: ${robots.sitemaps.join(", ") || "no Sitemap line"}`,
        ]
      )
    ).toContain(expected)
  })

  test("every sitemap listed in robots.txt should load", async ({
    robots,
    site,
    request,
    page,
  }) => {
    // Relative Sitemap lines are reported by "should contain only valid
    // directives". A sitemap on another host is allowed (cross-submission),
    // but the test only requests the tested origin.
    const absolute = robots.sitemaps.filter(isAbsolute)
    const listed = absolute.filter((url) => isOn(url, site.origin))
    const elsewhere = absolute.filter((url) => !isOn(url, site.origin))

    if (elsewhere.length > 0) {
      warn(
        `robots.txt lists sitemaps on another origin, which this test does not check: ${elsewhere.join(", ")}`
      )
    }
    test.skip(
      listed.length === 0,
      `robots.txt lists no sitemap on ${site.origin}`
    )

    const problems: string[] = []
    for (const url of listed) {
      const file = await loadSitemap(request, page, site.baseURL, url)
      problems.push(
        ...readProblems(file, SITEMAP_ROOTS).map((p) => `${url} ${p}`)
      )
    }

    expectNoProblems(
      problems,
      "robots.txt points search engines to a sitemap that doesn't work:",
      'fix the "Sitemap:" line in robots.txt or the sitemap it points to.',
      robots.url
    )
  })

  test("should block crawling outside production", async ({ robots }) => {
    test.skip(
      ENV !== "dev" && ENV !== "stg",
      "Runs on dev and staging only (local APP_ENV is unknown)"
    )

    const rules = robots.rulesByAgent.get("*") ?? []
    // The whole site must stay blocked: any Allow reopens part of it, and
    // `Allow: /` even wins over `Disallow: /` (equal length, RFC 9309).
    const problems = [
      ...(rules.some(isDisallowAll)
        ? []
        : ['No "Disallow: /" for "User-agent: *"']),
      ...rules
        .filter((r) => r.field === "allow" && r.value)
        .map((r) => `${quoteLine(r)} reopens part of the site`),
      ...robots.sitemaps.map(
        (s) => `"Sitemap: ${s}" points search engines to a sitemap`
      ),
    ]

    expectNoProblems(
      problems,
      `robots.txt lets search engines crawl this ${ENV} site, so it can show up in search results:`,
      'robots.txt must contain "User-agent: *" followed by "Disallow: /", with no "Allow" or "Sitemap" lines. Check that APP_ENV is not "production" on this environment.',
      robots.url
    )
  })
})

test.describe("sitemap.xml", tags("crawling"), () => {
  test("should respond with XML", async ({ sitemaps: { root } }) => {
    expect(
      root.contentType,
      explain(
        `sitemap.xml is served as "${root.contentType}" instead of XML.`,
        'serve sitemap.xml with the "Content-Type: application/xml" header.',
        root.url
      )
    ).toMatch(/[/+]xml\b/)
  })

  test("should be well-formed with a sitemap root element", async ({
    sitemaps: { root, children },
  }) => {
    // Oversized files are not parsed; the size limits test reports them.
    const files = [root, ...children].filter((file) => !file.tooBig)
    // The root may be an index; the files an index lists must be page lists.
    const problems = files.flatMap((file) =>
      readProblems(file, file === root ? SITEMAP_ROOTS : ["urlset"]).map((p) =>
        inFile(file, files.length, p)
      )
    )

    expectNoProblems(
      problems,
      "The sitemap can't be read by search engines:",
      "open the listed URL in a browser to see what it returns.",
      root.url
    )
  })

  test("every entry should have an absolute <loc> on the tested origin", async ({
    sitemaps: { root, readable },
    site,
  }) => {
    const locProblem = (loc: string | null) => {
      if (!loc) return "has no <loc> address."
      if (!isAbsolute(loc)) return `"${loc}" is not a full URL.`
      if (!isOn(loc, site.origin)) return `"${loc}" is not on ${site.origin}.`

      return null
    }
    const problems = readable.flatMap((file) =>
      file.doc.locs.flatMap((loc, i) => {
        const problem = locProblem(loc)

        return problem
          ? [inFile(file, readable.length, `Entry ${i + 1}: ${problem}`)]
          : []
      })
    )

    expectNoProblems(
      problems,
      `The sitemap has ${problems.length} wrong address(es):`,
      "check that APP_PUBLIC_URL is set to the public address of this site.",
      root.url
    )
  })

  test("should not list the same page twice", async ({
    sitemaps: { root, readable },
  }) => {
    const duplicates = [...countOccurrences(pageLocs(readable))]
      .filter(([, count]) => count > 1)
      .map(([loc, count]) => `${loc} (${count}×)`)

    expectNoProblems(
      duplicates,
      `The sitemap lists ${duplicates.length} page(s) more than once:`,
      "check the page slugs in Strapi; two pages (or two locales) may resolve to the same address.",
      root.url
    )
  })

  test("should stay within the sitemap size limits", async ({
    sitemaps: { root, readable },
  }) => {
    const problems = readable.flatMap((file) => {
      const entries = file.doc.locs.length
      const found = [
        file.tooBig,
        entries > SITEMAP_MAX_URLS
          ? `has ${entries} entries (max ${SITEMAP_MAX_URLS}).`
          : null,
      ]

      return found
        .filter((p) => p !== null)
        .map((p) => inFile(file, readable.length, p))
    })

    expectNoProblems(
      problems,
      "The sitemap is too big, so search engines will reject it:",
      "split the sitemap into several files listed in a <sitemapindex>.",
      root.url
    )
  })

  test("sampled pages from the sitemap should load directly and be indexable", async ({
    sitemaps: { root, readable },
    site,
    request,
    page,
  }) => {
    // The first pages of every <urlset>, so each part of a sitemap index is
    // covered. Addresses on another origin are reported by the <loc> test.
    const sample = readable.flatMap((file) =>
      pageLocs([file])
        .filter((loc) => isOn(loc, site.origin))
        .slice(0, PAGE_SAMPLE_SIZE)
    )
    test.skip(sample.length === 0, "The sitemap lists no pages")

    const problems: string[] = []
    for (const loc of sample) {
      // Only production pages must be indexable; dev and staging are noindex
      // on purpose, and local APP_ENV is unknown.
      const problem = await checkSitemapPage(
        request,
        page,
        site.baseURL,
        loc,
        ENV === "prod"
      )
      if (problem) problems.push(problem)
    }

    expectNoProblems(
      problems,
      `${problems.length} of ${sample.length} checked pages in the sitemap don't load directly or can't be indexed:`,
      "the sitemap must list only public, indexable pages that load directly. Remove the listed addresses from the sitemap, replace them with the address they redirect to, or remove their noindex.",
      root.url
    )
  })

  test("should list pages on production", async ({
    sitemaps: { root, readable },
  }) => {
    test.skip(ENV !== "prod", "Runs on production only")

    const pages = pageLocs(readable).length
    test.skip(
      pages === 0 && readable.some((file) => file.tooBig),
      "The sitemap is too big to read; reported by the size limits test"
    )

    expect(
      pages,
      explain(
        "The sitemap is empty on production, so search engines get no list of pages.",
        'check that APP_ENV is "production", APP_PUBLIC_URL is set and Strapi has published pages.',
        root.url
      )
    ).toBeGreaterThan(0)
  })

  test("should be missing or empty on staging", async ({ rootSitemap }) => {
    test.skip(ENV !== "stg", "Runs on staging only")

    // A missing sitemap (404) passes: there is nothing to index.
    if (!rootSitemap) return

    const { doc, url, tooBig } = rootSitemap
    // An oversized sitemap isn't parsed, but it certainly isn't empty.
    const problems = tooBig
      ? [`sitemap.xml ${tooBig}`]
      : doc.locs.map((loc) => loc ?? "(no address)")

    expectNoProblems(
      problems,
      `sitemap.xml on staging should be empty, but it isn't:`,
      'check that APP_ENV on staging is not "production" or "development".',
      url
    )
  })
})
