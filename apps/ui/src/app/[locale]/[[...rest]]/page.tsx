import { notFound } from "next/navigation"
import { ROOT_PAGE_PATH } from "@repo/shared-data"
import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { isDevelopment } from "@/lib/general-helpers"
import { getMetadataFromStrapi } from "@/lib/metadata"
import { fetchAllPages, fetchPage } from "@/lib/strapi-api/content/server"
import { cn } from "@/lib/styles"
import { Breadcrumbs } from "@/components/elementary/Breadcrumbs"
import { Container } from "@/components/elementary/Container"
import { ErrorBoundary } from "@/components/elementary/ErrorBoundary"
import { PageContentComponents } from "@/components/page-builder"
import StrapiStructuredData from "@/components/page-builder/components/seo-utilities/StrapiStructuredData"

// Allow this dynamic route to behave like a static/ISR page
// even if slugs are unknown at build time or STRAPI_URL is not defined
// or fetching fails
export const dynamic = "force-static"

// Set ISR revalidation interval: regenerate the page every 5 minutes (300s)
export const revalidate = 300

// Enable on-demand generation for pages not returned by generateStaticParams
// First request will SSR the page, then cache it for future requests
export const dynamicParams = true

export async function generateStaticParams({
  params: { locale },
}: {
  // retrieve locales - this is being passed from root layout.tsx's generateStaticParams
  params: { locale: string }
}) {
  if (isDevelopment()) {
    // do not prefetch all locales when developing
    return [
      {
        locale: "en",
        rest: [""],
      },
    ]
  }

  const results = await fetchAllPages("api::page.page", locale as Locale)

  const params = results?.data.map((page) => ({
    locale: page.locale as Locale,
    rest: [page.slug],
  }))

  return params ?? []
}

export async function generateMetadata(
  props: PageProps<"/[locale]/[[...rest]]">
) {
  const params = await props.params
  const locale = params.locale as Locale

  const fullPath = ROOT_PAGE_PATH + (params.rest ?? []).join("/")

  return getMetadataFromStrapi({ fullPath, locale })
}

export default async function StrapiPage(
  props: PageProps<"/[locale]/[[...rest]]">
) {
  const params = await props.params
  const locale = params.locale as Locale

  setRequestLocale(locale)

  const fullPath = ROOT_PAGE_PATH + (params.rest ?? []).join("/")
  const response = await fetchPage(fullPath, locale)

  const data = response?.data

  if (data?.content == null) {
    notFound()
  }

  const { content, ...restPageData } = data

  return (
    <>
      <StrapiStructuredData structuredData={data?.seo?.structuredData} />

      <main className={cn("flex w-full flex-col overflow-hidden")}>
        <Container>
          <Breadcrumbs
            breadcrumbs={response?.meta?.breadcrumbs}
            className="mt-6 mb-6"
          />
        </Container>

        {content
          .filter((comp) => comp != null)
          .map((comp) => {
            const name = comp.__component
            const id = comp.id
            const key = `${name}-${id}`
            const Component = PageContentComponents[name]
            if (Component == null) {
              console.warn(`Unknown component "${name}" with id "${id}".`)

              return (
                <div key={key} className="font-medium text-red-500">
                  Component &quot;{key}&quot; is not implemented on the
                  frontend.
                </div>
              )
            }

            // TODO: Resolve dynamic import issue with NextJS 15
            // const Component = dynamic<{
            // 	component: typeof comp
            // 	pageParams: Awaited<Props['params']>
            // 	page: typeof data
            // 	// breadcrumbs: typeof breadcrumbs
            // }>(() => import(`@/components/page-builder${componentPath}`))

            return (
              <ErrorBoundary key={key}>
                <div className={cn("mb-4 md:mb-12 lg:mb-16")}>
                  <Component
                    component={comp}
                    pageParams={params}
                    page={restPageData}
                  />
                </div>
              </ErrorBoundary>
            )
          })}
      </main>
    </>
  )
}
