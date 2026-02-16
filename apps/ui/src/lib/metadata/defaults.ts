import type { Metadata } from "next"
import type { Locale } from "next-intl"
import type { getTranslations } from "next-intl/server"

import { routing } from "@/lib/navigation"

type TranslateFn = Awaited<ReturnType<typeof getTranslations>>

export function getDefaultMetadata(siteUrl: string, t: TranslateFn) {
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: t("keywords"),
    robots: t("metaRobots"),
    applicationName: t("applicationName"),

    icons: {
      icon: "favicon.ico",
    },

    metadataBase: new URL(siteUrl),
  } as Metadata
}

export function getDefaultOgMeta(
  locale: Locale | undefined,
  fullPath: string | undefined,
  t: TranslateFn
): Metadata["openGraph"] {
  return {
    type: "website",
    locale: locale,
    siteName: t("og.siteName"),
    title: t("og.title"),
    description: t("og.description"),
    images: [t("og.image")],
    url: [routing.defaultLocale !== locale ? locale : null, fullPath ?? ""]
      .filter(Boolean)
      .join("/"),
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
