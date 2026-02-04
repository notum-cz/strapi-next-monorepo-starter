import { Locale, useLocale } from "next-intl"

import { cn } from "@/lib/styles"
import {
  processLinksInHtmlContent,
  removeEmptyImagesFromContent,
} from "@/components/elementary/ck-editor/utils"

import "@/styles/CkEditorDefaultStyles.css"

const CkEditorRenderer = ({
  htmlContent,
  className,
  locale: passedLocale,
  variant = "page",
}: {
  htmlContent?: string | null
  className?: string
  locale?: Locale
  variant?: "page" | "blog"
}) => {
  const currentLocale = useLocale()
  const locale = passedLocale ?? currentLocale

  const processHtmlContent = (html: string, locale: Locale) => {
    const transformers = [
      (h: string) => processLinksInHtmlContent(h, locale),
      removeEmptyImagesFromContent,
    ]
    return transformers.reduce((result, transform) => transform(result), html)
  }

  return htmlContent ? (
    <div
      className={cn(`ck-editor-rich-text-${variant}`, className)}
      dangerouslySetInnerHTML={{
        __html: processHtmlContent(htmlContent, locale),
      }}
    />
  ) : null
}

export default CkEditorRenderer
