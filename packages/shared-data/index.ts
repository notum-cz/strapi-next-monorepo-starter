// This value must be in sync with the fullPath of root page in the Strapi
export const ROOT_PAGE_PATH = "/"

/**
 * Join Strapi page path segments into a single normalized path (no duplicate slashes).
 * It always starts with ROOT_PAGE_PATH ("/"). Optionally, locale prefix can be added.
 *
 * Examples (input -> output):
 *   [""]                                   -> "/"
 *   [null, undefined]                      -> "/"
 *   ["/"]                                  -> "/"
 *   ["/", "//", "///"]                     -> "/"
 *   ["slug"]                               -> "/slug"
 *   ["/slug"]                              -> "/slug"
 *   ["/", "/slug"]                         -> "/slug"
 *   ["/parent", "slug"]                    -> "/parent/slug"
 *   ["/parent", "/slug"]                   -> "/parent/slug"
 *   ["/parent/", "/slug"]                  -> "/parent/slug"
 *   ["/parent/1", "/slug"]                 -> "/parent/1/slug"
 *   ["/parent/1", "slug"]                  -> "/parent/1/slug"
 *   ["parent/1", "slug"]                   -> "/parent/1/slug"
 *   ["/granparent/parent", "child/kid"]    -> "/granparent/parent/child/kid"
 *
 *   With locale:
 *   ["", ""], "en"                         -> "/en"
 *   ["/"], "en"                            -> "/en"
 *   ["", "slug"], "en"                     -> "/en/slug"
 *   ["/parent", "slug"], "en"              -> "/en/parent/slug"
 *   ["/en/parent", "slug"], "en"           -> "/en/parent/slug"
 */
export const normalizePageFullPath = (
  paths: (string | undefined | null)[],
  locale?: string | null
) => {
  const filteredPaths = paths.filter(Boolean) as string[]
  const rawPath = [ROOT_PAGE_PATH, ...filteredPaths]
    .join("/")
    .replaceAll(/\/+/g, "/")
  // Strip trailing slash except for the root path itself
  const fullPath = rawPath !== "/" ? rawPath.replace(/\/$/, "") : rawPath

  if (locale) {
    // make sure not to add same locale twice
    if (fullPath.startsWith(`/${locale}/`) || fullPath === `/${locale}`) {
      return fullPath
    }

    return `/${locale}${fullPath === "/" ? "" : fullPath}`
  }

  return fullPath
}

/**
 * Next.js Data Cache tag for a Strapi content type, e.g.
 * `strapiCacheTag("api::page.page")` -> `"strapi:api::page.page"`.
 *
 * Shared between Strapi and the UI so both sides derive the exact same tag:
 * the UI stamps fetches with it, and Strapi sends it on publish to invalidate
 * those fetches. They must match byte-for-byte or `revalidateTag` no-ops.
 *
 * Typed against a plain string so this package stays framework-agnostic;
 * callers pass their Strapi content-type UID (already a string).
 */
export type StrapiCacheTag<TUid extends string = string> = `strapi:${TUid}`

export const strapiCacheTag = <TUid extends string>(
  uid: TUid
): StrapiCacheTag<TUid> => `strapi:${uid}`

/**
 * Normalizes a path for cache operations (Next.js revalidation or CDN purge).
 * Wildcard paths (`/jobs/*`, `/*`) are preserved as-is, only ensuring a leading
 * slash; concrete paths collapse to their canonical form via
 * `normalizePageFullPath`. Pass `locale` when the caller knows it.
 *
 * Shared so Strapi (building revalidate/purge payloads) and the UI (expanding
 * locale variants before `revalidatePath`/CDN purge) normalize identically.
 */
export const normalizeCachePath = (
  path: string,
  locale?: string | null
): string => {
  const trimmed = path.trim()

  if (trimmed.includes("*")) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  }

  return normalizePageFullPath([trimmed], locale)
}
