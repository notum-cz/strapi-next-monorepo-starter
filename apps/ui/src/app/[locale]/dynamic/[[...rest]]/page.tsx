import { ROOT_PAGE_PATH } from "@repo/shared-data"
import { notFound } from "next/navigation"
import { use } from "react"

import StrapiPageView from "@/components/layouts/StrapiPageView"
import { getMetadataFromStrapi } from "@/lib/metadata"
import { isValidLocale } from "@/lib/navigation"

// Force dynamic rendering (SSR) for this route
export const dynamic = "force-dynamic"

export async function generateMetadata(
  props: PageProps<"/[locale]/dynamic/[[...rest]]">
) {
  const params = await props.params
  const locale = params.locale
  if (!isValidLocale(locale)) {
    return null
  }

  const fullPath = ROOT_PAGE_PATH + (params.rest ?? []).join("/")

  return getMetadataFromStrapi({ fullPath, locale })
}

export default function DynamicStrapiPage(
  props: PageProps<"/[locale]/dynamic/[[...rest]]">
) {
  const params = use(props.params)
  if (!isValidLocale(params.locale)) {
    notFound()
  }
  // This is a dynamic page, so searchParams are available at runtime
  // and can be accessed here
  const searchParams = use(props.searchParams)

  return <StrapiPageView params={params} searchParams={searchParams} />
}
