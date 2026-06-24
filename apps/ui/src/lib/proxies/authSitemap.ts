import { type NextRequest, NextResponse } from "next/server"

import { isDevelopment, isProduction } from "@/lib/general-helpers"

const SITEMAP_PROTECTED_PATHS = new Set(["/sitemap.xml"])

const ALLOW_SITEMAP_PARAM = "allow-sitemap"
const ALLOW_SITEMAP_VALUE = "yes"

const isSitemapProtectedPath = (pathname: string): boolean =>
  SITEMAP_PROTECTED_PATHS.has(pathname)

/**
 * Gates the generated sitemap behind an `?allow-sitemap=yes` query parameter in
 * non-production deployments. Returns a response for protected paths so they
 * bypass downstream proxies.
 */
export const authSitemap = (req: NextRequest): NextResponse | null => {
  if (!isSitemapProtectedPath(req.nextUrl.pathname)) {
    return null
  }

  if (isProduction() || isDevelopment()) {
    return NextResponse.next()
  }

  if (
    req.nextUrl.searchParams.get(ALLOW_SITEMAP_PARAM) === ALLOW_SITEMAP_VALUE
  ) {
    return NextResponse.next()
  }

  const res = new NextResponse("Not found", { status: 404 })
  // Prevent CDNs/intermediaries from caching the denial, which would otherwise
  // make later `?allow-sitemap=yes` requests appear broken.
  res.headers.set("Cache-Control", "private, no-store")

  return res
}
