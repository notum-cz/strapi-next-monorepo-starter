import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"

import { routing } from "@/lib/navigation"
import { authGuard } from "@/lib/proxies/authGuard"
import { basicAuth } from "@/lib/proxies/basicAuth"
import { dynamicRewrite } from "@/lib/proxies/dynamicRewrite"
import { httpsRedirect } from "@/lib/proxies/httpsRedirect"
import { withSecurityHeaders } from "@/lib/proxies/securityHeaders"

// https://next-intl-docs.vercel.app/docs/getting-started/app-router
const intlProxy = createMiddleware(routing)

export default async function proxy(req: NextRequest) {
  // First proxy to return a response wins; intlProxy always returns one, so the
  // chain never resolves to null.
  const response =
    basicAuth(req) ??
    httpsRedirect(req) ??
    (await authGuard(req, intlProxy)) ??
    dynamicRewrite(req, intlProxy) ??
    intlProxy(req)

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
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    `/(cs|en)/:path*`,

    // Skip all paths that should not be internationalized
    // eslint-disable-next-line unicorn/prefer-string-raw
    "/((?!_next|_vercel|api|robots.txt|favicon.ico|sitemap|.*\\..*).*)",
  ],
}
