import { env } from "@/env.mjs"

export const getEnvVariableValue = (varName: string) =>
  // @ts-expect-error - accessing dynamic env variable
  typeof window === "undefined" ? env?.[varName] : window.CSR_CONFIG?.[varName]

/**
 * Function to get the public URL of the application.
 * Function overloads to make the return type conditional based on the `throwIfMissing` parameter.
 *
 * @param throwIfMissing
 */

export function getAppPublicUrl(throwIfMissing: true): string

export function getAppPublicUrl(throwIfMissing?: false): string | undefined

export function getAppPublicUrl(throwIfMissing = false): string | undefined {
  // Determine the base URL: use APP_PUBLIC_URL on the server or window.location.origin on the client
  const baseUrl = getEnvVariableValue("APP_PUBLIC_URL")

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

export function getStrapiUrl(throwIfMissing: true): string

export function getStrapiUrl(throwIfMissing?: false): string | undefined

export function getStrapiUrl(throwIfMissing = false): string | undefined {
  const url = env.STRAPI_URL

  if (!url && throwIfMissing) {
    throw new Error("STRAPI_URL (URL of Strapi API) is not defined.")
  }

  return url
}
