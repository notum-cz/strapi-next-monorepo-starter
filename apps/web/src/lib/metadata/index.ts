import { env } from "@/env.mjs"
import { mergeWith } from "lodash"
import { getTranslations } from "next-intl/server"

import type { AppLocale, NextMetadataTwitterCard } from "@/types/general"
import type { Data, UID } from "@repo/strapi"
import type { Metadata } from "next"

import {
  getDefaultMetadata,
  getDefaultOgMeta,
  getDefaultTwitterMeta,
} from "@/lib/metadata/defaults"
import { fetchSeo } from "@/lib/strapi-api/content/server"

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
      openGraph: defaultOgMeta,
      twitter: defaultTwitterMeta,
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
      openGraph: defaultOgMeta,
      twitter: defaultTwitterMeta,
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
  const res = await fetchSeo(uid, fullPath, locale)
  const seo = res?.data?.seo

  const strapiMeta: Metadata = {
    title: seo?.metaTitle,
    description: seo?.metaDescription,
    keywords: seo?.keywords,
    robots: seo?.metaRobots,
    applicationName: seo?.applicationName,
  }

  const strapiOgMeta: Metadata["openGraph"] = {
    siteName: seo?.siteName ?? undefined,
    title: seo?.metaTitle ?? undefined,
    description: seo?.metaDescription ?? undefined,
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

  const twitterSeo = seo?.twitter

  const strapiTwitterMeta: Metadata["twitter"] = twitterSeo
    ? preprocessTwitterMetadata(twitterSeo)
    : undefined

  return {
    ...mergeWith(defaultMeta, strapiMeta, seoMergeCustomizer),
    openGraph: mergeWith(defaultOgMeta, strapiOgMeta, seoMergeCustomizer),
    twitter: mergeWith(
      defaultTwitterMeta,
      strapiTwitterMeta,
      seoMergeCustomizer
    ),
  }
}

const preprocessTwitterMetadata = (
  twitterSeo: Data.Component<"seo-utilities.seo-twitter">
): Metadata["twitter"] => {
  const card = ["summary", "summary_large_image", "player", "app"].includes(
    String(twitterSeo?.card)
  )
    ? (String(twitterSeo?.card) as NextMetadataTwitterCard)
    : "summary"

  return {
    card,
    title: twitterSeo.title ?? undefined,
    description: twitterSeo.description ?? undefined,
    siteId: twitterSeo.siteId ?? undefined,
    creator: twitterSeo.creator ?? undefined,
    creatorId: twitterSeo.creatorId ?? undefined,
    images:
      twitterSeo.images != null
        ? twitterSeo.images.map((image) => image.url)
        : [],
  }
}

const seoMergeCustomizer = (defaultValue: unknown, strapiValue: unknown) =>
  strapiValue ?? defaultValue
