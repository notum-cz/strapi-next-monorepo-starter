import type { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import PageList from "@/app/[locale]/dev/pages-overview/components/PageList"
import Typography from "@/components/typography"
import { logNonBlockingError } from "@/lib/logging"
import { PublicStrapiClient } from "@/lib/strapi-api"
import type { ExtendedPageProps } from "@/types/next"

async function fetchAllPages(locale: Locale) {
  try {
    return await PublicStrapiClient.fetchAll("api::page.page", {
      locale,
      populate: { content: true },
      status: "published",
    })
  } catch (e: unknown) {
    logNonBlockingError({
      message: `Error fetching all pages for locale '${locale}'`,
      error: {
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      },
    })

    return { data: [] }
  }
}

export default async function PagesOverviewPage({
  params,
}: ExtendedPageProps<"/[locale]/dev/pages-overview">) {
  const { locale } = await params
  setRequestLocale(locale)

  const response = await fetchAllPages(locale)

  const pages = response?.data ?? []

  return (
    <>
      <Typography tag="h1">All Pages ({pages?.length})</Typography>
      <PageList pages={pages} />
    </>
  )
}
