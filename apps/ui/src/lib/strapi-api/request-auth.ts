import { env } from "@/env.mjs"
import { getSession } from "next-auth/react"

import { getAuth } from "@/lib/auth"

const ALLOWED_STRAPI_ENDPOINTS: Record<string, string[]> = {
  GET: [
    "api/pages",
    "api/footer",
    "api/navbar",
    "api/users/me",
    "api/auth/local",
    // Allow specific providers callbacks if needed
    // "api/auth/[provider]/callback",
  ],
  POST: [
    "api/subscribers",
    "api/auth/local/register",
    "api/auth/forgot-password",
    "api/auth/reset-password",
    "api/auth/change-password",
  ],
}

/**
 * Check if the given Strapi Admin/API path is allowed to be accessed
 * with the provided HTTP method.
 */
export const isStrapiEndpointAllowed = (
  path: string,
  method: string
): boolean => {
  return (
    ALLOWED_STRAPI_ENDPOINTS[method]?.some((endpoint) =>
      path.startsWith(endpoint)
    ) ?? false
  )
}

/**
 * Create Strapi authorization header based on the request type.
 * If the request is private, it retrieves the user token from NextAuth.
 * If the request is public, it uses the appropriate API token based on read-only status.
 */
export const createStrapiAuthHeader = async ({
  isReadOnly,
  isPrivate,
}: {
  isReadOnly?: boolean
  isPrivate: boolean
}) => {
  if (isPrivate) {
    const userToken = await getStrapiUserTokenFromNextAuth()
    return formatStrapiAuthorizationHeader(userToken)
  }

  const apiToken = isReadOnly
    ? env.STRAPI_REST_READONLY_API_KEY
    : env.STRAPI_REST_CUSTOM_API_KEY

  return formatStrapiAuthorizationHeader(apiToken)
}

export const formatStrapiAuthorizationHeader = (token?: string) => {
  if (!token) {
    return {} as Record<string, string>
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

/**
 * Get user-permission token from the NextAuth session
 */
const getStrapiUserTokenFromNextAuth = async () => {
  const isRSC = typeof window === "undefined"
  if (isRSC) {
    // server side
    const session = await getAuth()
    return session?.strapiJWT
  }

  // client side
  // this makes HTTP request to /api/auth/session to get the session
  // this is not the best solution because it makes HTTP request to the server
  // but useSession() can't be used here
  const session = await getSession()
  return session?.strapiJWT
}
