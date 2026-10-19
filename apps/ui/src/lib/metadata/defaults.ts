import type { Data } from "@repo/strapi-types"
import type { Metadata } from "next"
import type { Locale } from "next-intl"

import { createPublicFullPath } from "@/lib/navigation"

export function getDefaultMetadata(
  siteUrl: string,
  applicationName?: string,
  title?: string
): Metadata {
  return {
    title: title?.trim() || undefined,
    robots: { index: false, follow: false },
    applicationName: applicationName?.trim() || undefined,

    icons: {
      icon: [
        { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
        { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "256x256" }],
    },

    metadataBase: new URL(siteUrl),
  }
}

export function getDefaultOgMeta(
  locale: Locale,
  fullPath: string | undefined,
  configuration?: Data.Component<"seo-utilities.open-graph-configuration"> | null,
  title?: string
): Metadata["openGraph"] {
  return {
    type: "website",
    locale: locale,
    siteName: configuration?.siteName?.trim() || undefined,
    title: title?.trim() || undefined,
    url: fullPath ? createPublicFullPath(fullPath, locale) : undefined,
  }
}

export function getDefaultTwitterMeta(
  configuration?: Data.Component<"seo-utilities.twitter-configuration"> | null,
  title?: string
): Metadata["twitter"] {
  return {
    card: "summary",
    title: title?.trim() || undefined,
    siteId: configuration?.siteId?.trim() || undefined,
    creator: configuration?.creator?.trim() || undefined,
    creatorId: configuration?.creatorId?.trim() || undefined,
  }
}
