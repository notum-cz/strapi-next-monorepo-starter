import { getEnvVar } from "@/lib/env-vars"

const LOCAL_STRAPI_MEDIA_URL = "http://127.0.0.1:1337"

/**
 * Formats a Strapi media URL for use in the UI.
 *
 * Production media should already be absolute, usually from Azure Blob Storage, AWS S3
 * or another public storage/CDN origin.
 *
 * Local Strapi upload storage returns relative `/uploads/...` paths. Those
 * need a Strapi origin before they can be rendered directly or passed through
 * imgproxy.
 */
export const formatStrapiMediaUrl = (
  imageUrl: string | undefined | null
): string | undefined => {
  if (!imageUrl) {
    return undefined
  }

  if (!imageUrl.startsWith("http") && imageUrl.startsWith("/uploads")) {
    // Server components can use the private Strapi origin. This keeps STRAPI_URL
    // out of the browser while still producing absolute media URLs in SSR/RSC.
    if (typeof window === "undefined") {
      return `${getEnvVar("STRAPI_URL")}${imageUrl}`
    }

    // Client components cannot read STRAPI_URL. When the UI itself is running
    // on a local host, assume the matching local Strapi instance is on 1337.
    // This also covers `next build && next start`, where NODE_ENV is production.
    const isLocalhostUi = ["localhost", "127.0.0.1", "::1"].includes(
      window.location.hostname
    )
    if (isLocalhostUi) {
      return `${LOCAL_STRAPI_MEDIA_URL}${imageUrl}`
    }

    // Non-local browser builds should not receive relative Strapi upload URLs.
    // In deployed environments, media is expected to come from absolute storage
    // URLs; returning the original value makes misconfigured content visible.
    return imageUrl
  }

  // Absolute media URLs and non-upload paths are already usable as provided.
  return imageUrl
}
