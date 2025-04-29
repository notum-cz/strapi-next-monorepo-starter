import CkEditorCSRRenderer from "@/components/elementary/CkEditorRenderer/CkEditorCSRRenderer"
import CkEditorSSRRenderer from "@/components/elementary/CkEditorRenderer/CkEditorSSRRenderer"

import "@/styles/CkEditorDefaultStyles.css"

/**
 * ! NOTE:
 
 * Component that is used to render HTML content from rich text CkEditor in Strapi.
 * @param htmlContent - HTML parsable content
 * @param className - override for custom styling of the content
 * @returns React.ReactNode | null
 */
const CkEditorRenderer = (props: {
  htmlContent?: string | null
  className?: string
  variant?: "page"
}) => {
  return (
    <div className="ck-content">
      {typeof window === "undefined" ? (
        <CkEditorSSRRenderer {...props} />
      ) : (
        <CkEditorCSRRenderer {...props} />
      )}
    </div>
  )
}

export default CkEditorRenderer
