import { uniq } from "lodash"
import type { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import ComponentsList from "@/app/[locale]/dev/components-overview/components/ComponentsList"
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

export default async function ComponentsOverviewPage({
  params,
}: ExtendedPageProps<"/[locale]/dev/components-overview">) {
  const { locale } = await params
  setRequestLocale(locale)

  const response = await fetchAllPages(locale)

  const pages = response?.data ?? []

  const components = uniq(
    pages.flatMap(
      (page) =>
        page.content?.map(
          (block: { __component: string }) => block.__component
        ) ?? []
    )
  ).sort((a, b) => a.localeCompare(b))

  return (
    <>
      <Typography tag="h1">All Components ({components?.length})</Typography>
      <ComponentsList components={components} pages={pages} />
    </>
  )
}
