import { Metadata } from "next"
import { env } from "@/env.mjs"
import { UID } from "@repo/strapi"
import { mergeWith } from "lodash"
import { getTranslations } from "next-intl/server"

import { removeThisWhenYouNeedMe } from "./general-helpers"
import { routing } from "./navigation"
import Strapi from "./strapi"

export async function getMetadataFromStrapi({
  pageUrl,
  locale,
  customMetadata,
  uid = "api::page.page",
}: {
  pageUrl?: string
  locale: string
  customMetadata?: Metadata
  // Add more content types here if we want to fetch SEO components for them
  uid?: Extract<UID.ContentType, "api::page.page">
}): Promise<Metadata | undefined> {
  removeThisWhenYouNeedMe("getMetadataFromStrapi")

  const t = await getTranslations({ locale, namespace: `seo` })

  const siteUrl = env.NEXT_PUBLIC_APP_PUBLIC_URL

  if (!siteUrl) {
    console.error(
      "Please provide NEXT_PUBLIC_APP_PUBLIC_URL (public URL of site) for SEO metadata generation."
    )
    return
  }

  const defaultMeta: Metadata = {
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
        (acc, locale) => ({
          ...acc,
          [locale]: `${siteUrl}/${locale}`,
        }),
        {}
      ),
    },

    metadataBase: new URL(siteUrl),

    ...customMetadata,
  }

  const defaultOgMeta: Metadata["openGraph"] = {
    type: "website",
    locale: locale,
    siteName: t("siteName"),
    title: t("metaTitle"),
    description: t("metaDescription"),
    emails: [t("email")],
    images: [t("metaImageUrl")],
    url: `/${locale}/${pageUrl ?? ""}`,
  }

  const defaultTwitterMeta = {
    card: t("twitter.card"),
    title: t("twitter.title"),
    description: t("twitter.description"),
    siteId: t("twitter.siteId"),
    creator: t("twitter.creator"),
    creatorId: t("twitter.creatorId"),
    images: [t("twitter.imageUrl")],
  } as Metadata["twitter"]

  try {
    // skip strapi fetching and return SEO from translations
    if (!pageUrl) {
      throw new Error("No slug provided")
    }

    const res = await Strapi.fetchOneBySlug(
      uid,
      pageUrl,
      {
        locale,
        populate: {
          seo: {
            populate: {
              metaImage: true,
              twitter: { populate: { images: true } },
            },
          },
        },
      },
      undefined,
      { omitAuthorization: true }
    )

    const seo = res.data?.seo

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
      ? {
          card: twitterSeo.card as any,
          title: twitterSeo.title ?? undefined,
          description: twitterSeo.description ?? undefined,
          siteId: twitterSeo.siteId ?? undefined,
          creator: twitterSeo.creator ?? undefined,
          creatorId: twitterSeo.creatorId ?? undefined,
          images:
            twitterSeo.images != null
              ? twitterSeo.images.map((image: any) => image.url)
              : [],
        }
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
  } catch (e: any) {
    console.warn(
      `SEO for ${uid} content type ("${pageUrl}") wasn't fetched: `,
      e?.message
    )
    return {
      ...defaultMeta,
      openGraph: defaultOgMeta,
      twitter: defaultTwitterMeta,
    }
  }
}

const seoMergeCustomizer = (defaultValue: any, strapiValue: any) =>
  strapiValue ?? defaultValue
