import { normalizePageFullPath } from "@repo/shared-data"

import { logError, logger } from "@/lib/logging"
import { fetchRedirects } from "@/lib/strapi-api/content/server"

type RedirectRecord = Awaited<ReturnType<typeof fetchRedirects>>[number]

type RedirectCacheEntry = {
  expiresAt: number
  redirects: RedirectRecord[]
}

const REDIRECTS_CACHE_TTL_MS = 2 * 60 * 1000 // 2 minutes
let redirectCache: RedirectCacheEntry | undefined

// One in-flight fetch is shared by all concurrent requests. Without this guard,
// a traffic burst after cache expiry could fan out into many identical Strapi
// reads from the proxy path.
let redirectFetchPromise: Promise<RedirectRecord[]> | undefined

// Returns the best redirect record for the requested path. Default-locale URLs
// can be visited with or without the locale prefix, so matching is done against
// both normalized candidates while preserving preference order.
export async function findRedirectForPath(
  path: string,
  defaultLocale: string
): Promise<RedirectRecord | null> {
  const cached = redirectCache
  const sources = getRedirectSourceCandidates(path, defaultLocale)
  const redirects = await getCachedRedirects()
  const redirect = findRedirectInList(redirects, sources)

  if (redirect || !cached || cached.expiresAt > Date.now()) {
    return redirect
  }

  // An expired-cache hit can safely use the stale redirect while refreshing in
  // the background. An expired-cache miss is different: a newly created redirect
  // could be missing from this UI instance while a CDN in front of the app has
  // already purged the old response. Refresh synchronously before allowing the
  // request to fall through to normal page rendering, otherwise the CDN could
  // cache a stale 404/200 for the source URL.
  return findRedirectInList(await refreshRedirects(), sources)
}

export function clearRedirectCache() {
  redirectCache = undefined
  redirectFetchPromise = undefined
}

async function getCachedRedirects() {
  const cached = redirectCache

  if (cached && cached.expiresAt > Date.now()) {
    return cached.redirects
  }

  // Cold cache must wait for Strapi because there is no safe fallback list yet.
  // Expired cache serves stale data immediately and refreshes in the background;
  // redirects are low-churn content, and avoiding request latency spikes in the
  // proxy is more valuable than blocking on every TTL boundary.
  void refreshRedirects()

  if (cached) {
    return cached.redirects
  }

  return redirectFetchPromise ?? []
}

// Stores the whole published redirect list as one small object. The site is
// expected to have only a handful of redirects, so a single cached list keeps
// lookup simple and avoids per-path cache fragmentation.
function cacheRedirects(redirects: RedirectRecord[]) {
  redirectCache = {
    expiresAt: Date.now() + REDIRECTS_CACHE_TTL_MS,
    redirects,
  }

  return redirects
}

// Refresh failures should not break navigation. If Strapi is temporarily down,
// keep serving the last known redirect list until a later refresh succeeds.
//
// Kept as a promise chain (not async/await): the expired-cache-miss path in
// `findRedirectForPath` reuses this same in-flight promise via the `??=` guard,
// and that dedup relies on `redirectFetchPromise` staying set until the chain
// fully settles. Rewriting with async/await resets it a few microtasks earlier,
// which lets the miss path spawn a redundant Strapi fetch.
function refreshRedirects() {
  /* eslint-disable unicorn/prefer-await -- promise chain is intentional, see note above */
  redirectFetchPromise ??= fetchRedirects()
    .then(cacheRedirects)
    .catch((error: unknown) => {
      logError(error, "[redirects] Failed to refresh redirect cache")

      return redirectCache?.redirects ?? []
    })
    .finally(() => {
      redirectFetchPromise = undefined
    })
  /* eslint-enable unicorn/prefer-await */

  return redirectFetchPromise
}

export function buildRedirectDestinationUrl(
  currentUrl: URL,
  destination: string,
  defaultLocale?: string
) {
  // Editors type `destination` by hand and some malformed values (e.g.
  // "https://" or a host containing a space) make the URL constructor throw.
  // One bad record must not take down the proxy for the matching path.
  let destinationUrl: URL
  try {
    destinationUrl = new URL(destination, currentUrl.origin)
  } catch {
    logger.warn("[redirects] Invalid redirect destination", { destination })

    return null
  }

  if (destinationUrl.origin !== currentUrl.origin) {
    return null
  }

  if (defaultLocale) {
    // Strapi stores redirects with locale prefixes, but the public app uses
    // `localePrefix: "as-needed"`. Strip the default locale to avoid an
    // extra next-intl canonicalization redirect.
    destinationUrl.pathname = stripDefaultLocalePrefix(
      destinationUrl.pathname,
      defaultLocale
    )
  }

  if (!destinationUrl.search) {
    // Preserve campaign/query params from the original request unless editors
    // intentionally configured a query string on the redirect destination.
    destinationUrl.search = currentUrl.search
  }

  return destinationUrl
}

function getRedirectSourceCandidates(path: string, defaultLocale: string) {
  // Strapi redirect records are stored with locale prefixes, while public
  // default-locale URLs may be unprefixed. Check both forms for default locale.
  return [
    ...new Set([
      normalizePageFullPath([path]),
      normalizePageFullPath([path], defaultLocale),
    ]),
  ]
}

function findRedirectInList(redirects: RedirectRecord[], sources: string[]) {
  return (
    sources
      .map((source) =>
        redirects.find(
          (redirect) =>
            redirect.source &&
            normalizeRedirectSource(redirect.source) === source
        )
      )
      .find(Boolean) ?? null
  )
}

// Editors type `source` by hand, so tolerate the common slips — surrounding
// whitespace, a missing leading slash, a trailing slash — instead of letting
// the record silently never match. The request-side candidates are already
// canonical (Next.js strips trailing slashes before the proxy runs).
function normalizeRedirectSource(source: string) {
  const normalized = normalizePageFullPath([source.trim()])

  return normalized.length > 1 && normalized.endsWith("/")
    ? normalized.slice(0, -1)
    : normalized
}

function stripDefaultLocalePrefix(pathname: string, defaultLocale: string) {
  const localePrefix = `/${defaultLocale}`

  if (pathname === localePrefix) {
    // `/en` should canonicalize to the root path for the default locale.
    return "/"
  }

  if (pathname.startsWith(`${localePrefix}/`)) {
    return pathname.slice(localePrefix.length)
  }

  return pathname
}
