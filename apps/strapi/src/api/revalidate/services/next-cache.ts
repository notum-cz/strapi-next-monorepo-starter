import type { UID } from "@strapi/strapi"

import {
  normalizeFullPaths,
  readRevalidationConfig,
  strapiTag,
} from "./helpers"
import { logger } from "../../../utils/logging"

export type RevalidateNextCacheParams = {
  uid: UID.ContentType
  fullPaths?: string[]
  locale?: string
  tags?: string[]
}

export type RevalidationResponse = {
  fullPaths?: string[]
  tags?: string[]
}

/**
 * Triggers Next.js cache revalidation for the given Strapi entity by POSTing
 * to the UI's `/api/strapi-revalidate` endpoint. Normalizes the input paths,
 * collects the entity's canonical cache tag alongside any explicit tags, and
 * surfaces upstream failures as thrown errors so the caller (admin button,
 * document middleware, hierarchy batch) does not silently proceed.
 *
 * Front Door is intentionally not purged here. AFD purge propagation (up to
 * 20 minutes) is always slower than the affected route's `revalidate` TTL,
 * so the natural TTL refresh after `revalidateTag` wins. Operators can still
 * force a purge through the Front Door cache widget on the Strapi homepage.
 * See `docs/frontend-cache-revalidation.md` for the full reasoning.
 */
export async function revalidateNextCache({
  uid,
  fullPaths = [],
  locale,
  tags = [],
}: RevalidateNextCacheParams): Promise<RevalidationResponse> {
  const normalizedFullPaths = normalizeFullPaths(fullPaths, locale)
  const cacheTags = collectCacheTags(uid, tags)

  if (normalizedFullPaths.length === 0 && cacheTags.length === 0) {
    logger.debug(
      "Next.js cache revalidation skipped because no paths or tags were provided"
    )

    return { fullPaths: [], tags: [] }
  }

  const config = readRevalidationConfig()

  logger.info("Next.js cache revalidation requested", {
    uid,
    locale,
    fullPathCount: normalizedFullPaths.length,
    tagCount: cacheTags.length,
  })

  const response = await fetch(`${config.clientUrl}/api/strapi-revalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uid,
      secret: config.secret,
      next: {
        fullPaths: normalizedFullPaths,
        tags: cacheTags,
      },
    }),
  })

  if (!response.ok) {
    const message = await response.text()

    logger.error("Next.js cache revalidation request failed", {
      uid,
      locale,
      status: response.status,
      responseBody: message,
      fullPaths: normalizedFullPaths,
    })

    throw new Error("Failed to revalidate Next.js cache.")
  }

  return (await response.json()) as RevalidationResponse
}

/**
 * Builds the Next.js Data Cache tag list for the revalidation request. The
 * entity's canonical Strapi tag (`strapi:<uid>`) is always included so that
 * every fetch of this content type is invalidated even if the caller only
 * provided explicit tags.
 */
function collectCacheTags(
  uid: UID.ContentType,
  explicitTags: string[]
): string[] {
  const normalizedExplicitTags = explicitTags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)

  return [...new Set([strapiTag(uid), ...normalizedExplicitTags])]
}
