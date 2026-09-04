import type { NextRequest, NextResponse } from "next/server"

import { STRAPI_PREVIEW_FRAME_COOKIE } from "@/lib/constants"
import { getEnvVar } from "@/lib/env-vars"

/**
 * Space-separated origins for CSP `frame-ancestors`, built from runtime env.
 *
 * Includes STRAPI_URL so the Strapi admin can iframe this app for live preview.
 * Handles the localhost ↔ 127.0.0.1 alias (distinct origins; dev often mixes them).
 *
 * Read at request time on purpose: STRAPI_URL is a runtime env var injected into
 * the container, but `next.config` headers() are evaluated at build time (where it
 * is undefined). Setting the CSP here in the proxy is the only place it reflects
 * the real runtime value.
 */
function frameAncestorsFromEnv(): string | null {
  const origins: string[] = []

  for (const raw of [getEnvVar("STRAPI_URL")]) {
    if (!raw) continue

    let u: URL
    try {
      u = new URL(raw)
    } catch {
      continue // skip malformed URLs
    }

    origins.push(u.origin)

    if (u.hostname === "127.0.0.1" || u.hostname === "localhost") {
      const port = u.port ? `:${u.port}` : ""
      const altHost = u.hostname === "127.0.0.1" ? "localhost" : "127.0.0.1"
      origins.push(`${u.protocol}//${altHost}${port}`)
    }
  }

  const unique = [...new Set(origins)]

  return unique.length > 0 ? unique.join(" ") : null
}

/**
 * Builds the Content-Security-Policy.
 *
 * The baseline below is intentionally strict — it only allows this app's own
 * origin plus Strapi media over HTTPS. If you add third-party scripts/services
 * (analytics, tag managers, embeds, captchas), allowlist their origins in the
 * relevant directive. Google Tag Manager and Analytics are already allowlisted
 * for `TrackingScripts`, as is unpkg for the cookie banner loaded by GTM's
 * "Cookie Consent v2" template; commented Google Ads examples are left inline
 * as a starting point — uncomment and adjust as needed.
 */
function buildCsp({
  frameAncestors,
  isLocalhostUi,
}: {
  frameAncestors: string | null
  isLocalhostUi: boolean
}): string {
  const isDevelopment = getEnvVar("NODE_ENV") === "development"
  const allowLocalStrapiMedia = isDevelopment || isLocalhostUi

  return [
    "default-src 'self'",
    [
      "script-src 'self' 'unsafe-inline'",
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
      // Google Tag Manager / Analytics
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      // Cookie banner library, loaded by the "Cookie Consent v2" GTM community
      // template (see its "Injects scripts" permission).
      "https://unpkg.com",
      // Example — Google Ads (uncomment if used):
      // "https://www.googleadservices.com",
      // "https://pagead2.googlesyndication.com",
      // "https://googleads.g.doubleclick.net",
    ].join(" "),
    // 'unsafe-inline' covers the <style> block the cookie banner injects at
    // runtime; unpkg is listed because the same library may load its stylesheet
    // as a separate file.
    "style-src 'self' 'unsafe-inline' https://unpkg.com",
    // imgproxy, blob storage and Strapi media are all served over HTTPS.
    [
      "img-src 'self' data: blob: https:",
      ...(allowLocalStrapiMedia ? ["http://127.0.0.1:1337"] : []),
    ].join(" "),
    "font-src 'self' data:",
    [
      "connect-src 'self'",
      // Google Analytics
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      "https://*.googletagmanager.com",
      // Example — Google Ads (uncomment if used):
      // "https://www.googleadservices.com",
      // "https://pagead2.googlesyndication.com",
      // "https://*.doubleclick.net",
      // "https://www.google.com",
    ].join(" "),
    // GTM's <noscript> fallback iframe. Add further framed third parties (e.g.
    // "https://bid.g.doubleclick.net https://td.doubleclick.net" for Ads) here.
    "frame-src 'self' https://www.googletagmanager.com",
    "worker-src 'self' blob:",
    [
      "media-src 'self' blob: https:",
      ...(allowLocalStrapiMedia ? ["http://127.0.0.1:1337"] : []),
    ].join(" "),
    "object-src 'none'",
    frameAncestors
      ? `frame-ancestors ${frameAncestors}`
      : "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ")
}

/**
 * Applies the runtime-dependent security headers to the response:
 * `Content-Security-Policy` (with a runtime `frame-ancestors`) and the
 * conditional `X-Frame-Options`.
 *
 * The static headers (HSTS, X-Content-Type-Options, Referrer-Policy,
 * Permissions-Policy) are set in `next.config` for all routes.
 */
export function withSecurityHeaders(
  req: NextRequest,
  res: NextResponse
): NextResponse {
  // Expose the Strapi origin only after a valid /API/preview flow; public
  // traffic gets frame-ancestors 'none' and never sees STRAPI_URL.
  const isPreview = req.cookies.has(STRAPI_PREVIEW_FRAME_COOKIE)
  const frameAncestors = isPreview ? frameAncestorsFromEnv() : null
  const isLocalhostUi = ["localhost", "127.0.0.1", "::1"].includes(
    req.nextUrl.hostname
  )

  res.headers.set(
    "Content-Security-Policy",
    buildCsp({ frameAncestors, isLocalhostUi })
  )

  // When Strapi preview iframes this app, modern browsers honor frame-ancestors
  // and ignore XFO. Only send DENY when framing is disallowed.
  if (!frameAncestors) {
    res.headers.set("X-Frame-Options", "DENY")
  }

  // A preview response carries frame-ancestors = STRAPI_URL. It must never be
  // stored in a shared cache (a CDN keys by URL, not cookie) — else it gets
  // served to the public and leaks STRAPI_URL. The public, non-preview variant
  // stays cacheable. A fronting CDN must also be configured to bypass cache
  // when the preview cookie is present so previewers reach the origin.
  if (isPreview) {
    res.headers.set("Cache-Control", "private, no-store")
  }

  return res
}
