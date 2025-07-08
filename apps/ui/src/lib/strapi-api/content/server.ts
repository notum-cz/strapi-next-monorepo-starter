import "server-only"

import { draftMode } from "next/headers"
import { UID } from "@repo/strapi"

import type { AppLocale, CustomFetchOptions } from "@/types/general"

import { PublicStrapiClient } from "@/lib/strapi-api"

// ------ Page fetching functions

export async function fetchPage(
  fullPath: string,
  locale: AppLocale,
  requestInit?: RequestInit,
  options?: CustomFetchOptions
) {
  const dm = await draftMode()

  try {
    return await PublicStrapiClient.fetchOneByFullPath(
      "api::page.page",
      fullPath,
      {
        locale,
        status: dm.isEnabled ? "draft" : "published",
        populate: {
          content: true, // ensures typing is valid on the resulting object
          seo: true,
        },
        middlewarePopulate: ["content", "seo"], // ensures the middleware is triggered and the populate object is replaced
      },
      requestInit,
      options
    )
  } catch (e: any) {
    console.error({
      message: `Error fetching page '${fullPath}' for locale '${locale}'`,
      error: {
        error: e?.message,
        stack: e?.stack,
      },
    })
  }
}

export async function fetchAllPages(
  uid: Extract<UID.ContentType, "api::page.page"> = "api::page.page",
  locale: AppLocale
) {
  try {
    return await PublicStrapiClient.fetchAll(uid, {
      locale,
      fields: ["fullPath", "locale", "updatedAt", "createdAt", "slug"],
      populate: {},
      status: "published",
    })
  } catch (e: any) {
    console.error({
      message: `Error fetching all pages for locale '${locale}'`,
      error: {
        error: e?.message,
        stack: e?.stack,
      },
    })
    return { data: [] }
  }
}

// ------ SEO fetching functions

export async function fetchSeo(
  uid: Extract<UID.ContentType, "api::page.page"> = "api::page.page",
  fullPath: string | null,
  locale: AppLocale
) {
  try {
    return await PublicStrapiClient.fetchOneByFullPath(uid, fullPath, {
      locale,
      populate: {
        seo: {
          populate: {
            metaImage: true,
            twitter: { populate: { images: true } },
          },
        },
      },
      fields: [],
    })
  } catch (e: any) {
    console.error({
      message: `Error fetching SEO for '${uid}' with fullPath '${fullPath}' for locale '${locale}'`,
      error: {
        error: e?.message,
        stack: e?.stack,
      },
    })
  }
}

// ------ Navbar fetching functions

export async function fetchNavbar(locale: AppLocale) {
  try {
    return await PublicStrapiClient.fetchOne("api::navbar.navbar", undefined, {
      locale,
      populate: {
        links: true,
        logoImage: { populate: { image: true, link: true } },
      },
    })
  } catch (e: any) {
    console.error({
      message: `Error fetching navbar for locale '${locale}'`,
      error: {
        error: e?.message,
        stack: e?.stack,
      },
    })
  }
}

// ------ Footer fetching functions

export async function fetchFooter(locale: AppLocale) {
  try {
    return await PublicStrapiClient.fetchOne("api::footer.footer", undefined, {
      locale,
      populate: {
        sections: { populate: { links: true } },
        logoImage: { populate: { image: true, link: true } },
        links: true,
      },
    })
  } catch (e: any) {
    console.error({
      message: `Error fetching footer for locale '${locale}'`,
      error: {
        error: e?.message,
        stack: e?.stack,
      },
    })
  }
}
