import { Locale } from "next-intl"

import { routing } from "@/lib/navigation"

/**
 * Function to remove empty images (images without src) from HTML content.
 */
export const removeEmptyImagesFromContent = (content?: string | null): string =>
  content?.replace(
    /<img\b[^>]*\bsrc\s*=\s*(['"])(?:\s*|\?(?:[^'" >]*)?)\1[^>]*>/gi,
    ""
  ) || ""

/**
 * Function to process links in HTML content, adding locale prefix to internal links.
 */
export const processLinksInHtmlContent = (html: string, locale: Locale) =>
  html?.replace(
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

/**
 * Function to add typography classes to heading and paragraph tags in HTML content.
 */
export const addTypoClassesToHtmlContent = (html: string): string => {
  if (!html) return html

  const tagNames = ["h1", "h2", "h3", "h4", "h5", "h6", "p"] as const

  let output = html

  for (const tagName of tagNames) {
    const tagRegex = new RegExp(`<${tagName}(\\s[^>]*)?>`, "gi")

    output = output.replace(tagRegex, (match, attrs = "") => {
      const classRegex = /class\s*=\s*(['"])(.*?)\1/i
      const existingClassMatch = attrs.match(classRegex)
      const typoClass = `typo-${tagName}`

      if (!existingClassMatch) {
        return `<${tagName}${attrs} class="${typoClass}">`
      }

      const quote = existingClassMatch[1]
      const classValue = existingClassMatch[2]

      if (new RegExp(`(^|\\s)${typoClass}(\\s|$)`).test(classValue)) {
        return match
      }

      const updatedAttrs = attrs.replace(
        classRegex,
        `class=${quote}${classValue} ${typoClass}${quote}`
      )

      return `<${tagName}${updatedAttrs}>`
    })
  }

  return output
}
