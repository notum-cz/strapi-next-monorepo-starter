import type { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"

import { routing } from "@/lib/navigation"
import { authGuard } from "@/lib/proxies/authGuard"
import { authSitemap } from "@/lib/proxies/authSitemap"
import { basicAuth } from "@/lib/proxies/basicAuth"
import { dynamicRewrite } from "@/lib/proxies/dynamicRewrite"
import { httpsRedirect } from "@/lib/proxies/httpsRedirect"
import { redirectsProxy } from "@/lib/proxies/redirects"
import { withSecurityHeaders } from "@/lib/proxies/securityHeaders"

// https://next-intl-docs.vercel.app/docs/getting-started/app-router
const intlProxy = createMiddleware(routing)

// Ordered guards run before the intl fallback; the first to return a response
// wins. Each returns null to defer to the next.
const proxies: ((
  req: NextRequest
) => NextResponse | null | Promise<NextResponse | null>)[] = [
  basicAuth,
  httpsRedirect,
  authSitemap,
  redirectsProxy,
  (req) => authGuard(req, intlProxy),
  (req) => dynamicRewrite(req, intlProxy),
]

export default async function proxy(req: NextRequest) {
  // First proxy to return a response wins; intlProxy always returns one, so the
  // chain never resolves to null.
  let response: NextResponse | null = null
  for (const runProxy of proxies) {
    response = await runProxy(req)
    if (response) break
  }
  response ??= intlProxy(req)

  // CSP / X-Frame-Options are applied here (not next.config, which is build
  // time) because frame-ancestors depends on the runtime STRAPI_URL. Wrapping
  // the composed response applies them to redirects and guarded routes too.
  return withSecurityHeaders(req, response)
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",
    // Gate the generated sitemap in non-production deployed environments
    "/sitemap.xml",
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    `/(cs|en)/:path*`,

    // Skip all paths that should not be internationalized

    "/((?!_next|_vercel|api|images|robots.txt|favicon.ico|sitemap).*)",
  ],
}
