import { getEnvVar } from "@/lib/env-vars"
import { isDevelopment } from "@/lib/general-helpers"

/**
 * Formats a Strapi media URL for use in the UI.
 *
 * In production Strapi stores absolute https:// URLs — returned as-is.
 *
 * In local development (local storage fallback), Strapi stores relative /uploads paths.
 * These are resolved by prepending the Strapi base URL:
 * - Server-side: uses the private STRAPI_URL env var.
 * - Client-side: hardcoded to http://127.0.0.1:1337 (dev only, never reached in production).
 */
export const formatStrapiMediaUrl = (
  imageUrl: string | undefined | null
): string | undefined => {
  if (!imageUrl) {
    return undefined
  }

  if (!imageUrl.startsWith("http") && imageUrl.startsWith("/uploads")) {
    // Local storage (dev only) — prepend Strapi base URL
    if (typeof window === "undefined") {
      return `${getEnvVar("STRAPI_URL")}${imageUrl}`
    }

    // On client side AND in development:
    // we assume Strapi is running locally and use the hardcoded URL.
    // In production this branch is never reached because all media URLs are absolute.
    if (isDevelopment()) {
      return `http://127.0.0.1:1337${imageUrl}`
    }

    return imageUrl
  }

  // Already absolute URL starting with http — return as-is
  return imageUrl
}
