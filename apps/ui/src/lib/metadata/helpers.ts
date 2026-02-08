import { normalizePageFullPath } from "@repo/shared-data"
import { Locale } from "next-intl"

import type { NextMetadataTwitterCard, SocialMetadata } from "@/types/general"
import type { Data } from "@repo/strapi-types"
import type { Metadata } from "next"
import { StrapiLocalization } from "@/types/api"

import { metaRobots } from "@/lib/metadata/constants"
import { routing } from "@/lib/navigation"

export const preprocessSocialMetadata = (
  seo: Data.Component<"seo-utilities.seo"> | null | undefined,
  canonicalUrl?: string
): SocialMetadata => {
  const twitterSeo = seo?.twitter
  const ogSeo = seo?.og

  const card = ["summary", "summary_large_image", "player", "app"].includes(
    String(twitterSeo?.card)
  )
    ? (String(twitterSeo?.card) as NextMetadataTwitterCard)
    : "summary"

  const ogImage = ogSeo?.image ?? seo?.metaImage
  const twitterImages =
    twitterSeo?.images ?? (seo?.metaImage ? [seo?.metaImage] : undefined)
  return {
    twitter: {
      card,
      title: twitterSeo?.title ?? seo?.metaTitle ?? undefined,
      description: twitterSeo?.description ?? seo?.metaDescription ?? undefined,
      siteId: twitterSeo?.siteId ?? undefined,
      creator: twitterSeo?.creator ?? undefined,
      creatorId: twitterSeo?.creatorId ?? undefined,
      images: twitterImages?.map((img) => img?.url),
    },
    openGraph: {
      siteName: ogSeo?.siteName ?? undefined,
      title: ogSeo?.title ?? seo?.metaTitle ?? undefined,
      description: ogSeo?.description ?? seo?.metaDescription ?? undefined,
      url: ogSeo?.url ?? canonicalUrl ?? undefined,
      images: ogImage
        ? [
            {
              url: ogImage?.url ?? "",
              width: ogImage?.width ?? 0,
              height: ogImage?.height ?? 0,
              alt: ogImage?.alternativeText ?? "",
            },
          ]
        : undefined,
    },
  }
}

export const seoMergeCustomizer = (
  defaultValue: unknown,
  strapiValue: unknown
) => strapiValue ?? defaultValue

export const getMetaRobots = (
  robotsString?: string | Metadata["robots"] | null,
  forbidIndexing?: boolean
) => {
  if (forbidIndexing) {
    return { index: false, follow: false }
  }
  return typeof robotsString === "string"
    ? metaRobots[robotsString.replaceAll(" ", "")]
    : robotsString
}

export const getMetaAlternates = ({
  seo,
  fullPath,
  locale,
  localizations,
}: {
  seo: Data.Component<"seo-utilities.seo"> | null | undefined
  fullPath: string | null
  locale: Locale
  localizations?: StrapiLocalization[]
}) => {
  const canonicalUrl = seo?.canonicalUrl ?? fullPath ?? ""

  // This logic is needed to create the mapping between strapi locales and frontend locales, in case they differ while using regionalized locales. If they are the same, it will just create a mapping with the same values, so it is safe to use in both cases.
  const localizationLanguages = localizations?.map((item) => {
    return {
      strapiLocale: item.locale,
      feLocale: locale,
    }
  })

  const languages = Array.isArray(localizations)
    ? {
        // Only available languages should be added as alternates
        ...localizationLanguages?.reduce((acc, curr) => {
          if (!curr.feLocale) {
            return acc
          }
          return {
            ...acc,
            [curr.strapiLocale]: normalizePageFullPath(
              [canonicalUrl],
              curr.feLocale
            ),
          }
        }, {}),
        // If you are on defaultLocale, it should point to the en version too
        ...(locale === routing.defaultLocale
          ? {
              [routing.defaultLocale]: normalizePageFullPath(
                [canonicalUrl],
                routing.defaultLocale
              ),
            }
          : {}),
        // x-default should be added to point to defaultLocale version if exists
        ...(locale === routing.defaultLocale ||
        localizations?.find((lang) => lang.locale === routing.defaultLocale)
          ? {
              "x-default": normalizePageFullPath(
                [canonicalUrl],
                routing.defaultLocale
              ),
            }
          : {}),
      }
    : undefined

  const canonical = canonicalUrl
    ? normalizePageFullPath([canonicalUrl], locale)
    : undefined

  return {
    canonical,
    languages,
  }
}
