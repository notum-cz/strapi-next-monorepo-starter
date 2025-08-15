import type { Data } from "@repo/strapi"

/**
 * Generate a meta description from page title
 */
export function generateDescriptionFromTitle(
  title?: string
): string | undefined {
  if (!title) return undefined

  // Clean up the title and create a meaningful description
  const cleanTitle = title.trim()
  return `Discover ${cleanTitle}. Get comprehensive information, insights, and resources about ${cleanTitle}.`
}

/**
 * Generate keywords from page title and content
 */
export function generateKeywordsFromPage(
  title?: string,
  breadcrumbTitle?: string,
  slug?: string
): string | undefined {
  const keywords: string[] = []

  if (title) {
    // Split title into words and filter out common words
    const titleWords = title
      .toLowerCase()
      .split(/[\s\-_]+/)
      .filter((word) => word.length > 2 && !isCommonWord(word))
    keywords.push(...titleWords)
  }

  if (breadcrumbTitle && breadcrumbTitle !== title) {
    const breadcrumbWords = breadcrumbTitle
      .toLowerCase()
      .split(/[\s\-_]+/)
      .filter((word) => word.length > 2 && !isCommonWord(word))
    keywords.push(...breadcrumbWords)
  }

  if (slug) {
    const slugWords = slug
      .split(/[\/-]+/)
      .filter((word) => word.length > 2 && !isCommonWord(word))
    keywords.push(...slugWords)
  }

  // Remove duplicates and return
  const uniqueKeywords = [...new Set(keywords)]
  return uniqueKeywords.length > 0 ? uniqueKeywords.join(", ") : undefined
}

/**
 * Generate a meta title with site name suffix
 */
export function generateMetaTitle(
  title?: string,
  siteName?: string
): string | undefined {
  if (!title) return undefined

  const cleanTitle = title.trim()
  if (siteName && !cleanTitle.includes(siteName)) {
    return `${cleanTitle} | ${siteName}`
  }

  return cleanTitle
}

/**
 * Extract description from page content components
 */
export function generateDescriptionFromContent(
  content?: Data.Component[]
): string | undefined {
  if (!content || content.length === 0) return undefined

  // Look for text content in various component types
  for (const component of content) {
    if (!component) continue

    // Check for hero sections with descriptions
    if (
      component.__component === "sections.hero" &&
      "description" in component
    ) {
      const desc = (component as any).description
      if (typeof desc === "string" && desc.trim()) {
        return truncateDescription(stripHtml(desc))
      }
    }

    // Check for heading sections with descriptions
    if (
      component.__component === "sections.heading-with-cta-button" &&
      "description" in component
    ) {
      const desc = (component as any).description
      if (typeof desc === "string" && desc.trim()) {
        return truncateDescription(stripHtml(desc))
      }
    }

    // Check for CK Editor content
    if (
      component.__component === "utilities.ck-editor-content" &&
      "content" in component
    ) {
      const content = (component as any).content
      if (typeof content === "string" && content.trim()) {
        return truncateDescription(stripHtml(content))
      }
    }
  }

  return undefined
}

/**
 * Check if a word is a common word that shouldn't be used as a keyword
 */
function isCommonWord(word: string): boolean {
  const commonWords = new Set([
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "up",
    "about",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "among",
    "this",
    "that",
    "these",
    "those",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "page",
    "home",
    "main",
  ])

  return commonWords.has(word.toLowerCase())
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, " ")
    .trim()
}

/**
 * Generate basic structured data for a page
 */
export function generateBasicStructuredData(
  title?: string,
  description?: string,
  url?: string,
  siteName?: string
): object | undefined {
  if (!title) return undefined

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: description,
    url: url,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: url ? new URL(url).origin : undefined,
    },
  }
}

/**
 * Truncate description to appropriate length for meta description
 */
function truncateDescription(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text

  // Find the last complete sentence or word within the limit
  const truncated = text.substring(0, maxLength)
  const lastSentence = truncated.lastIndexOf(".")
  const lastSpace = truncated.lastIndexOf(" ")

  if (lastSentence > maxLength * 0.7) {
    return text.substring(0, lastSentence + 1)
  } else if (lastSpace > maxLength * 0.8) {
    return text.substring(0, lastSpace) + "..."
  }

  return truncated + "..."
}
