import type { Locale } from "next-intl"

import { routing } from "@/lib/navigation"

/**
 * Function to remove empty images (images without src) from HTML content.
 */
export const removeEmptyImagesFromContent = (content?: string | null): string =>
  content?.replaceAll(
    /<img\b[^>]*\bsrc\s*=\s*(['"])(?:\s*|\?(?:[^'" >]*)?)\1[^>]*>/gi,
    ""
  ) || ""

/**
 * Function to process links in HTML content, adding locale prefix to internal links.
 */
export const processLinksInHtmlContent = (html: string, locale: Locale) =>
  html?.replaceAll(
    /<a\b([^>]*?)\bhref=(["'])(\/[^"']*)\2([^>]*)>/gi,
    (match, beforeAttrs, quote, href, afterAttrs) => {
      const newHref = processLinkHrefAttribute(href, locale)

      return `<a${beforeAttrs}href=${quote}${newHref}${quote}${afterAttrs}>`
    }
  )

const processLinkHrefAttribute = (href: string, locale: Locale) =>
  hrefIncludesLocale(href)
    ? href
    : `/${locale}${href.startsWith("/") ? "" : "/"}${href}`

const hrefIncludesLocaleRegExp = new RegExp(`^/(${routing.locales.join("|")})`)

const hrefIncludesLocale = (href: string) => hrefIncludesLocaleRegExp.test(href)
