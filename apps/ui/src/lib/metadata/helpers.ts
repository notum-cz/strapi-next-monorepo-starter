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

/**
 * Builds the public path of a page in the given locale. Routing uses
 * `localePrefix: "as-needed"`, so the default locale is served without a
 * prefix (`/en/about` 307-redirects to `/about`). Canonical and hreflang URLs
 * must point at the final URL, never at a redirect. An explicit default-locale
 * prefix (e.g. in a CMS override) is dropped first, so other locales are
 * applied to the locale-independent path (`/en/x` → `/cs/x`, not `/cs/en/x`).
 */
const getLocalizedPagePath = (path: string, locale: string) => {
  const defaultLocaleRoot = `/${routing.defaultLocale}`
  let localeIndependentPath = normalizePageFullPath([path])

  if (localeIndependentPath === defaultLocaleRoot) {
    localeIndependentPath = "/"
  } else if (localeIndependentPath.startsWith(`${defaultLocaleRoot}/`)) {
    localeIndependentPath = localeIndependentPath.slice(
      defaultLocaleRoot.length
    )
  }

  return normalizePageFullPath(
    [localeIndependentPath],
    locale === routing.defaultLocale ? null : locale
  )
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

      // Slugs are localized: without a CMS override, use the version's own path
      languages[localization.locale] = getLocalizedPagePath(
        seo?.canonicalUrl ?? localization.fullPath ?? canonicalUrl,
        localization.locale
      )
    }

    // hreflang must be self-referencing: Strapi `localizations` lists only the
    // other locales, so add the current one explicitly
    languages[locale] = getLocalizedPagePath(canonicalUrl, locale)

    // x-default should point to the defaultLocale version if it exists
    const defaultLocalePath = languages[routing.defaultLocale]
    if (defaultLocalePath) {
      languages["x-default"] = defaultLocalePath
    }
  }

  const canonical = canonicalUrl
    ? getLocalizedPagePath(canonicalUrl, locale)
    : undefined

  return {
    canonical,
    languages,
  }
}
