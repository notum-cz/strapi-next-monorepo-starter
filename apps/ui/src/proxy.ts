import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"

import { routing } from "@/lib/navigation"
import { authGuard } from "@/lib/proxies/authGuard"
import { basicAuth } from "@/lib/proxies/basicAuth"
import { dynamicRewrite } from "@/lib/proxies/dynamicRewrite"
import { httpsRedirect } from "@/lib/proxies/httpsRedirect"

// https://next-intl-docs.vercel.app/docs/getting-started/app-router
const intlProxy = createMiddleware(routing)

export default async function proxy(req: NextRequest) {
  const basicAuthResponse = basicAuth(req)
  if (basicAuthResponse) return basicAuthResponse

  const httpsResponse = httpsRedirect(req)
  if (httpsResponse) return httpsResponse

  const authResponse = await authGuard(req, intlProxy)
  if (authResponse) return authResponse

  const dynamicResponse = dynamicRewrite(req, intlProxy)
  if (dynamicResponse) return dynamicResponse

  return intlProxy(req)
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
