import { z } from "zod"

import { addDefaultLocalePathVariants } from "@/lib/cache-paths"
import { purgeCdnCache } from "@/lib/cdn"
import { getEnvVar } from "@/lib/env-vars"
import { logger } from "@/lib/logging"
import { hasValidBearerToken } from "@/lib/verify-bearer-token"

/**
 * CDN purge executor called by Strapi's CDN cache widget. Strapi stores
 * canonical paths, while CDNs cache concrete URL paths; expand default-locale
 * variants right before the purge call.
 */
export async function POST(request: Request) {
  const purgeSecret = getEnvVar("STRAPI_CDN_PURGE_SECRET")
  if (!purgeSecret) {
    return Response.json(
      { message: "Missing CDN purge configuration." },
      { status: 503 }
    )
  }

  // Authenticate from the Authorization header before reading the body so an
  // unauthenticated caller is rejected without any further work.
  if (!hasValidBearerToken(request, purgeSecret)) {
    logger.warn(
      "CDN purge rejected because the bearer token is missing or invalid"
    )

    return Response.json({ message: "Invalid token." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const parsedBody = cdnPurgeRequestSchema.safeParse(body)
  if (!parsedBody.success) {
    return Response.json(
      { message: parsedBody.error.issues[0]?.message ?? "Invalid payload." },
      { status: 400 }
    )
  }

  const payload = parsedBody.data

  const pathsToPurge = new Set<string>()
  addDefaultLocalePathVariants(pathsToPurge, payload.paths)

  logger.debug("Purging CDN paths", { paths: [...pathsToPurge] })

  const outcome = await purgeCdnCache([...pathsToPurge])

  const purgedAt = new Date()
  const responseBody = outcome.reason
    ? {
        purged: outcome.ok,
        paths: [...pathsToPurge],
        at: purgedAt.toISOString(),
        message: outcome.reason,
      }
    : {
        purged: outcome.ok,
        paths: [...pathsToPurge],
        at: purgedAt.toISOString(),
      }

  if (!outcome.ok) {
    return Response.json(responseBody, { status: 502 })
  }

  return Response.json(responseBody)
}

const cdnPurgeRequestSchema = z.object({
  paths: z
    .array(z.string())
    .transform((paths) =>
      paths.map((path) => path.trim()).filter((path) => path.length > 0)
    )
    .refine((paths) => paths.length > 0, {
      message: "Provide at least one path.",
    }),
})
