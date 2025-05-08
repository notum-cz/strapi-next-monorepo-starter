import type { AppLocale } from "@/types/general"

import { PublicStrapiClient } from "@/lib/strapi-api"

export async function fetchPageData(fullPath: string, locale: AppLocale) {
  // eslint-disable-next-line no-console
  console.log({ message: `Fetching page: ${locale} - ${fullPath}` })

  try {
    return await PublicStrapiClient.fetchOneByFullPath(
      "api::page.page",
      fullPath,
      {
        locale,
        status: "published",
        populate: {
          content: true,
          seo: true,
        },
        // Use with BIG caution, this can lead to a lot of data being fetched
        deepLevel: 6,
        // Ignore these fields when deep populating
        deepLevelIgnore: ["children", "parent", "localizations", "seo"],
      }
    )
  } catch (e: any) {
    console.error({
      message: `Error fetching page: ${locale} - ${fullPath}`,
      data: JSON.stringify({
        error: e?.message,
        stack: e?.stack,
      }),
    })
  }
}
