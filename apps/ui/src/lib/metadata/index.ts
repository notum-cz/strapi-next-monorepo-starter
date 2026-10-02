import type { UID } from "@repo/strapi-types"
import { mergeWith } from "lodash"
import type { Metadata } from "next"
import type { Locale } from "next-intl"

import { getEnvVar } from "@/lib/env-vars"
import { isProduction } from "@/lib/general-helpers"
import { logger } from "@/lib/logging"
import {
  getDefaultMetadata,
  getDefaultOgMeta,
  getDefaultTwitterMeta,
} from "@/lib/metadata/defaults"
import {
  getMetaAlternates,
  getMetaRobots,
  preprocessSocialMetadata,
  seoMergeCustomizer,
} from "@/lib/metadata/helpers"
import { fetchSeo, fetchGlobalMetadata } from "@/lib/strapi-api/content/server"
import type { SocialMetadata } from "@/types/general"

export async function getMetadataFromStrapi({
  fullPath,
  locale,
  customMetadata,
  uid = "api::page.page",
}: {
  fullPath?: string
  locale: Locale
  customMetadata?: Metadata
  // Add more content types here if we want to fetch SEO components for them
  uid?: Extract<UID.ContentType, "api::page.page">
}): Promise<Metadata | null> {
  const siteUrl = getEnvVar("APP_PUBLIC_URL")
  if (!siteUrl) {
    logger.warn("APP_PUBLIC_URL is not defined, cannot generate metadata")

    return null
  }

  const [configuration, response] = await Promise.all([
    fetchGlobalMetadata(),
    fullPath ? fetchSeo(uid, fullPath, locale) : undefined,
  ])
  const applicationName = configuration?.applicationName?.trim()
  // Title priority: social override → SEO title → page title.
  const pageTitle = response?.data?.title?.trim()
  const defaultMeta: Metadata = getDefaultMetadata(
    siteUrl,
    applicationName,
    pageTitle
  )
  defaultMeta.robots = getMetaRobots(defaultMeta.robots, !isProduction())
  defaultMeta.alternates = getMetaAlternates({
    fullPath: fullPath ?? null,
    locale,
  })
  const defaultOgMeta: Metadata["openGraph"] = getDefaultOgMeta(
    locale,
    fullPath,
    configuration?.openGraphConfiguration,
    pageTitle
  )
  const defaultTwitterMeta: Metadata["twitter"] = getDefaultTwitterMeta(
    configuration?.twitterConfiguration,
    pageTitle
  )

  // Routes without a CMS page use only the site configuration and technical defaults.
  if (!fullPath) {
    return {
      ...defaultMeta,
      openGraph: defaultOgMeta,
      twitter: defaultTwitterMeta,
    }
  }

  try {
    return mapStrapiMetadata(
      locale,
      fullPath,
      defaultMeta,
      defaultOgMeta,
      defaultTwitterMeta,
      customMetadata,
      response
    )
  } catch (e: unknown) {
    logger.warn("SEO metadata could not be fetched", {
      uid,
      fullPath,
      error: (e as Error)?.message,
    })

    return {
      ...defaultMeta,
      openGraph: defaultOgMeta,
      twitter: defaultTwitterMeta,
    }
  }
}

function mapStrapiMetadata(
  locale: Locale,
  fullPath: string | null,
  defaultMeta: Metadata,
  defaultOgMeta: Metadata["openGraph"],
  defaultTwitterMeta: Metadata["twitter"],
  customMetadata?: Metadata,
  response?: Awaited<ReturnType<typeof fetchSeo>>
) {
  const forbidIndexing = !isProduction()

  const { seo, localizations } = response?.data || {}

  const strapiMeta: Metadata = {
    title: seo?.metaTitle?.trim() || undefined,
    description: seo?.metaDescription?.trim() || undefined,
    robots: seo?.metaRobots,
  }

  const robots = getMetaRobots(
    seo?.metaRobots?.trim() || defaultMeta.robots,
    forbidIndexing
  )
  const alternates = getMetaAlternates({
    fullPath,
    locale,
    localizations,
  })
  const strapiSocialMeta: SocialMetadata = preprocessSocialMetadata(
    seo,
    alternates?.canonical
  )

  return {
    ...mergeWith(defaultMeta, strapiMeta, seoMergeCustomizer),
    openGraph: mergeWith(
      defaultOgMeta,
      strapiSocialMeta.openGraph,
      seoMergeCustomizer
    ),
    twitter: mergeWith(
      defaultTwitterMeta,
      strapiSocialMeta.twitter,
      seoMergeCustomizer
    ),
    robots,
    alternates,
    ...customMetadata,
  }
}
