import React from "react"
import { Data } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import CkEditorSSRRenderer from "@/components/elementary/ck-editor/CkEditorSSRRenderer"

export const StrapiCkEditorContent = ({
  component,
}: {
  readonly component: Data.Component<"utilities.ck-editor-content">
}) => {
  removeThisWhenYouNeedMe("StrapiCkEditorContent")

  return <CkEditorSSRRenderer htmlContent={component.content} />
}

StrapiCkEditorContent.displayName = "CkEditorContent"

export default StrapiCkEditorContent
