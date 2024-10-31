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
  uid?: UID.ContentType
}): Promise<Metadata | undefined> {
  removeThisWhenYouNeedMe("getMetadataFromStrapi")

  const t = await getTranslations({ locale, namespace: `seo` })

  const feAppBaseUrl = env.NEXT_PUBLIC_APP_PUBLIC_URL || "http://localhost:3000"

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
      canonical: feAppBaseUrl,
      languages: routing.locales.reduce(
        (acc, locale) => ({
          ...acc,
          [locale]: `${feAppBaseUrl}/${locale}`,
        }),
        {}
      ),
    },

    metadataBase: new URL(
      env.NEXT_PUBLIC_APP_PUBLIC_URL || "http://localhost:3000"
    ),

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
        populate: "seo,seo.metaImage,seo.metaSocial,seo.twitter",
      },
      undefined,
      { omitAuthorization: true }
    )

    const seo = (res.data as any)?.seo

    const strapiMeta: Metadata = {
      title: seo?.metaTitle,
      description: seo?.metaDescription,
      keywords: seo?.keywords,
      robots: seo?.metaRobots,
      applicationName: seo?.applicationName,
    }

    const strapiOgMeta: Metadata["openGraph"] = {
      siteName: seo?.siteName,
      title: seo?.metaTitle,
      description: seo?.metaDescription,
      emails: seo?.email,
      images: seo?.metaImage?.data
        ? [
            {
              url: seo.metaImage?.data?.attributes?.url,
              width: seo.metaImage?.data?.attributes?.width,
              height: seo.metaImage?.data?.attributes?.height,
              alt: seo.metaImage?.data?.attributes?.alternativeText,
            },
          ]
        : undefined,
    }

    const twitterSeo = seo?.twitter
    const strapiTwitterMeta: Metadata["twitter"] = twitterSeo
      ? {
          ...twitterSeo,
          images:
            "images" in twitterSeo
              ? (twitterSeo?.images as any)?.data?.map(
                  (image: any) => image.attributes.url
                )
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
