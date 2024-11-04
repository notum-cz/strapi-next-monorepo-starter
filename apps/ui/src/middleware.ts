import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"
import createMiddleware from "next-intl/middleware"

import { env } from "./env.mjs"
import { routing } from "./lib/navigation"

// https://next-intl-docs.vercel.app/docs/getting-started/app-router
const intlMiddleware = createMiddleware(routing)

const publicPages = [
  "/",
  "/auth/activate",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/register",
  "/auth/signin",
  "/builder",
  "/builder/.*", // use regex to match all builder pages
  "/docs",
]

const authMiddleware = withAuth(
  // Note that this callback is only invoked if
  // the `authorized` callback has returned `true`
  // and not for pages listed in `pages`.
  (req) => intlMiddleware(req),
  {
    callbacks: {
      authorized: ({ token }) => token != null,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
)

export default function middleware(req: NextRequest) {
  // Handle HTTPS redirection in production in Heroku servers
  // Comment this block when running locally (using `next start`)
  const xForwardedProtoHeader = req.headers.get("x-forwarded-proto")
  if (
    env.NODE_ENV === "production" &&
    (xForwardedProtoHeader === null ||
      xForwardedProtoHeader.includes("https") === false)
  ) {
    return NextResponse.redirect(
      `https://${req.headers.get("host")}${req.nextUrl.pathname}`,
      301
    )
  }

  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join("|")}))?(${publicPages
      .flatMap((p) => (p === "/" ? ["", "/"] : p))
      .join("|")})/?$`,
    "i"
  )
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname)

  if (isPublicPage) {
    return intlMiddleware(req)
  }

  return (authMiddleware as any)(req)
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
    "/((?!_next|_vercel|api|.*\\..*).*)",
  ],
}
