import { normalizeCachePath } from "@repo/shared-data"

export type RevalidationConfig = {
  clientUrl: string
  secret: string
}

export const getNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Reads the env configuration required for any UI-bound revalidation or
 * CDN purge call. Throws when either variable is missing — without
 * them the request cannot reach the UI or authenticate against it.
 */
export function readRevalidationConfig(): RevalidationConfig {
  const clientUrl = process.env.CLIENT_URL
  const secret = process.env.STRAPI_REVALIDATE_SECRET

  if (!clientUrl || !secret) {
    console.error("Revalidation configuration is missing", {
      hasClientUrl: Boolean(clientUrl),
      hasSecret: Boolean(secret),
    })

    throw new Error(
      "Revalidation configuration missing. Ensure CLIENT_URL and STRAPI_REVALIDATE_SECRET are set."
    )
  }

  return { clientUrl, secret }
}

/**
 * Trims, drops empty entries, and deduplicates a list of path strings, then
 * normalizes each via the shared `normalizeCachePath` (wildcards preserved,
 * concrete paths canonicalized). Used for both Next.js revalidation paths and
 * CDN purge paths. Pass `locale` when the call site knows which locale the
 * paths belong to.
 */
export function normalizeFullPaths(
  rawPaths: Iterable<string>,
  locale?: string
): string[] {
  return [
    ...new Set(
      [...rawPaths]
        .map((path) => (typeof path === "string" ? path.trim() : ""))
        .filter((path) => path.length > 0)
        .map((path) => normalizeCachePath(path, locale))
    ),
  ]
}
