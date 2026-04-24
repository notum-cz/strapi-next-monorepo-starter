import { normalizePageFullPath } from "@repo/shared-data"
import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"

import { purgeCDNCache } from "@/lib/cdn"
import { getEnvVar } from "@/lib/env-vars"
import { routing } from "@/lib/navigation"

/**
 * On-demand cache revalidation endpoint triggered by Strapi.
 * Accepts fullPaths and/or tags to selectively invalidate cached content
 * after publish, unpublish, or hierarchy changes in the CMS.
 */
export async function POST(request: Request) {
  const revalidateSecret = getEnvVar("STRAPI_REVALIDATE_SECRET")
  if (!revalidateSecret) {
    return Response.json(
      { message: "Missing revalidation configuration." },
      { status: 404 }
    )
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

  if (payload.secret !== revalidateSecret) {
    return Response.json({ message: "Invalid token." }, { status: 401 })
  }

  const uid = payload.uid
  const tagsToRevalidate = new Set<string>(payload.tags)
  const pathsToRevalidate = new Set<string>()

  for (const path of payload.fullPaths) {
    for (const variant of deriveDefaultLocaleVariants(path)) {
      pathsToRevalidate.add(variant)
    }
  }

  if (pathsToRevalidate.size === 0 && tagsToRevalidate.size === 0) {
    return Response.json(
      { message: "Provide fullPaths or at least one tag." },
      { status: 400 }
    )
  }

  for (const path of pathsToRevalidate) {
    revalidatePath(path)
  }

  for (const tag of tagsToRevalidate) {
    revalidateTag(tag, "max")
  }

  console.debug(
    `[revalidate] Completed for uid="${uid}" paths=${JSON.stringify([...pathsToRevalidate])} tags=${JSON.stringify([...tagsToRevalidate])}`
  )

  // TODO: Implement CDN cache purging logic.
  // Paths can be purged individually
  // Tags either need to purge all content (changes in global single types like navbar, footer)
  // or we need to track usage of tags per page to purge selectively
  const purged = await purgeCDNCache([...pathsToRevalidate])

  return Response.json({
    uid,
    revalidated: true,
    fullPaths: [...pathsToRevalidate],
    tags: [...tagsToRevalidate],
    cdnPurged: purged,
    at: new Date().toISOString(),
  })
}

/**
 * Normalizes an input page path and returns all cache-path variants that
 * should be revalidated for the default locale.
 *
 * For default-locale-prefixed paths (e.g. `/en/about`), this includes both
 * the prefixed and unprefixed variants (e.g. `/en/about`, `/about`).
 * For the default locale root (`/en`), this includes `/` as well.
 */
const deriveDefaultLocaleVariants = (path: string): string[] => {
  const normalizedPath = normalizePageFullPath([path])
  const defaultLocalePrefix = `/${routing.defaultLocale}`

  if (
    normalizedPath === defaultLocalePrefix ||
    normalizedPath === `${defaultLocalePrefix}/`
  ) {
    return [normalizedPath, "/"]
  }

  if (normalizedPath.startsWith(`${defaultLocalePrefix}/`)) {
    const pathWithoutDefaultLocale = normalizePageFullPath([
      normalizedPath.slice(defaultLocalePrefix.length),
    ])

    return [normalizedPath, pathWithoutDefaultLocale]
  }

  return [normalizedPath]
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
    uid: z.string().trim().min(1, "Missing uid."),
    fullPaths: nonEmptyStringArray,
    tags: nonEmptyStringArray,
    secret: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.fullPaths.length === 0 && value.tags.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide fullPaths or at least one tag.",
        path: ["fullPaths"],
      })
    }
  })
