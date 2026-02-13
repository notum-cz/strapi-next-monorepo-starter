import type { StaticImport } from "next/dist/shared/lib/get-img-props"

import { getEnvVar } from "@/lib/env-vars"

/**
 * Function to format Strapi media URLs. There are 2 types of upload:
 * - S3 bucket - in this case, the URL is already correct and starts with https
 * - local upload - in this case, the URL starts with /uploads and we need to add API url prefix
 * (this happens in route handler for Strapi assets)
 *
 */
export const formatStrapiMediaUrl = (
  imageUrl: string | StaticImport | undefined | null
): string | StaticImport | undefined => {
  if (!imageUrl) {
    return undefined
  }

  if (
    typeof imageUrl === "string" &&
    !imageUrl.startsWith("http") &&
    imageUrl.startsWith("/uploads")
  ) {
    // Local upload - add BE URL prefix
    return typeof window === "undefined"
      ? formatServerUrl(imageUrl)
      : formatClientUrl(imageUrl)
  }

  // S3 upload or already formatted URL - return as is
  return imageUrl
}

const formatClientUrl = (imageUrl: string): string => {
  return `/api/asset${imageUrl}`
}

const formatServerUrl = (imageUrl: string): string => {
  return `${getEnvVar("STRAPI_URL")}${imageUrl}`
}
