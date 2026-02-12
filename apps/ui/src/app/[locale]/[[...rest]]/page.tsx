import { ROOT_PAGE_PATH } from "@repo/shared-data"
import type { Locale } from "next-intl"
import { use } from "react"

import StrapiPageView from "@/components/layouts/StrapiPageView"
import { createFallbackPath, debugStaticParams } from "@/lib/build"
import { isDevelopment } from "@/lib/general-helpers"
import { getMetadataFromStrapi } from "@/lib/metadata"
import { fetchAllPages } from "@/lib/strapi-api/content/server"

// Static/ISR page — no access to headers(), cookies(), or searchParams.
// Use /[locale]/dynamic/[[...rest]] for pages that need runtime context.
//
// "error"        — throws if any dynamic API is used (strict static enforcement)
//                  **Currently fails** because StrapiNavbar in root layout.tsx calls headers()
// "force-static" — silently ignores dynamic APIs (e.g. headers() returns empty,
//                  so server-side auth in navbar will always return null)
//
// To fix: use PPR (experimental) to stream auth dynamically within a static shell,
// move navbar session detection strictly to a client component with a skeleton to avoid layout jump,
// or use "force-dynamic" to SSR every request (no caching, but auth always works).
//
// export const dynamic = "error"
export const dynamic = "force-static"

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
    return [
      {
        locale: "en",
        rest: [""],
      },
    ]
  }

  const results = await fetchAllPages("api::page.page", locale as Locale)

  const params =
    results?.data.map((page) => ({
      locale: page.locale as Locale,
      rest: [page.slug],
    })) ?? []

  debugStaticParams(params, "[[...rest]]")

  // statically generated applications with output: 'export' require at least one entry (even invalid)
  // within the dynamic segment to avoid build errors
  const fallbackPath = createFallbackPath(locale as Locale, {
    rest: ["fallback"],
  })

  return params.length > 0 ? params : [fallbackPath]
}

export async function generateMetadata(
  props: PageProps<"/[locale]/[[...rest]]">
) {
  const params = await props.params
  const locale = params.locale as Locale

  const fullPath = ROOT_PAGE_PATH + (params.rest ?? []).join("/")

  return getMetadataFromStrapi({ fullPath, locale })
}

export default function StaticStrapiPage(
  props: PageProps<"/[locale]/[[...rest]]">
) {
  const params = use(props.params)

  // `props.searchParams`` can't be accessed here because this is statically generated page
  // and searchParams are not available during build time

  return <StrapiPageView params={params} />
}
