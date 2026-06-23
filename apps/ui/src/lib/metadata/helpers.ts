import { normalizePageFullPath } from "@repo/shared-data"
import type { Data } from "@repo/strapi-types"
import type { Metadata } from "next"
import type { Locale } from "next-intl"

import { metaRobots } from "@/lib/metadata/constants"
import { routing } from "@/lib/navigation"
import type { StrapiLocalization } from "@/types/api"
import type { NextMetadataTwitterCard, SocialMetadata } from "@/types/general"

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
  let languages: Record<string, string> | undefined

  if (Array.isArray(localizations)) {
    languages = {}

    // Only available languages should be added as alternates
    for (const localization of localizations) {
      if (!localization.locale) {
        continue
      }

      languages[localization.locale] = normalizePageFullPath(
        [canonicalUrl],
        localization.locale
      )
    }

    // If you are on defaultLocale, it should point to the en version too
    if (locale === routing.defaultLocale) {
      languages[routing.defaultLocale] = normalizePageFullPath(
        [canonicalUrl],
        routing.defaultLocale
      )
    }

    // x-default should be added to point to defaultLocale version if exists
    if (
      locale === routing.defaultLocale ||
      localizations.some((lang) => lang.locale === routing.defaultLocale)
    ) {
      languages["x-default"] = normalizePageFullPath(
        [canonicalUrl],
        routing.defaultLocale
      )
    }
  }

  const canonical = canonicalUrl
    ? normalizePageFullPath([canonicalUrl], locale)
    : undefined

  return {
    canonical,
    languages,
  }
}
