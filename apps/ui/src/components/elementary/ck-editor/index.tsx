import { type Locale, useLocale } from "next-intl"

import {
  processLinksInHtmlContent,
  removeEmptyImagesFromContent,
} from "@/components/elementary/ck-editor/utils"
import { cn } from "@/lib/styles"

import "@/styles/CkEditorDefaultStyles.css"

function CkEditorRenderer({
  htmlContent,
  className,
  locale: passedLocale,
}: {
  htmlContent?: string | null
  className?: string
  locale?: Locale
}) {
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
      className={cn("ck-editor-ui", className)}
      dangerouslySetInnerHTML={{
        __html: processHtmlContent(htmlContent, locale),
      }}
    />
  ) : null
}

export default CkEditorRenderer
