/** Loading and reading sitemaps (sitemaps.org) for the SEO tests. */
import { gunzipSync } from "node:zlib"

import type { APIRequestContext, APIResponse, Page } from "@playwright/test"

import { hasNoindex } from "./robots"

export const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
export const SITEMAP_ROOTS = ["urlset", "sitemapindex"]

// Limits per sitemap file from sitemaps.org; Google rejects bigger files.
export const SITEMAP_MAX_URLS = 50_000
const SITEMAP_MAX_BYTES = 50 * 1024 * 1024

// A sitemap index can list many files; the first ones are enough for a smoke test.
const MAX_CHILD_SITEMAPS = 50

// Redirects followed for one sitemap file, each checked against the origin.
const MAX_REDIRECTS = 5

export type SitemapDoc = {
  /** Why the file can't be read, as a phrase ("is not valid XML: …"). */
  parseError: string | null
  root: string | null
  namespace: string | null
  /** `<loc>` of each `<url>` (urlset) or `<sitemap>` (index); `null` when missing. */
  locs: (string | null)[]
  /** Sitemap elements under the wrong root, such as `<sitemap>` in `<urlset>`. */
  invalidEntries: string[]
}

export type SitemapFile = {
  /** Public URL, without Basic Auth credentials. */
  url: string
  status: number
  contentType: string
  /** Why the file did not load, as a phrase; `doc` is `null` then. */
  loadError: string | null
  /** Why the file is over the size limit; it is not parsed then. */
  tooBig: string | null
  doc: SitemapDoc | null
}

export type LoadedSitemap = SitemapFile & { doc: SitemapDoc }

const EMPTY_DOC: SitemapDoc = {
  parseError: null,
  root: null,
  namespace: null,
  locs: [],
  invalidEntries: [],
}

const NOT_LOADED = {
  status: 0,
  contentType: "(none)",
  loadError: null,
  tooBig: null,
  doc: null,
}

export const isLoaded = (file: SitemapFile): file is LoadedSitemap =>
  file.doc !== null

export const isAbsolute = (url: string | null): url is string =>
  !!url && /^https?:\/\//.test(url)

/** An absolute URL on `origin`. */
export const isOn = (url: string | null, origin: string): url is string =>
  isAbsolute(url) && new URL(url).origin === origin

export function countOccurrences(items: string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1)

  return counts
}

/**
 * The absolute URL to request. A same-origin URL is rebuilt from BASE_URL with
 * only its path and query swapped in, so it keeps BASE_URL's Basic Auth
 * credentials and can't leave the tested origin (a path such as
 * `//other.host/x` stays a path). Other origins get no credentials.
 */
export function requestTarget(url: string, baseURL: string): string {
  const target = new URL(url)
  const base = new URL(baseURL)
  if (target.origin !== base.origin) return target.href

  base.pathname = target.pathname
  base.search = target.search
  base.hash = ""

  return base.href
}

/**
 * Requests a file on the tested origin. Redirects are followed by hand, so
 * every hop is checked against the origin before it is requested.
 */
async function requestOnOrigin(
  request: APIRequestContext,
  baseURL: string,
  url: string
): Promise<{ response: APIResponse } | { status: number; loadError: string }> {
  const origin = new URL(baseURL).origin
  let current = url

  for (let hop = 0; ; hop++) {
    if (new URL(current).origin !== origin) {
      return {
        status: 0,
        loadError: `redirects to ${current}, which is not on ${origin}.`,
      }
    }

    const response = await request.get(requestTarget(current, baseURL), {
      maxRedirects: 0,
    })
    const status = response.status()
    const location = response.headers()["location"]
    if (status < 300 || status >= 400 || !location) return { response }

    await response.dispose()
    if (hop >= MAX_REDIRECTS) {
      return {
        status,
        loadError: `redirects more than ${MAX_REDIRECTS} times.`,
      }
    }
    current = new URL(location, current).href
  }
}

/**
 * The XML of a sitemap body. A gzip file (`sitemap.xml.gz` served without
 * `Content-Encoding`, so the HTTP client leaves it compressed) is decompressed,
 * at most up to the size limit.
 */
function decodeBody(body: Buffer): {
  text?: string
  tooBig?: string
  parseError?: string
} {
  const isGzip = body[0] === 0x1f && body[1] === 0x8b
  if (!isGzip) return { text: body.toString("utf8") }

  try {
    return {
      text: gunzipSync(body, { maxOutputLength: SITEMAP_MAX_BYTES }).toString(
        "utf8"
      ),
    }
  } catch (error) {
    const overLimit =
      error instanceof RangeError ||
      (error as NodeJS.ErrnoException).code === "ERR_BUFFER_TOO_LARGE"

    return overLimit
      ? { tooBig: "is larger than 50 MB after decompression (max 50 MB)." }
      : {
          parseError: `could not be decompressed (${(error as Error).message}).`,
        }
  }
}

/** Parses with the browser's DOMParser, which reports malformed XML. */
function parseXml(page: Page, xml: string): Promise<SitemapDoc> {
  return page.evaluate(
    ({ xml, ns }): SitemapDoc => {
      const parsed = new DOMParser().parseFromString(xml, "application/xml")
      const error = parsed.querySelector("parsererror")
      const root = parsed.documentElement

      if (error) {
        // Chromium wraps the message ("error on line 1 at column 14: …") in a
        // <div> between headings meant for a rendered page.
        const message = (
          error.querySelector("div")?.textContent ??
          error.textContent ??
          ""
        ).trim()

        return {
          parseError: `is not valid XML: ${message || "unknown XML error"}`,
          root: null,
          namespace: root.namespaceURI,
          locs: [],
          invalidEntries: [],
        }
      }

      // <url> belongs only under <urlset>, <sitemap> only under <sitemapindex>.
      // Elements in other namespaces (images, hreflang links) are extensions.
      const entryNames: Record<string, string> = {
        urlset: "url",
        sitemapindex: "sitemap",
      }
      const expected =
        root.namespaceURI === ns ? entryNames[root.localName] : undefined
      const children = Array.from(root.children).filter(
        (el) => el.namespaceURI === ns
      )
      const entries = children.filter((el) => el.localName === expected)
      const misplaced = expected
        ? children.filter((el) => el.localName !== expected)
        : []

      return {
        parseError: null,
        root: root.localName,
        namespace: root.namespaceURI,
        locs: entries.map((entry) => {
          const loc = Array.from(entry.children).find(
            (el) => el.localName === "loc" && el.namespaceURI === ns
          )

          return loc ? (loc.textContent ?? "").trim() : null
        }),
        invalidEntries: misplaced.map(
          (el) => `<${el.localName}> inside <${root.localName}>`
        ),
      }
    },
    { xml, ns: SITEMAP_NS }
  )
}

/** Downloads, decodes and parses one sitemap file. */
export async function loadSitemap(
  request: APIRequestContext,
  page: Page,
  baseURL: string,
  url: string
): Promise<SitemapFile> {
  const result = await requestOnOrigin(request, baseURL, url)
  if (!("response" in result)) return { ...NOT_LOADED, url, ...result }

  const { response } = result

  // Free the body right away: an index can list many large files.
  try {
    const file: SitemapFile = {
      ...NOT_LOADED,
      url,
      status: response.status(),
      contentType: response.headers()["content-type"] ?? "(none)",
    }
    if (!response.ok()) {
      return {
        ...file,
        loadError: `could not be loaded (HTTP ${file.status}).`,
      }
    }

    // Checked before decoding or parsing, so an oversized file never reaches
    // the browser. A body sent with `Content-Encoding` is already decoded here.
    const body = await response.body()
    if (body.length > SITEMAP_MAX_BYTES) {
      const megabytes = (body.length / 1024 / 1024).toFixed(1)

      return {
        ...file,
        tooBig: `is ${megabytes} MB (max 50 MB).`,
        doc: EMPTY_DOC,
      }
    }

    const decoded = decodeBody(body)
    if (decoded.tooBig)
      return { ...file, tooBig: decoded.tooBig, doc: EMPTY_DOC }
    if (decoded.parseError) {
      return { ...file, doc: { ...EMPTY_DOC, parseError: decoded.parseError } }
    }

    return { ...file, doc: await parseXml(page, decoded.text ?? "") }
  } finally {
    await response.dispose()
  }
}

/**
 * The sitemaps a `<sitemapindex>` lists (the first MAX_CHILD_SITEMAPS). Only
 * files on the tested origin are requested; one elsewhere is invalid in an
 * index and shows up as a wrong `<loc>`.
 */
export async function loadChildSitemaps(
  request: APIRequestContext,
  page: Page,
  baseURL: string,
  root: LoadedSitemap
): Promise<SitemapFile[]> {
  if (root.doc.root !== "sitemapindex") return []

  const origin = new URL(baseURL).origin
  const urls = root.doc.locs
    .filter((loc) => isOn(loc, origin))
    .slice(0, MAX_CHILD_SITEMAPS)

  const children: SitemapFile[] = []
  for (const url of urls)
    children.push(await loadSitemap(request, page, baseURL, url))

  return children
}

/** Page addresses (`<url><loc>`) across every `<urlset>`. */
export function pageLocs(files: LoadedSitemap[]): string[] {
  return files
    .filter((file) => file.doc.root === "urlset")
    .flatMap((file) => file.doc.locs.filter((loc): loc is string => !!loc))
}

/** Why search engines can't read a sitemap file, as phrases; empty when they can. */
export function readProblems(file: SitemapFile, roots: string[]): string[] {
  if (!isLoaded(file))
    return [file.loadError ?? `could not be loaded (HTTP ${file.status}).`]
  if (file.tooBig) return [file.tooBig]

  const { parseError, root, namespace, invalidEntries } = file.doc
  if (parseError) return [parseError]
  if (!root || !roots.includes(root)) {
    return [`starts with <${root}> instead of <${roots.join("> or <")}>.`]
  }
  if (namespace !== SITEMAP_NS) {
    return [`is missing the standard namespace xmlns="${SITEMAP_NS}".`]
  }

  return [...countOccurrences(invalidEntries)].map(
    ([entry, count]) => `has ${count}× ${entry}, which search engines ignore.`
  )
}

/** Explains the common redirects a sitemap page shouldn't have. */
function redirectHint(location: string): string {
  if (/404|not-?found|error/i.test(location)) return " (the page doesn't exist)"
  if (/login|sign-?in|returnurl|redirect_?to|callbackurl/i.test(location)) {
    return " (the page requires login, so search engines can't see it)"
  }

  return ""
}

/** Where a page is marked noindex: the `X-Robots-Tag` header or a robots meta tag. */
async function findNoindex(page: Page, header: string, html: string) {
  if (hasNoindex(header)) return `X-Robots-Tag: ${header}`

  const metas = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, "text/html")

    return Array.from(
      doc.querySelectorAll("meta[name='robots' i]"),
      (el) => el.getAttribute("content") ?? ""
    )
  }, html)
  const meta = metas.find(hasNoindex)

  return meta === undefined ? null : `<meta name="robots" content="${meta}">`
}

/**
 * Why a page from the sitemap shouldn't be there: a redirect, an error status
 * or, with `checkNoindex`, noindex. `null` when the page is fine.
 */
export async function checkSitemapPage(
  request: APIRequestContext,
  page: Page,
  baseURL: string,
  loc: string,
  checkNoindex: boolean
): Promise<string | null> {
  const response = await request.get(requestTarget(loc, baseURL), {
    maxRedirects: 0,
  })

  try {
    const status = response.status()

    if (status >= 300 && status < 400) {
      const target = response.headers()["location"] ?? "(unknown)"

      return `${loc} redirects (HTTP ${status}) to ${target}${redirectHint(target)}`
    }
    if (status !== 200) return `${loc} responds with HTTP ${status}`
    if (!checkNoindex) return null

    const header = response.headers()["x-robots-tag"] ?? ""
    const noindex = await findNoindex(page, header, await response.text())

    return noindex
      ? `${loc} is marked noindex (${noindex}), so search engines won't index it`
      : null
  } finally {
    await response.dispose()
  }
}
