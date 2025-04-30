import { getLocale } from "next-intl/server"
import parse from "node-html-parser"

import { cn } from "@/lib/styles"

import { processLinkHrefAttribute } from "./utils"

const CkEditorSSRRenderer = async ({
  htmlContent,
  className,
  variant = "page",
}: {
  htmlContent?: string | null
  className?: string
  variant?: "page" | "blog"
}) => {
  const locale = await getLocale()

  // see the processHtmlContent NOTE above
  const processHtmlContent = (html: string, locale: string) => {
    // Create a DOM parser to work with the HTML content

    const doc = parse(html)

    // Find all anchor tags
    const links = doc.getElementsByTagName("a")

    // Update each link's href with the locale prefix

    for (const link of links) {
      const href = link.getAttribute("href")
      if (href?.startsWith("/")) {
        link.setAttribute("href", processLinkHrefAttribute(href, locale))
      }
    }

    return doc.innerHTML
  }

  return htmlContent ? (
    <div
      className={cn(
        variant === "page" ? "ck-editor-rich-text-page" : "",
        className
      )}
      // Content is coming from Strapi, i.e. from employees, not users
      dangerouslySetInnerHTML={{
        __html: htmlContent ? processHtmlContent(htmlContent, locale) : "",
      }}
    />
  ) : null
}

export default CkEditorSSRRenderer
