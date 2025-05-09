import type { AppLocale } from "@/types/general"
import type { Metadata } from "next"
import type { getTranslations } from "next-intl/server"

import { routing } from "@/lib/navigation"

type TranslateFn = Awaited<ReturnType<typeof getTranslations>>

export function getDefaultMetadata(
  customMetadata: Metadata | undefined,
  siteUrl: string,
  t: TranslateFn
) {
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: t("keywords"),
    robots: t("metaRobots"),
    applicationName: t("applicationName"),

    icons: {
      icon: "favicon.ico",
    },

    alternates: {
      canonical: siteUrl,
      languages: routing.locales.reduce(
        (acc, locale) => {
          acc[locale] = `${siteUrl}/${locale}`

          return acc
        },
        {} as Record<AppLocale, string>
      ),
    },

    metadataBase: new URL(siteUrl),

    ...customMetadata,
  } as Metadata
}

export function getDefaultOgMeta(
  locale: AppLocale | undefined,
  fullPath: string | undefined,
  t: TranslateFn
): Metadata["openGraph"] {
  return {
    type: "website",
    locale: locale,
    siteName: t("siteName"),
    title: t("metaTitle"),
    description: t("metaDescription"),
    emails: [t("email")],
    images: [t("metaImageUrl")],
    url: `/${locale}${fullPath ?? ""}`,
  }
}

export function getDefaultTwitterMeta(t: TranslateFn): Metadata["twitter"] {
  return {
    card: t("twitter.card"),
    title: t("twitter.title"),
    description: t("twitter.description"),
    siteId: t("twitter.siteId"),
    creator: t("twitter.creator"),
    creatorId: t("twitter.creatorId"),
    images: [t("twitter.imageUrl")],
  } as Metadata["twitter"]
}
