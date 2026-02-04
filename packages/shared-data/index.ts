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
  paths: Array<string | undefined | null>,
  locale?: string | null
) => {
  const filteredPaths = paths.filter(Boolean) as string[]
  const fullPath = [ROOT_PAGE_PATH, ...filteredPaths]
    .join("/")
    .replace(/\/+/g, "/")

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
 * Maps frontend locale codes (used in URLs and Next.js i18n) to Strapi locale codes (used by the CMS and API).
 * This ensures consistent locale handling between the frontend and Strapi especially for SEO hreflang.
 */
export const feLocaleToStrapiLocaleMap = {
  en: "en", // Default international (English)
  cs: "cs", // Czechia (Czech)
} as const
export const strapiLocaleToFeLocaleMap = {
  en: "en", // Default international (English)
  cs: "cs", // Czechia (Czech)
} as const

/**
 * Derived types (single source of truth)
 */
export type FeLocale = keyof typeof feLocaleToStrapiLocaleMap
export type StrapiLocale = keyof typeof strapiLocaleToFeLocaleMap

/**
 * Returns Strapi Locale from Frontend App Locale.
 * @param feLocale locale on the frontend
 * @returns strapiLocale
 * @example getStrapiLocaleFromFeLocale("cs") => "cs-CZ"
 */
export const getStrapiLocaleFromFeLocale = (
  feLocale?: FeLocale
): StrapiLocale | undefined =>
  feLocale ? feLocaleToStrapiLocaleMap[feLocale] : undefined

/**
 * Returns Frontend App Locale from Strapi Locale.
 * @param strapiLocale locale in Strapi
 * @returns feLocale
 * @example getFeLocaleFromStrapiLocale("cs-CZ") => "cs"
 */
export const getFeLocaleFromStrapiLocale = (
  strapiLocale?: StrapiLocale
): FeLocale | undefined =>
  strapiLocale ? strapiLocaleToFeLocaleMap[strapiLocale] : undefined
