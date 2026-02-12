import { uniq } from "lodash"
import { notFound } from "next/navigation"
import type { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import ComponentsList from "@/app/[locale]/dev/components-overview/components/ComponentsList"
import Typography from "@/components/typography"
import { isProduction } from "@/lib/general-helpers"
import { logNonBlockingError } from "@/lib/logging"
import { PublicStrapiClient } from "@/lib/strapi-api"

async function fetchAllPages(locale: Locale) {
  try {
    return await PublicStrapiClient.fetchAll("api::page.page", {
      locale,
      populate: { content: true },
      status: "published",
    })
  } catch (e: any) {
    logNonBlockingError({
      message: `Error fetching all pages for locale '${locale}'`,
      error: {
        error: e?.message,
        stack: e?.stack,
      },
    })

    return { data: [] }
  }
}

export default async function ComponentsOverviewPage({
  params,
}: PageProps<"/[locale]/dev/components-overview">) {
  if (isProduction()) {
    notFound()
  }

  const { locale } = (await params) as { locale: Locale }
  setRequestLocale(locale)

  const response = await fetchAllPages(locale)

  const pages = response?.data ?? []

  const components = uniq(
    pages.flatMap(
      (page) => page.content?.map((block: any) => block.__component) ?? []
    )
  ).sort((a, b) => a.localeCompare(b))

  return (
    <>
      <Typography tag="h1">All Components ({components?.length})</Typography>
      <ComponentsList components={components} pages={pages} />
    </>
  )
}
