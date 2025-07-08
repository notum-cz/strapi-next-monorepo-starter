import { draftMode } from "next/headers"

import type { AppLocale } from "@/types/general"

import { PublicStrapiClient } from "@/lib/strapi-api"

export async function fetchPage(fullPath: string, locale: AppLocale) {
  // eslint-disable-next-line no-console
  console.log({ message: `Fetching page: ${locale} - ${fullPath}` })
  const dm = await draftMode()

  try {
    return await PublicStrapiClient.fetchOneByFullPath(
      "api::page.page",
      fullPath,
      {
        locale,
        status: dm.isEnabled ? "draft" : "published",
        populate: {
          content: true, // ensures typing is valid on the resulting object
          seo: true,
        },
        middlewarePopulate: ["content", "seo"], // ensures the middleware is triggered and the populate object is replaced
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
