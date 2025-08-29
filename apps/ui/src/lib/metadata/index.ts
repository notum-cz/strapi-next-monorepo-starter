import { env } from "@/env.mjs"
import { mergeWith } from "lodash"
import { getTranslations } from "next-intl/server"

import type { AppLocale, NextMetadataTwitterCard } from "@/types/general"
import type { Data, UID } from "@repo/strapi"
import type { Metadata } from "next"

import { debugSeoGeneration } from "@/lib/metadata/debug"
import {
  getDefaultMetadata,
  getDefaultOgMeta,
  getDefaultTwitterMeta,
} from "@/lib/metadata/defaults"
import {
  generateDescriptionFromContent,
  generateDescriptionFromTitle,
  generateKeywordsFromPage,
  generateMetaTitle,
} from "@/lib/metadata/fallbacks"
import { fetchPage, fetchSeo } from "@/lib/strapi-api/content/server"

export async function getMetadataFromStrapi({
  fullPath,
  locale,
  customMetadata,
  uid = "api::page.page",
}: {
  fullPath?: string
  locale: AppLocale
  customMetadata?: Metadata
  // Add more content types here if we want to fetch SEO components for them
  uid?: Extract<UID.ContentType, "api::page.page">
}): Promise<Metadata | null> {
  const t = await getTranslations({ locale, namespace: "seo" })

  const siteUrl = env.APP_PUBLIC_URL

  if (!siteUrl) {
    console.error(
      "Please provide APP_PUBLIC_URL (public URL of site) for SEO metadata generation."
    )
    return null
  }

  const defaultMeta: Metadata = getDefaultMetadata(customMetadata, siteUrl, t)
  const defaultOgMeta: Metadata["openGraph"] = getDefaultOgMeta(
    locale,
    fullPath,
    t
  )
  const defaultTwitterMeta: Metadata["twitter"] = getDefaultTwitterMeta(t)

  // skip strapi fetching and return SEO from translations
  if (!fullPath) {
    return {
      ...defaultMeta,
    }
  }

  try {
    return await fetchAndMapStrapiMetadata(
      locale,
      fullPath,
      defaultMeta,
      defaultOgMeta,
      defaultTwitterMeta,
      uid
    )
  } catch (e: unknown) {
    console.warn(
      `SEO for ${uid} content type ("${fullPath}") wasn't fetched: `,
      (e as Error)?.message
    )
    return {
      ...defaultMeta,
    }
  }
}

async function fetchAndMapStrapiMetadata(
  locale: AppLocale,
  fullPath: string | null,
  defaultMeta: Metadata,
  defaultOgMeta: Metadata["openGraph"],
  defaultTwitterMeta: Metadata["twitter"],
  uid: Extract<UID.ContentType, "api::page.page"> = "api::page.page"
) {
  const [seoRes, pageRes] = await Promise.all([
    fetchSeo(uid, fullPath, locale),
    fullPath ? fetchPage(fullPath, locale) : null,
  ])

  const seo = seoRes?.data?.seo
  const pageData = pageRes?.data || seoRes?.data

  // Generate comprehensive fallbacks from page data
  const fallbackTitle = pageData?.title || pageData?.breadcrumbTitle
  const fallbackMetaTitle = generateMetaTitle(fallbackTitle, seo?.siteName)
  const fallbackDescription =
    generateDescriptionFromContent(pageData?.content) ||
    generateDescriptionFromTitle(fallbackTitle)
  const fallbackKeywords = generateKeywordsFromPage(
    pageData?.title,
    pageData?.breadcrumbTitle,
    pageData?.slug
  )

  const strapiMeta: Metadata = {
    title: seo?.metaTitle || fallbackMetaTitle || fallbackTitle,
    description: seo?.metaDescription || fallbackDescription,
    keywords: seo?.keywords || fallbackKeywords,
    robots: seo?.metaRobots,
    applicationName: seo?.applicationName,
    alternates: {
      canonical:
        seo?.canonicalUrl ||
        (fullPath ? `${env.APP_PUBLIC_URL}/${locale}${fullPath}` : undefined),
    },
  }

  const strapiOgMeta: Metadata["openGraph"] = {
    siteName: seo?.siteName ?? undefined,
    title: seo?.metaTitle || fallbackTitle,
    description: seo?.metaDescription || fallbackDescription,
    emails: seo?.email ?? undefined,
    images: seo?.metaImage
      ? [
          {
            url: seo.metaImage.url,
            width: seo.metaImage.width,
            height: seo.metaImage.height,
            alt: seo.metaImage.alternativeText,
          },
        ]
      : undefined,
  }

  const finalMetadata = {
    ...mergeWith(defaultMeta, strapiMeta, seoMergeCustomizer),
    openGraph: mergeWith(defaultOgMeta, strapiOgMeta, seoMergeCustomizer),
  }

  // Debug in development
  debugSeoGeneration(finalMetadata, pageData, seo, fullPath || "Unknown page")

  return finalMetadata
}

const seoMergeCustomizer = (defaultValue: unknown, strapiValue: unknown) =>
  strapiValue ?? defaultValue
