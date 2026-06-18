import { createHash, timingSafeEqual } from "node:crypto"

/**
 * Constant-time check that a request carries `Authorization: Bearer <expected>`.
 *
 * Both tokens are SHA-256 hashed before comparison so `timingSafeEqual` always
 * receives equal-length buffers (it throws otherwise) and the comparison never
 * leaks the token length through timing. Used by the Strapi-driven cache
 * revalidation and CDN purge endpoints to authenticate the calling backend.
 */
export function hasValidBearerToken(
  request: Request,
  expected: string
): boolean {
  const header = request.headers.get("authorization")?.trim()

  if (!header) {
    return false
  }

  const separatorIndex = header.indexOf(" ")
  const scheme = separatorIndex === -1 ? "" : header.slice(0, separatorIndex)
  const provided =
    separatorIndex === -1 ? "" : header.slice(separatorIndex + 1).trim()

  if (scheme.toLowerCase() !== "bearer" || !provided) {
    return false
  }

  const providedHash = createHash("sha256").update(provided).digest()
  const expectedHash = createHash("sha256").update(expected).digest()

  return timingSafeEqual(providedHash, expectedHash)
}
