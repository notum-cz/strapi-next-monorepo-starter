/**
 * Wrapper around the BaseStrapiClient fetch methods
 * Provides convenience functions for common API calls
 */

import type { AppLocalizedParams, CustomFetchOptions } from "@/types/general"

import BaseStrapiClient, { API_ENDPOINTS } from "./base"

/**
 * Public fetch - for unauthenticated requests
 */
export async function fetchAPI(
  path: string,
  params?: AppLocalizedParams<Record<string, any>>,
  requestInit?: RequestInit,
  options?: CustomFetchOptions
) {
  const client = new BaseStrapiClient() as any
  return client.fetchAPI(path, params, requestInit, options)
}

/**
 * Client-side fetch - for browser requests (with limited auth)
 */
export async function fetchClientAPI(endpoint: string) {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"

  try {
    const response = await fetch(`${baseUrl}/api/${endpoint}`)

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("[fetchClientAPI] Error:", error)
    throw error
  }
}
