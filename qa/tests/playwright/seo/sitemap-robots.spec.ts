import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test"

import { resolveTestEnv, tags } from "../helpers/test-groups"

// `undefined` on a local host: only the structure is checked there, because
// the app's own environment (APP_ENV) can be anything.
const ENV = resolveTestEnv()

const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"

// Directives this spec checks. Crawlers ignore any other directive (RFC 9309),
// so an unknown one such as Cloudflare's `Content-Signal` is only a warning.
const ROBOTS_FIELDS = new Set([
  "user-agent",
  "allow",
  "disallow",
  "sitemap",
  "crawl-delay",
  "host",
])

// Longer lists are cut so one broken generator doesn't flood the report.
const MAX_LISTED = 10

type RobotsLine = { field: string; value: string; line: number }

type RobotsFile = {
  lines: RobotsLine[]
  /** Allow/Disallow rules per user agent (lowercase). */
  rulesByAgent: Map<string, RobotsLine[]>
  sitemaps: string[]
}

/** Splits robots.txt into `field: value` lines, keeping their line numbers. */
function splitRobotsLines(body: string): RobotsLine[] {
  const lines: RobotsLine[] = []

  for (const [i, raw] of body.split("\n").entries()) {
    const hash = raw.indexOf("#")
    const text = (hash === -1 ? raw : raw.slice(0, hash)).trim()
    if (!text) continue

    const colon = text.indexOf(":")
    const field = colon === -1 ? text : text.slice(0, colon)
    lines.push({
      field: field.trim().toLowerCase(),
      value: colon === -1 ? "" : text.slice(colon + 1).trim(),
      line: i + 1,
    })
  }

  return lines
}

function parseRobots(body: string): RobotsFile {
  const lines = splitRobotsLines(body)
  const rulesByAgent = new Map<string, RobotsLine[]>()
  // Consecutive User-agent lines share one group.
  let agents: string[] = []
  let lastWasAgent = false

  for (const entry of lines) {
    const isAgent = entry.field === "user-agent"

    if (isAgent) {
      const agent = entry.value.toLowerCase()
      agents = lastWasAgent ? [...agents, agent] : [agent]
      // Groups for the same agent merge (RFC 9309), e.g. two `User-agent: *`.
      if (!rulesByAgent.has(agent)) rulesByAgent.set(agent, [])
    } else if (entry.field === "allow" || entry.field === "disallow") {
      for (const agent of agents) rulesByAgent.get(agent)?.push(entry)
    }

    lastWasAgent = isAgent
  }

  return {
    lines,
    rulesByAgent,
    sitemaps: lines.filter((l) => l.field === "sitemap").map((l) => l.value),
  }
}

/** BASE_URL origin; `URL.origin` drops Basic Auth credentials. */
function baseOrigin(baseURL: string | undefined): string {
  expect(
    baseURL,
    "BASE_URL is not set. Set it to the site you want to test."
  ).toBeTruthy()

  return new URL(baseURL!).origin
}

/**
 * A failure message for people who don't read test code: what is wrong, the
 * offending items, how to fix it, and the URL that was checked.
 */
function explain(
  title: string,
  options: { items?: string[]; fix: string; url: string }
): string {
  const items = options.items ?? []
  const listed = items.slice(0, MAX_LISTED).map((item) => `  • ${item}`)
  if (items.length > MAX_LISTED) {
    listed.push(`  … and ${items.length - MAX_LISTED} more`)
  }

  return [
    title,
    ...(listed.length > 0 ? ["", ...listed] : []),
    "",
    `How to fix: ${options.fix}`,
    `Checked URL: ${options.url}`,
    "",
  ].join("\n")
}

function quoteLine({ field, value, line }: RobotsLine): string {
  return `Line ${line}: "${field}: ${value}"`
}

async function fetchFile(
  request: APIRequestContext,
  baseURL: string | undefined,
  path: string
) {
  const url = new URL(path, baseOrigin(baseURL)).href
  const response = await request.get(path)

  expectLoaded(response.ok(), response.status(), path, url)

  return { response, url, body: await response.text() }
}

function expectLoaded(ok: boolean, status: number, path: string, url: string) {
  expect(
    ok,
    explain(`${path} could not be loaded (HTTP ${status}).`, {
      fix: `make sure the site serves ${path} and that BASE_URL points to the right site.`,
      url,
    })
  ).toBe(true)
}

type SitemapDoc = {
  parseError: string | null
  root: string | null
  namespace: string | null
  /** `<loc>` of each `<url>` (urlset) or `<sitemap>` (index); `null` when missing. */
  locs: (string | null)[]
}

type SitemapFile = {
  /** Public URL, without Basic Auth credentials. */
  url: string
  status: number
  contentType: string
  bytes: number
  /** `null` when the file did not load. */
  doc: SitemapDoc | null
}

type LoadedSitemap = SitemapFile & { doc: SitemapDoc }

// Dev and staging may have no sitemap at all (404), which is as good as an
// empty one: search engines find nothing to index there.
const SITEMAP_MAY_BE_MISSING = ENV === "dev" || ENV === "stg"

// Limits per sitemap file from sitemaps.org; Google rejects bigger files.
const SITEMAP_MAX_URLS = 50_000
const SITEMAP_MAX_BYTES = 50 * 1024 * 1024

// A sitemap index can list many files; the first ones are enough for a smoke test.
const MAX_CHILD_SITEMAPS = 50

// Pages opened from each sitemap file (each part of an index) to check they load.
const PAGE_SAMPLE_SIZE = 3

const isLoaded = (file: SitemapFile): file is LoadedSitemap => file.doc !== null

const isAbsolute = (url: string | null): url is string =>
  !!url && /^https?:\/\//.test(url)

/**
 * A same-origin URL is requested by its path, so it goes through `baseURL`
 * and keeps the Basic Auth credentials from BASE_URL.
 */
function requestTarget(url: string, origin: string): string {
  const parsed = new URL(url)

  return parsed.origin === origin ? `${parsed.pathname}${parsed.search}` : url
}

/** Downloads a sitemap and parses it with the browser's DOMParser, which reports malformed XML. */
async function loadSitemap(
  request: APIRequestContext,
  page: Page,
  origin: string,
  url: string
): Promise<SitemapFile> {
  const response = await request.get(requestTarget(url, origin))
  const file = {
    url,
    status: response.status(),
    contentType: response.headers()["content-type"] ?? "(none)",
  }

  if (!response.ok()) return { ...file, bytes: 0, doc: null }

  const body = await response.body()

  return {
    ...file,
    bytes: body.length,
    doc: await parseSitemapXml(page, body.toString("utf8")),
  }
}

/**
 * `/sitemap.xml`, or `null` when it is missing (404) on dev or staging. Fails
 * the test when it does not load anywhere else.
 */
async function fetchSitemap(
  request: APIRequestContext,
  page: Page,
  baseURL: string | undefined
): Promise<LoadedSitemap | null> {
  const origin = baseOrigin(baseURL)
  const file = await loadSitemap(
    request,
    page,
    origin,
    new URL("/sitemap.xml", origin).href
  )

  if (SITEMAP_MAY_BE_MISSING && file.status === 404) return null

  expectLoaded(isLoaded(file), file.status, "/sitemap.xml", file.url)

  return file as LoadedSitemap
}

async function parseSitemapXml(page: Page, body: string): Promise<SitemapDoc> {
  return page.evaluate((xml): SitemapDoc => {
    const parsed = new DOMParser().parseFromString(xml, "application/xml")
    const error = parsed.querySelector("parsererror")
    const root = parsed.documentElement
    // A broken document has no entries worth checking.
    const entries = error
      ? []
      : Array.from(root.children).filter(
          (el) => el.localName === "url" || el.localName === "sitemap"
        )
    // Chromium wraps the message ("error on line 1 at column 14: …") in a <div>
    // between headings meant for a rendered page.
    const message = (
      error?.querySelector("div")?.textContent ??
      error?.textContent ??
      ""
    ).trim()

    return {
      parseError: error ? message || "unknown XML error" : null,
      root: error ? null : root.localName,
      namespace: root.namespaceURI,
      locs: entries.map((entry) => {
        const loc = Array.from(entry.children).find(
          (el) => el.localName === "loc"
        )

        return loc ? (loc.textContent ?? "").trim() : null
      }),
    }
  }, body)
}

/** Like fetchSitemap(), but skips the test when there is no sitemap to check. */
async function requireSitemap(
  request: APIRequestContext,
  page: Page,
  baseURL: string | undefined
): Promise<LoadedSitemap> {
  const sitemap = await fetchSitemap(request, page, baseURL)
  test.skip(
    sitemap === null,
    `No sitemap on ${ENV} (404), which is fine outside production; nothing to check.`
  )

  return sitemap!
}

/**
 * `/sitemap.xml` and, when it is a `<sitemapindex>`, the sitemaps it lists
 * (the first MAX_CHILD_SITEMAPS of them).
 */
async function requireAllSitemaps(
  request: APIRequestContext,
  page: Page,
  baseURL: string | undefined
) {
  const root = await requireSitemap(request, page, baseURL)
  const origin = baseOrigin(baseURL)
  const childUrls =
    root.doc.root === "sitemapindex"
      ? root.doc.locs.filter(isAbsolute).slice(0, MAX_CHILD_SITEMAPS)
      : []

  const children: SitemapFile[] = []
  for (const url of childUrls) {
    children.push(await loadSitemap(request, page, origin, url))
  }

  return {
    root,
    children,
    /**
     * Every file that loaded and is valid XML, the root first. Broken files
     * are reported only by the well-formed test.
     */
    loaded: [root, ...children.filter(isLoaded)].filter(
      (file) => !file.doc.parseError
    ),
  }
}

/** Page addresses (`<url><loc>`) across every `<urlset>`. */
function pageLocs(sitemaps: LoadedSitemap[]): string[] {
  return sitemaps
    .filter((s) => s.doc.root === "urlset")
    .flatMap((s) => s.doc.locs.filter((loc): loc is string => !!loc))
}

/** Explains the common redirects a sitemap page shouldn't have. */
function redirectHint(location: string): string {
  if (/404|not-?found|error/i.test(location)) {
    return " (the page doesn't exist)"
  }
  if (/login|sign-?in|returnurl|redirect_?to|callbackurl/i.test(location)) {
    return " (the page requires login, so search engines can't see it)"
  }

  return ""
}

/** Prefixes a problem with its file when more than one sitemap is checked. */
function inFile(file: SitemapFile, count: number, text: string): string {
  return count > 1 ? `${file.url}: ${text}` : text
}

// No retries: the checks are plain requests, so a retry would only hide a
// flaky robots.txt or sitemap (overrides the seo project's `retries: 1`).
test.describe.configure({ mode: "parallel", retries: 0 })

test.describe("robots.txt", tags("crawling"), () => {
  test("should respond with plain text", async ({ request, baseURL }) => {
    const { response, url } = await fetchFile(request, baseURL, "/robots.txt")
    const type = response.headers()["content-type"] ?? "(none)"

    expect(
      type,
      explain(`robots.txt is served as "${type}" instead of plain text.`, {
        fix: 'serve robots.txt with the "Content-Type: text/plain" header.',
        url,
      })
    ).toContain("text/plain")
  })

  test("should contain only valid directives", async ({ request, baseURL }) => {
    const { body, url } = await fetchFile(request, baseURL, "/robots.txt")
    const { lines } = parseRobots(body)
    const firstAgent = lines.findIndex((l) => l.field === "user-agent")
    const problems: string[] = []
    const unknown: string[] = []

    if (firstAgent === -1) {
      problems.push(
        'There is no "User-agent" line, so no crawler applies any rule.'
      )
    }

    for (const [i, entry] of lines.entries()) {
      const { field, value } = entry

      if (!ROBOTS_FIELDS.has(field)) {
        unknown.push(quoteLine(entry))
      } else if (
        (field === "allow" || field === "disallow") &&
        firstAgent !== -1 &&
        i < firstAgent
      ) {
        problems.push(
          `${quoteLine(entry)} comes before any "User-agent" line, so crawlers ignore it.`
        )
      } else if ((field === "allow" || field === "disallow") && value) {
        // An empty Disallow allows everything; any other value is a path.
        if (!/^[/*]/.test(value)) {
          problems.push(
            `${quoteLine(entry)} must be a path starting with "/" (for example "/admin").`
          )
        }
      } else if (field === "sitemap" && !/^https?:\/\//.test(value)) {
        problems.push(
          `${quoteLine(entry)} must be a full URL (for example "https://example.com/sitemap.xml").`
        )
      }
    }

    if (unknown.length > 0) {
      test.info().annotations.push({
        type: "warning",
        description: `robots.txt has directives this test does not check (crawlers that don't know them ignore them): ${unknown.join("; ")}`,
      })
    }

    expect(
      problems.length,
      explain(`robots.txt has ${problems.length} problem(s):`, {
        items: problems,
        fix: "correct the lines listed above in the robots.txt configuration.",
        url,
      })
    ).toBe(0)
  })

  test("should allow crawling and point to the sitemap on production", async ({
    request,
    baseURL,
  }) => {
    test.skip(ENV !== "prod", "Crawling is allowed only on production")

    const { body, url } = await fetchFile(request, baseURL, "/robots.txt")
    const { rulesByAgent, sitemaps } = parseRobots(body)
    const blocking = (rulesByAgent.get("*") ?? []).filter(
      (r) => r.field === "disallow" && r.value === "/"
    )

    expect(
      blocking.length,
      explain(
        "robots.txt blocks all search engines on production, so the site will drop out of search results.",
        {
          items: blocking.map(quoteLine),
          fix: 'remove "Disallow: /" from the "User-agent: *" group. Check the robots settings in Strapi and that APP_ENV is "production" and Basic Auth is off.',
          url,
        }
      )
    ).toBe(0)

    const expected = new URL("/sitemap.xml", baseOrigin(baseURL)).href
    expect(
      sitemaps,
      explain("robots.txt does not tell search engines where the sitemap is.", {
        items: [
          `Expected: Sitemap: ${expected}`,
          `Found: ${sitemaps.length > 0 ? sitemaps.join(", ") : "no Sitemap line"}`,
        ],
        fix: "check that APP_PUBLIC_URL is set to the public address of the site.",
        url,
      })
    ).toContain(expected)
  })

  test("every sitemap listed in robots.txt should load", async ({
    request,
    page,
    baseURL,
  }) => {
    const { body, url } = await fetchFile(request, baseURL, "/robots.txt")
    // Relative Sitemap lines are reported by "should contain only valid directives".
    const listed = parseRobots(body).sitemaps.filter(isAbsolute)
    test.skip(listed.length === 0, "robots.txt lists no sitemap")

    const origin = baseOrigin(baseURL)
    const problems: string[] = []

    for (const sitemapUrl of listed) {
      const file = await loadSitemap(request, page, origin, sitemapUrl)

      if (!isLoaded(file)) {
        problems.push(
          `${sitemapUrl} could not be loaded (HTTP ${file.status}).`
        )
      } else if (file.doc.parseError) {
        problems.push(`${sitemapUrl} is not valid XML.`)
      } else if (!["urlset", "sitemapindex"].includes(file.doc.root ?? "")) {
        problems.push(
          `${sitemapUrl} is not a sitemap (it starts with <${file.doc.root}>).`
        )
      }
    }

    expect(
      problems.length,
      explain(
        "robots.txt points search engines to a sitemap that doesn't work:",
        {
          items: problems,
          fix: 'fix the "Sitemap:" line in robots.txt or the sitemap it points to.',
          url,
        }
      )
    ).toBe(0)
  })

  test("should block crawling outside production", async ({
    request,
    baseURL,
  }) => {
    test.skip(
      ENV !== "dev" && ENV !== "stg",
      "Runs on dev and staging only (local APP_ENV is unknown)"
    )

    const { body, url } = await fetchFile(request, baseURL, "/robots.txt")
    const { rulesByAgent, sitemaps } = parseRobots(body)
    const blocksAll = (rulesByAgent.get("*") ?? []).some(
      (r) => r.field === "disallow" && r.value === "/"
    )

    expect(
      blocksAll,
      explain(
        `robots.txt lets search engines index this ${ENV} site, so it can show up in search results.`,
        {
          fix: 'robots.txt must contain "User-agent: *" followed by "Disallow: /". Check that APP_ENV is not "production" on this environment.',
          url,
        }
      )
    ).toBe(true)

    expect(
      sitemaps.length,
      explain(
        `robots.txt points search engines to a sitemap on this ${ENV} site.`,
        {
          items: sitemaps.map((s) => `Sitemap: ${s}`),
          fix: 'remove the "Sitemap:" line outside production. Check that APP_ENV is not "production" on this environment.',
          url,
        }
      )
    ).toBe(0)
  })
})

test.describe("sitemap.xml", tags("crawling"), () => {
  test("should respond with XML", async ({ request, page, baseURL }) => {
    const { contentType: type, url } = await requireSitemap(
      request,
      page,
      baseURL
    )

    expect(
      type,
      explain(`sitemap.xml is served as "${type}" instead of XML.`, {
        fix: 'serve sitemap.xml with the "Content-Type: application/xml" header.',
        url,
      })
    ).toMatch(/[/+]xml\b/)
  })

  test("should be well-formed with a sitemap root element", async ({
    request,
    page,
    baseURL,
  }) => {
    const { root, children } = await requireAllSitemaps(request, page, baseURL)
    const files = [root, ...children]
    const problems: string[] = []

    for (const file of files) {
      const say = (text: string) => {
        problems.push(inFile(file, files.length, text))
      }
      // The root may be an index; the files an index lists must be page lists.
      const allowed = file === root ? ["urlset", "sitemapindex"] : ["urlset"]

      if (!isLoaded(file)) {
        say(`could not be loaded (HTTP ${file.status}).`)
      } else if (file.doc.parseError) {
        say(`is not valid XML: ${file.doc.parseError.trim()}`)
      } else if (!allowed.includes(file.doc.root ?? "")) {
        say(
          `starts with <${file.doc.root}> instead of <${allowed.join("> or <")}>.`
        )
      } else if (file.doc.namespace !== SITEMAP_NS) {
        say(`is missing the standard namespace xmlns="${SITEMAP_NS}".`)
      }
    }

    expect(
      problems.length,
      explain("The sitemap can't be read by search engines:", {
        items: problems,
        fix: "open the listed URL in a browser to see what it returns.",
        url: root.url,
      })
    ).toBe(0)
  })

  test("every entry should have an absolute <loc> on the tested origin", async ({
    request,
    page,
    baseURL,
  }) => {
    const { root, loaded } = await requireAllSitemaps(request, page, baseURL)
    const origin = baseOrigin(baseURL)
    const problems: string[] = []

    for (const file of loaded) {
      for (const [i, loc] of file.doc.locs.entries()) {
        const entry = inFile(file, loaded.length, `Entry ${i + 1}`)

        if (!loc) {
          problems.push(`${entry} has no <loc> address.`)
        } else if (!isAbsolute(loc)) {
          problems.push(`${entry}: "${loc}" is not a full URL.`)
        } else if (new URL(loc).origin !== origin) {
          problems.push(`${entry}: "${loc}" is not on ${origin}.`)
        }
      }
    }

    expect(
      problems.length,
      explain(`The sitemap has ${problems.length} wrong address(es):`, {
        items: problems,
        fix: "check that APP_PUBLIC_URL is set to the public address of this site.",
        url: root.url,
      })
    ).toBe(0)
  })

  test("should not list the same page twice", async ({
    request,
    page,
    baseURL,
  }) => {
    const { root, loaded } = await requireAllSitemaps(request, page, baseURL)
    const counts = new Map<string, number>()
    for (const loc of pageLocs(loaded)) {
      counts.set(loc, (counts.get(loc) ?? 0) + 1)
    }
    const duplicates = [...counts]
      .filter(([, count]) => count > 1)
      .map(([loc, count]) => `${loc} (${count}×)`)

    expect(
      duplicates.length,
      explain(
        `The sitemap lists ${duplicates.length} page(s) more than once:`,
        {
          items: duplicates,
          fix: "check the page slugs in Strapi; two pages (or two locales) may resolve to the same address.",
          url: root.url,
        }
      )
    ).toBe(0)
  })

  test("should stay within the sitemap size limits", async ({
    request,
    page,
    baseURL,
  }) => {
    const { root, loaded } = await requireAllSitemaps(request, page, baseURL)
    const problems: string[] = []

    for (const file of loaded) {
      const say = (text: string) => {
        problems.push(inFile(file, loaded.length, text))
      }

      if (file.doc.locs.length > SITEMAP_MAX_URLS) {
        say(`has ${file.doc.locs.length} entries (max ${SITEMAP_MAX_URLS}).`)
      }
      if (file.bytes > SITEMAP_MAX_BYTES) {
        say(`is ${(file.bytes / 1024 / 1024).toFixed(1)} MB (max 50 MB).`)
      }
    }

    expect(
      problems.length,
      explain("The sitemap is too big, so search engines will reject it:", {
        items: problems,
        fix: "split the sitemap into several files listed in a <sitemapindex>.",
        url: root.url,
      })
    ).toBe(0)
  })

  test("sampled pages from the sitemap should load without a redirect", async ({
    request,
    page,
    baseURL,
  }) => {
    const { root, loaded } = await requireAllSitemaps(request, page, baseURL)
    const origin = baseOrigin(baseURL)
    // The first pages of every <urlset>, so each part of a sitemap index is
    // covered. Addresses on another origin are reported by the <loc> test above.
    const sample = loaded.flatMap((file) =>
      pageLocs([file])
        .filter((loc) => isAbsolute(loc) && new URL(loc).origin === origin)
        .slice(0, PAGE_SAMPLE_SIZE)
    )
    test.skip(sample.length === 0, "The sitemap lists no pages")

    const problems: string[] = []
    for (const loc of sample) {
      const response = await request.get(requestTarget(loc, origin), {
        maxRedirects: 0,
      })
      const status = response.status()

      if (status >= 300 && status < 400) {
        const target = response.headers()["location"] ?? "(unknown)"
        problems.push(
          `${loc} redirects (HTTP ${status}) to ${target}${redirectHint(target)}`
        )
      } else if (status !== 200) {
        problems.push(`${loc} responds with HTTP ${status}`)
      }
    }

    expect(
      problems.length,
      explain(
        `${problems.length} of ${sample.length} checked pages in the sitemap don't load directly:`,
        {
          items: problems,
          fix: "the sitemap must list only public pages that load directly. Remove the listed addresses from the sitemap, or replace them with the address they redirect to.",
          url: root.url,
        }
      )
    ).toBe(0)
  })

  test("should list pages on production", async ({
    request,
    page,
    baseURL,
  }) => {
    test.skip(ENV !== "prod", "Runs on production only")

    const { root, loaded } = await requireAllSitemaps(request, page, baseURL)

    expect(
      pageLocs(loaded).length,
      explain(
        "The sitemap is empty on production, so search engines get no list of pages.",
        {
          fix: 'check that APP_ENV is "production", APP_PUBLIC_URL is set and Strapi has published pages.',
          url: root.url,
        }
      )
    ).toBeGreaterThan(0)
  })

  test("should be missing or empty on staging", async ({
    request,
    page,
    baseURL,
  }) => {
    test.skip(ENV !== "stg", "Runs on staging only")

    const sitemap = await fetchSitemap(request, page, baseURL)
    // A missing sitemap (404) passes: there is nothing to index.
    if (!sitemap) return

    const { doc, url } = sitemap

    expect(
      doc.locs.length,
      explain(
        `sitemap.xml lists ${doc.locs.length} address(es) on staging; it should be empty.`,
        {
          items: doc.locs.map((loc) => loc ?? "(no address)"),
          fix: 'check that APP_ENV on staging is not "production" or "development".',
          url,
        }
      )
    ).toBe(0)
  })
})
