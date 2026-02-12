import { getEnvVar } from "@/lib/env-vars"

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
 * If the request is private, it retrieves the user token from Better Auth session.
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
    const userToken = await getStrapiUserTokenFromBetterAuth()

    return formatStrapiAuthorizationHeader(userToken)
  }

  const apiToken = isReadOnly
    ? getEnvVar("STRAPI_REST_READONLY_API_KEY")
    : getEnvVar("STRAPI_REST_CUSTOM_API_KEY")

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
 * Get user-permission token from the Better Auth session
 *
 * Uses `typeof window === "undefined"` to detect server vs client environment.
 */
const getStrapiUserTokenFromBetterAuth = async () => {
  const isRSC = globalThis.window === undefined

  if (isRSC) {
    // Server side: Read session directly from cookies (no HTTP request)
    const { headers } = await import("next/headers")
    const { getSessionSSR } = await import("@/lib/auth")
    const session = await getSessionSSR(await headers())

    return session?.user?.strapiJWT
  }

  // Client side: Make HTTP request to /api/auth/session
  const { getSessionCSR } = await import("@/lib/auth-client")
  const { data: session } = await getSessionCSR()

  return session?.user?.strapiJWT
}
