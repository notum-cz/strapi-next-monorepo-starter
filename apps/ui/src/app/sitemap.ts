import { env } from "@/env.mjs"
import { ROOT_PAGE_PATH } from "@repo/shared-data"

import type { MetadataRoute } from "next"
import { AppLocale } from "@/types/general"

import { isDevelopment, isProduction } from "@/lib/general-helpers"
import { routing } from "@/lib/navigation"
import { fetchAllPages } from "@/lib/strapi-api/content/server"

// The URL should be absolute, including the baseUrl (e.g. http://localhost:3000/some/nested-page)
const baseUrl = env.APP_PUBLIC_URL

/**
 * Note: We could use generateSitemaps to separate the sitemaps, however that does not create the root sitemap.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isProduction() && !isDevelopment()) {
    return []
  }

  const promises = routing.locales.map((locale) =>
    generateLocalizedSitemap(locale)
  )
  const results = await Promise.allSettled(promises)

  return results
    .filter((result) => result.status === "fulfilled")
    .reduce((acc, curr) => {
      acc.push(...curr.value)
      return acc
    }, [] as MetadataRoute.Sitemap)
}

/**
 * Fetches all entries in a given collection - by default this is api::page.page
 * and generates sitemap entries for a single locale
 * @param locale locale to retrieve (must be defined in routing `@/lib/navigation`)
 * @returns Sitemap entries for a single locale
 */
async function generateLocalizedSitemap(
  locale: AppLocale
): Promise<MetadataRoute.Sitemap> {
  let pageEntities: Partial<
    Record<PageEntityUID, Awaited<ReturnType<typeof fetchAllPages>>["data"]>
  > = {}

  // Fetch all records for each entity individually
  for (const entityUid of pageEntityUids) {
    const entityResponse = await fetchAllPages(entityUid, locale)

    if (entityResponse.data.length > 0) {
      pageEntities[entityUid] = entityResponse.data
    }
  }

  /**
   * iterate over all pageable collections, and push each entry into the sitemap array,
   * alongside mapping of changeFrequency
   */
  return Object.entries(pageEntities).reduce((acc, [uid, pages]) => {
    pages.forEach((page) => {
      if (page.fullPath) {
        acc.push({
          url: generateSitemapEntryUrl(page.fullPath, String(page.locale)),
          lastModified: page.updatedAt ?? page.createdAt ?? undefined,
          changeFrequency:
            entityChangeFrequency[uid as PageEntityUID] ?? "monthly",
        })
      }
    })
    return acc
  }, [] as MetadataRoute.Sitemap)
}

const generateSitemapEntryUrl = (fullPath: string, locale: string) => {
  const isDefaultLocale = locale === routing.defaultLocale
  let url
  if (fullPath === ROOT_PAGE_PATH) {
    // If this is the default locale, return baseAppUrl
    // otherwise return the localized landing page
    url = isDefaultLocale ? baseUrl : new URL(locale, baseUrl)
  } else {
    url = new URL(
      [isDefaultLocale ? null : ["/", locale], fullPath]
        .flat()
        .filter(Boolean)
        .join(""),

      baseUrl
    )
  }

  return url.toString()
}

// Should you have multiple "pageable" collections, add them to this array
const pageEntityUids = ["api::page.page"] as const

type PageEntityUID = (typeof pageEntityUids)[number]

/**
 * Object that determines default changeFrequency attribute for crawlers.
 * For example, pages may change once a month or year, whereas blog articles could update weekly
 */
const entityChangeFrequency: Record<
  PageEntityUID,
  MetadataRoute.Sitemap[number]["changeFrequency"]
> = {
  "api::page.page": "monthly",
}
