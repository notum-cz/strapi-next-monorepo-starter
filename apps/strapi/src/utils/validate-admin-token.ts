import type { Core } from "@strapi/strapi"
import jwt from "jsonwebtoken"

type ValidationResult =
  | { valid: true; userId: string }
  | { valid: false; error: string }

type HeadersLike = Record<string, string | string[] | undefined>

type AdminTokenPayload = {
  userId?: string
  type?: string
  exp?: number
}

export const validateAdminToken = async (
  strapi: Core.Strapi,
  headers: HeadersLike
): Promise<ValidationResult> => {
  const authHeader = headers.authorization
  const authHeaderValue = Array.isArray(authHeader) ? authHeader[0] : authHeader

  if (!authHeaderValue) {
    return { valid: false, error: "No token provided" }
  }

  const [scheme, token] = authHeaderValue.split(" ")

  if (scheme !== "Bearer" || !token) {
    return { valid: false, error: "Invalid authorization header" }
  }

  let decoded: AdminTokenPayload

  try {
    // Pin the algorithm to the admin session default (HS256). Without this,
    // jsonwebtoken accepts any algorithm the secret can verify, opening the
    // door to algorithm-confusion / `alg: none` forgeries. This also rejects
    // expired tokens (JWT throws TokenExpiredError on a past `exp`).
    decoded = jwt.verify(token, strapi.config.get("admin.auth.secret"), {
      algorithms: ["HS256"],
    }) as AdminTokenPayload
  } catch {
    return { valid: false, error: "Invalid token" }
  }

  // Reject tokens that never expire — admin access tokens are always
  // short-lived, so a missing `exp` claim means the token was not issued by
  // the admin session manager.
  if (typeof decoded.exp !== "number") {
    return { valid: false, error: "Invalid token" }
  }

  // Reject refresh (or any non-access) tokens reused as a bearer credential.
  if (decoded.type !== "access") {
    return { valid: false, error: "Invalid token" }
  }

  if (!decoded.userId) {
    return { valid: false, error: "Invalid token" }
  }

  // A token stays cryptographically valid until it expires even after the
  // account is deleted, deactivated, or blocked. Confirm the user still
  // exists and is allowed in before trusting the token.
  const user = await strapi.db.query("admin::user").findOne({
    where: { id: decoded.userId },
    select: ["id", "isActive", "blocked"],
  })

  if (!user || user.blocked || !user.isActive) {
    return { valid: false, error: "Invalid token" }
  }

  return { valid: true, userId: decoded.userId }
}
