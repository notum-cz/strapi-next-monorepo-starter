import { ROOT_PAGE_PATH } from "@repo/shared-data"
import { notFound } from "next/navigation"
import type { Locale } from "next-intl"
import { use } from "react"

import StrapiPageView from "@/components/layouts/StrapiPageView"
import { createFallbackPath, debugStaticParams } from "@/lib/build"
import { getEnvVar } from "@/lib/env-vars"
import { isDevelopment } from "@/lib/general-helpers"
import { getMetadataFromStrapi } from "@/lib/metadata"
import { isValidLocale } from "@/lib/navigation"
import { fetchAllPages } from "@/lib/strapi-api/content/server"

// Static/ISR page — no access to headers(), cookies(), or searchParams.
// Use /[locale]/dynamic/[[...rest]] for pages that need runtime context.
//
// "error"        — throws if any dynamic API is used (strict static enforcement)
// "force-static" — silently ignores dynamic APIs (e.g. headers() returns empty,
//                  so server-side auth in navbar will always return null)
export const dynamic = "error"

// Set ISR revalidation interval: regenerate the page every 5 minutes (300s)
export const revalidate = 300

// Enable ISR generation for pages not returned by generateStaticParams
// First request will SSR the page, then cache it for future requests
export const dynamicParams = true

export async function generateStaticParams({
  params: { locale },
}: {
  // retrieve locales - this is being passed from root layout.tsx's generateStaticParams
  params: { locale: string }
}) {
  if (isDevelopment()) {
    debugStaticParams([], "[[...rest]]", { isDevelopment: true })

    // do not prefetch all locales when developing
    return [{ locale: "en" }]
  }

  const results = await fetchAllPages("api::page.page", locale as Locale)

  const params =
    results?.data.map((page) => ({
      locale: (page.locale ?? locale) as Locale,
      rest:
        page.fullPath === ROOT_PAGE_PATH
          ? []
          : (page.fullPath?.split("/").filter(Boolean) ?? []),
    })) ?? []

  debugStaticParams(params, "[[...rest]]")

  if (params.length > 0) {
    return params
  }

  const isStaticExport = getEnvVar("NEXT_OUTPUT") === "export"
  if (!isStaticExport) {
    return []
  }

  // statically generated applications with output: 'export' require at least one entry (even invalid)
  // within the dynamic segment to avoid build errors
  const fallbackPath = createFallbackPath(locale as Locale, {
    rest: ["fallback"],
  })

  return [fallbackPath]
}

export async function generateMetadata(
  props: PageProps<"/[locale]/[[...rest]]">
) {
  const params = await props.params
  const locale = params.locale
  if (!isValidLocale(locale)) {
    return null
  }

  const fullPath = ROOT_PAGE_PATH + (params.rest ?? []).join("/")

  return getMetadataFromStrapi({ fullPath, locale })
}

export default function StaticStrapiPage(
  props: PageProps<"/[locale]/[[...rest]]">
) {
  const params = use(props.params)
  if (!isValidLocale(params.locale)) {
    notFound()
  }

  // `props.searchParams`` can't be accessed here because this is statically generated page
  // and searchParams are not available during build time

  return <StrapiPageView params={params} />
}
