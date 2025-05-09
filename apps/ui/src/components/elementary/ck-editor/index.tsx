import CkEditorCSRRenderer from "@/components/elementary/ck-editor/CkEditorCSRRenderer"
import CkEditorSSRRenderer from "@/components/elementary/ck-editor/CkEditorSSRRenderer"

import "@/styles/CkEditorDefaultStyles.css"

/**
 * Component that is used to render HTML content from rich text CkEditor in Strapi.
 * @param htmlContent - HTML parsable content
 * @param className - override for custom styling of the content
 * @returns React.ReactNode | null
 */
export const CkEditorRenderer = (props: {
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
