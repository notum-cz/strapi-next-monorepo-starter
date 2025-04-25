import CkEditorCSRRenderer from "./CkEditorCSRRenderer"
import CkEditorSSRRenderer from "./CkEditorSSRRenderer"

import "@/styles/rich-text-blog.css"
import "@/styles/rich-text-page.css"

/**
 * ! NOTE:
 * This component should be used to display BLOG article content, as it's styled as such.
 * Component that is used to render HTML content from rich text CkEditor in Strapi.
 * @param htmlContent - HTML parsable content
 * @param className - override for custom styling of the content
 * @returns React.ReactNode | null
 */
const CkEditorRenderer = (props: {
  htmlContent?: string | null
  className?: string
  variant?: "page" | "blog"
}) => {
  return typeof window === "undefined" ? (
    <CkEditorSSRRenderer {...props} />
  ) : (
    <CkEditorCSRRenderer {...props} />
  )
}

export default CkEditorRenderer
