import type { Data } from "@repo/strapi-types"
import type { Metadata } from "next"
import type { Locale } from "next-intl"

import { metaRobots } from "@/lib/metadata/constants"
import { createPublicFullPath, isValidLocale, routing } from "@/lib/navigation"
import type { StrapiLocalization } from "@/types/api"
import type { NextMetadataTwitterCard, SocialMetadata } from "@/types/general"

export const preprocessSocialMetadata = (
  seo: Data.Component<"seo-utilities.seo"> | null | undefined,
  canonicalUrl?: string
): SocialMetadata => {
  const twitterSeo = seo?.twitter
  const ogSeo = seo?.og

  const card = ["summary", "summary_large_image", "player", "app"].includes(
    String(twitterSeo?.card?.trim())
  )
    ? (twitterSeo?.card?.trim() as NextMetadataTwitterCard)
    : undefined

  const ogImage = ogSeo?.image ?? seo?.metaImage
  const twitterImages =
    twitterSeo?.images ?? (seo?.metaImage ? [seo?.metaImage] : undefined)

  return {
    twitter: {
      card,
      title: twitterSeo?.title?.trim() || seo?.metaTitle?.trim() || undefined,
      description:
        twitterSeo?.description?.trim() ||
        seo?.metaDescription?.trim() ||
        undefined,
      images: twitterImages?.map((img) => img?.url),
    },
    openGraph: {
      type: ogSeo?.type ?? undefined,
      title: ogSeo?.title?.trim() || seo?.metaTitle?.trim() || undefined,
      description:
        ogSeo?.description?.trim() || seo?.metaDescription?.trim() || undefined,
      url: canonicalUrl,
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
) =>
  typeof strapiValue === "string" && !strapiValue.trim()
    ? defaultValue
    : (strapiValue ?? defaultValue)

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
  fullPath,
  locale,
  localizations,
}: {
  fullPath: string | null
  locale: Locale
  localizations?: StrapiLocalization[]
}) => {
  if (!fullPath) {
    return
  }

  const canonical = createPublicFullPath(fullPath, locale)
  const languages: Record<string, string> = { [locale]: canonical }

  // fetchSeo only populates published translations. Each translation can have
  // a different slug or parent hierarchy, so use its own fullPath.
  for (const localization of localizations ?? []) {
    if (
      !isValidLocale(localization.locale) ||
      !localization.fullPath ||
      localization.locale === locale
    ) {
      continue
    }

    languages[localization.locale] = createPublicFullPath(
      localization.fullPath,
      localization.locale
    )
  }

  // x-default should be added to point to defaultLocale version if exists
  const defaultLanguageUrl = languages[routing.defaultLocale]
  if (defaultLanguageUrl) {
    languages["x-default"] = defaultLanguageUrl
  }

  return { canonical, languages }
}
