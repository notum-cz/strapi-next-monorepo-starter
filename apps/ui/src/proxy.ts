import { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"

import { getSessionSSR } from "./lib/auth"
import { isDevelopment } from "./lib/general-helpers"
import { routing } from "./lib/navigation"

// https://next-intl-docs.vercel.app/docs/getting-started/app-router
const intlProxy = createMiddleware(routing)

// List all pages that require authentication (non-public)
const authPages = ["/auth/change-password", "/auth"]

export default async function proxy(req: NextRequest) {
  // Handle HTTPS redirection in production in Heroku servers
  // Comment this block when running locally (using `next start`)
  const xForwardedProtoHeader = req.headers.get("x-forwarded-proto")
  const host = req.headers.get("host") ?? ""

  const isDevelopmentEnvironment = isDevelopment() || host.includes("localhost")

  if (
    !isDevelopmentEnvironment &&
    (xForwardedProtoHeader === null ||
      xForwardedProtoHeader.includes("https") === false)
  ) {
    return NextResponse.redirect(
      `https://${req.headers.get("host")}${req.nextUrl.pathname}`,
      301
    )
  }

  // Build regex for auth (non-public) pages
  const authPathnameRegex = RegExp(
    `^(/(${routing.locales.join("|")}))?(${authPages.join("|")})/?$`,
    "i"
  )
  const isAuthPage = authPathnameRegex.test(req.nextUrl.pathname)

  // If the request is for a non-public (auth) page, require authentication
  if (isAuthPage) {
    try {
      // Check Better Auth session (Strapi JWT validation happens automatically via plugin hook)
      const session = await getSessionSSR(req.headers)

      if (!session?.user) {
        // No session found or token invalid, redirect to sign in
        throw new Error("No valid session")
      }

      // User is authenticated, proceed with internationalization middleware
      return intlProxy(req)
    } catch (error) {
      // Error checking session, redirect to sign in
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // All other pages are public
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
    "/((?!_next|_vercel|api|robots.txt|favicon.ico|sitemap|.*\\..*).*)",
  ],
}
