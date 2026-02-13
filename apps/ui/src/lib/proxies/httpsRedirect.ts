import { type NextRequest, NextResponse } from "next/server"

import { isDevelopment } from "@/lib/general-helpers"

/**
 * Redirects non-HTTPS requests to HTTPS in production (e.g. Heroku).
 * Returns null if no redirect is needed.
 */
export const httpsRedirect = (req: NextRequest): NextResponse | null => {
  const xForwardedProto = req.headers.get("x-forwarded-proto")
  const host = req.headers.get("host") ?? ""
  const isDev = isDevelopment() || host.includes("localhost")

  if (
    !isDev &&
    (xForwardedProto === null || !xForwardedProto.includes("https"))
  ) {
    return NextResponse.redirect(
      `https://${req.headers.get("host")}${req.nextUrl.pathname}${req.nextUrl.search}`,
      301
    )
  }

  return null
}
