import type { AppLocale } from "@/types/general"

import Strapi from "@/lib/strapi"

const seoPopulateObj = {
  seo: {
    populate: {
      twitter: { populate: { images: true } },
      og: true,
      metaImage: true,
    },
  },
} as const

export async function fetchPageData(pageUrl: string, locale: AppLocale) {
  console.log({ message: `Fetching page: ${locale}, ${pageUrl}` })

  try {
    return await Strapi.fetchOneByFullPath("api::page.page", pageUrl, {
      locale,
      status: "published",
      populate: {
        content: true,
        ...seoPopulateObj,
      },
    })
  } catch (e: any) {
    console.error({
      message: `Error fetching page: ${locale}, ${pageUrl}`,
      data: JSON.stringify({
        error: e?.message,
        stack: e?.stack,
      }),
    })
  }
}
