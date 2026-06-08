import type { Core } from "@strapi/strapi"
import jwt from "jsonwebtoken"

type ValidationResult =
  | { valid: true; userId: string }
  | { valid: false; error: string }

type HeadersLike = Record<string, string | string[] | undefined>

export const validateAdminToken = (
  strapi: Core.Strapi,
  headers: HeadersLike
): ValidationResult => {
  const authHeader = headers.authorization
  const authHeaderValue = Array.isArray(authHeader) ? authHeader[0] : authHeader

  if (!authHeaderValue) {
    return { valid: false, error: "No token provided" }
  }

  const [scheme, token] = authHeaderValue.split(" ")

  if (scheme !== "Bearer" || !token) {
    return { valid: false, error: "Invalid authorization header" }
  }

  let decoded: { userId?: string }

  try {
    decoded = jwt.verify(token, strapi.config.get("admin.auth.secret")) as {
      userId?: string
    }
  } catch {
    return { valid: false, error: "Invalid token" }
  }

  if (!decoded?.userId) {
    return { valid: false, error: "Invalid token" }
  }

  return { valid: true, userId: decoded.userId }
}
