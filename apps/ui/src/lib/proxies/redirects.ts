import { type NextRequest, NextResponse } from "next/server"

import { logError } from "@/lib/logging"
import { routing } from "@/lib/navigation"
import {
  buildRedirectDestinationUrl,
  findRedirectForPath,
} from "@/lib/redirects"

export async function redirectsProxy(
  req: NextRequest
): Promise<NextResponse | null> {
  if (!["GET", "HEAD"].includes(req.method)) {
    // Redirects are only meaningful for navigational/idempotent requests.
    return null
  }

  if (isPrefetchRequest(req)) {
    // Next.js production prefetches visible links as RSC requests. Running
    // redirect lookup for those speculative requests creates unnecessary
    // Strapi traffic; the real navigation is checked separately.
    return null
  }

  let redirect
  try {
    redirect = await findRedirectForPath(
      req.nextUrl.pathname,
      routing.defaultLocale
    )
  } catch (error) {
    logError(error, "[redirectsProxy] Redirect lookup failed")

    // Proxy should fail open. A redirect lookup outage must not block normal
    // page rendering.
    return null
  }

  if (!redirect?.destination) return null

  const destinationUrl = buildRedirectDestinationUrl(
    req.nextUrl,
    redirect.destination,
    routing.defaultLocale
  )

  if (!destinationUrl) {
    return null
  }

  if (destinationUrl.href === req.nextUrl.href) {
    return null
  }

  // Always use 307 for CMS-managed redirects. A 308/301 is attractive for SEO
  // once a move is truly final, but it is also sticky: browsers, crawlers, and
  // intermediate caches can keep using it after editors fix or remove the
  // redirect. A CDN can be purged, but user-agent caches cannot. These
  // redirects are operational CMS content, so the safer default is a temporary
  // method-preserving redirect that can be changed without leaving clients
  // pinned to the old destination.
  return NextResponse.redirect(destinationUrl, 307)
}

function isPrefetchRequest(req: NextRequest) {
  return (
    req.headers.has("next-router-prefetch") ||
    req.headers.get("purpose") === "prefetch" ||
    req.headers.get("sec-purpose") === "prefetch"
  )
}
