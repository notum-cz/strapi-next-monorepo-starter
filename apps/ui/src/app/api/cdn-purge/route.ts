import { z } from "zod"

import { addDefaultLocalePathVariants } from "@/lib/cache-paths"
import { purgeCdnCache } from "@/lib/cdn"
import { getEnvVar } from "@/lib/env-vars"

/**
 * CDN purge executor called by Strapi's CDN cache widget. Strapi stores
 * canonical paths, while CDNs cache concrete URL paths; expand default-locale
 * variants right before the purge call.
 */
export async function POST(request: Request) {
  const revalidateSecret = getEnvVar("STRAPI_REVALIDATE_SECRET")
  if (!revalidateSecret) {
    return Response.json(
      { message: "Missing revalidation configuration." },
      { status: 503 }
    )
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

  if (payload.secret !== revalidateSecret) {
    console.warn("CDN purge rejected invalid token")

    return Response.json({ message: "Invalid token." }, { status: 401 })
  }

  const pathsToPurge = new Set<string>()
  addDefaultLocalePathVariants(pathsToPurge, payload.paths)

  console.debug("Purging CDN paths", { paths: [...pathsToPurge] })

  const outcome = await purgeCdnCache([...pathsToPurge])

  const responseBody = {
    purged: outcome.ok,
    paths: [...pathsToPurge],
    at: new Date().toISOString(),
    ...(outcome.reason ? { message: outcome.reason } : {}),
  }

  if (!outcome.ok) {
    return Response.json(responseBody, { status: 502 })
  }

  return Response.json(responseBody)
}

const cdnPurgeRequestSchema = z.object({
  secret: z.string(),
  paths: z
    .array(z.string())
    .transform((paths) =>
      paths.map((path) => path.trim()).filter((path) => path.length > 0)
    )
    .refine((paths) => paths.length > 0, {
      message: "Provide at least one path.",
    }),
})
