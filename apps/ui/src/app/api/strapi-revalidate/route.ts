import type { UID } from "@repo/strapi-types"
import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"

import { addDefaultLocalePathVariants } from "@/lib/cache-paths"
import { getEnvVar } from "@/lib/env-vars"
import { logger } from "@/lib/logging"
import { hasValidBearerToken } from "@/lib/verify-bearer-token"

/**
 * On-demand cache revalidation endpoint triggered by Strapi.
 * Accepts fullPaths and/or tags to selectively invalidate cached Next.js
 * content after publish, unpublish, or hierarchy changes in the CMS.
 *
 * Front Door is not purged here. AFD purge propagation (up to 20 minutes per
 * Microsoft's documentation) is always slower than the page route's TTL, so
 * the natural TTL refresh after `revalidateTag`/`revalidatePath` always wins.
 * Operators can force a purge through the Front Door cache widget on the
 * Strapi homepage when an incident requires a faster eviction.
 */
export async function POST(request: Request) {
  const revalidateSecret = getEnvVar("STRAPI_REVALIDATE_SECRET")
  if (!revalidateSecret) {
    return Response.json(
      { message: "Missing revalidation configuration." },
      { status: 503 }
    )
  }

  // Authenticate from the Authorization header before reading the body so an
  // unauthenticated caller is rejected without any further work.
  if (!hasValidBearerToken(request, revalidateSecret)) {
    logger.warn(
      "Revalidation request rejected because the bearer token is missing or invalid"
    )

    return Response.json({ message: "Invalid token." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: "Invalid JSON body." }, { status: 400 })
  }

  const parsedBody = revalidateRequestSchema.safeParse(body)
  if (!parsedBody.success) {
    return Response.json(
      { message: parsedBody.error.issues[0]?.message ?? "Invalid payload." },
      { status: 400 }
    )
  }

  const payload = parsedBody.data

  const uid = payload.uid
  const pathsToRevalidate = new Set<string>()
  const tagsToRevalidate = new Set<string>(payload.next.tags)

  // Strapi full paths are expanded into default-locale URL variants before
  // calling `revalidatePath`.
  addDefaultLocalePathVariants(pathsToRevalidate, payload.next.fullPaths)

  for (const path of pathsToRevalidate) {
    revalidatePath(path)
  }

  for (const tag of tagsToRevalidate) {
    revalidateTag(tag, "max")
  }

  logger.debug("Invalidated Strapi-driven Next.js cache", {
    uid,
    paths: [...pathsToRevalidate],
    tags: [...tagsToRevalidate],
  })

  const revalidatedAt = new Date()

  return Response.json({
    uid,
    revalidated: true,
    fullPaths: [...pathsToRevalidate],
    tags: [...tagsToRevalidate],
    at: revalidatedAt.toISOString(),
  })
}

const nonEmptyStringArray = z
  .array(z.string())
  .optional()
  .default([])
  .transform((values) =>
    values.map((value) => value.trim()).filter((value) => value.length > 0)
  )

const revalidateRequestSchema = z
  .object({
    uid: z
      .string()
      .trim()
      .min(1, "Missing uid.")
      .transform((uid) => uid as UID.ContentType),
    next: z.object({
      fullPaths: nonEmptyStringArray,
      tags: nonEmptyStringArray,
    }),
  })
  .superRefine((value, ctx) => {
    if (value.next.fullPaths.length === 0 && value.next.tags.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide at least one Next.js path or tag.",
        path: ["next"],
      })
    }
  })
