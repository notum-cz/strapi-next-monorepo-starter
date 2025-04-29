import React from "react"
import { Data } from "@repo/strapi"

import CkEditorRenderer from "@/components/elementary/CkEditorRenderer"

const CkEditorContent = ({
  component,
}: {
  readonly component: Data.Component<"shared.ck-editor-content">
}) => {
  return <CkEditorRenderer htmlContent={component.content} />
}

export default CkEditorContent
