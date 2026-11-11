import { ROOT_PAGE_PATH } from "@repo/shared-data"
import { notFound } from "next/navigation"
import type { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { use } from "react"

import { Breadcrumbs } from "@/components/elementary/Breadcrumbs"
import { Container } from "@/components/elementary/Container"
import StrapiStructuredData from "@/components/page-builder/components/seo-utilities/StrapiStructuredData"
import { StrapiDynamicZoneRenderer } from "@/components/page-builder/StrapiDynamicZoneRenderer"
import { fetchPage } from "@/lib/strapi-api/content/server"
import { cn } from "@/lib/styles"

interface Props {
  params: {
    locale: Locale
    rest?: string[]
  }
  searchParams?: Record<string, string | string[] | undefined>
}

export default function StrapiPageView({ params, searchParams }: Props) {
  const { locale } = params

  setRequestLocale(locale)

  const fullPath = ROOT_PAGE_PATH + (params.rest ?? []).join("/")
  const response = use(fetchPage(fullPath, locale))

  const data = response?.data
  if (data?.content == null) {
    notFound()
  }

  const { content, ...restPageData } = data

  return (
    <>
      <StrapiStructuredData structuredData={data?.seo?.structuredData} />

      <main id="top" className={cn("flex w-full flex-col overflow-hidden")}>
        <Container className="mb-10 md:mb-20">
          <Breadcrumbs
            breadcrumbs={response?.meta?.breadcrumbs}
            className="mt-6 mb-6"
            locale={locale}
          />
        </Container>

        <StrapiDynamicZoneRenderer
          dynamicZone={content}
          page={restPageData}
          params={params}
          searchParams={searchParams}
        />
      </main>
    </>
  )
}
