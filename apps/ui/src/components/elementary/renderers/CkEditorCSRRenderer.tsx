"use client"

import { useMemo } from "react"
import { useLocale } from "next-intl"

import { cn } from "@/lib/styles"

import { processLinkHrefAttribute } from "./utils"

const CkEditorCSRRenderer = ({
  htmlContent,
  className,
  variant = "page",
}: {
  htmlContent?: string | null
  className?: string
  variant?: "page"
}) => {
  const locale = useLocale()

  const processedHtmlContent = useMemo(() => {
    if (!htmlContent) return ""

    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, "text/html")

    // Find all anchor tags
    const links = doc.getElementsByTagName("a")

    // Update each link's href with the locale prefix
    for (const link of links) {
      const href = link.getAttribute("href")
      if (href?.startsWith("/")) {
        link.setAttribute("href", processLinkHrefAttribute(href, locale))
      }
    }

    return doc.body.innerHTML
  }, [htmlContent, locale])

  return htmlContent ? (
    <div
      className={cn(
        variant === "page" ? "ck-editor-rich-text-page" : "",
        className
      )}
      // Content is coming from Strapi, i.e. from employees, not users
      dangerouslySetInnerHTML={{
        __html: processedHtmlContent,
      }}
    />
  ) : null
}

export default CkEditorCSRRenderer
