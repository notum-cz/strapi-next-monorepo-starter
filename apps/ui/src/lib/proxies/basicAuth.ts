import { type NextRequest, NextResponse } from "next/server"

import { getEnvVar } from "@/lib/env-vars"

const UNAUTHORIZED_RESPONSE = (message: string) =>
  new NextResponse(message, {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
  })

/**
 * Requires HTTP Basic Authentication when BASIC_AUTH_ENABLED is set.
 * Returns a 401 response if credentials are missing or invalid, null otherwise.
 */
export const basicAuth = (req: NextRequest): NextResponse | null => {
  if (!getEnvVar("BASIC_AUTH_ENABLED")) {
    return null
  }

  const authHeader = req.headers.get("authorization")

  if (!authHeader?.startsWith("Basic ")) {
    return UNAUTHORIZED_RESPONSE("Authentication required")
  }

  try {
    const credentials = atob(authHeader.substring(6))
    const [username, password] = credentials.split(":")

    if (
      username !== getEnvVar("BASIC_AUTH_USERNAME") ||
      password !== getEnvVar("BASIC_AUTH_PASSWORD")
    ) {
      return UNAUTHORIZED_RESPONSE("Invalid credentials")
    }
  } catch {
    return UNAUTHORIZED_RESPONSE("Invalid credentials format")
  }

  return null
}
