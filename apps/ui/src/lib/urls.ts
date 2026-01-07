import { env } from "@/env.mjs"

/**
 * Function to get the public URL of the application.
 * Function overloads to make the return type conditional based on the `throwIfMissing` parameter.
 *
 * @param throwIfMissing
 */
// eslint-disable-next-line no-unused-vars
export function getAppPublicUrl(throwIfMissing: true): string
// eslint-disable-next-line no-redeclare, no-unused-vars
export function getAppPublicUrl(throwIfMissing?: false): string | undefined
// eslint-disable-next-line no-redeclare
export function getAppPublicUrl(throwIfMissing = false): string | undefined {
  // Determine the base URL: use APP_PUBLIC_URL on the server or window.location.origin on the client
  const baseUrl =
    typeof window === "undefined" ? env.APP_PUBLIC_URL : window.location.origin

  if (!baseUrl && throwIfMissing) {
    throw new Error(
      "APP_PUBLIC_URL (public URL of site) is not defined (server-side) or location is inaccessible on window (client-side)."
    )
  }

  return baseUrl
}

/**
 * Function to get the public URL of the application.
 * Function overloads to make the return type conditional based on the `throwIfMissing` parameter.
 *
 * @param throwIfMissing
 */
// eslint-disable-next-line no-unused-vars
export function getStrapiUrl(throwIfMissing: true): string
// eslint-disable-next-line no-redeclare, no-unused-vars
export function getStrapiUrl(throwIfMissing?: false): string | undefined
// eslint-disable-next-line no-redeclare
export function getStrapiUrl(throwIfMissing = false): string | undefined {
  const url = env.STRAPI_URL

  if (!url && throwIfMissing) {
    throw new Error("STRAPI_URL (URL of Strapi API) is not defined.")
  }

  return url
}
