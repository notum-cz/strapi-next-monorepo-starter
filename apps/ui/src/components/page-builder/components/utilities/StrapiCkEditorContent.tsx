import React from "react"
import { Data } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import CkEditorRenderer from "@/components/elementary/ck-editor"

export const StrapiCkEditorContent = ({
  component,
}: {
  readonly component: Data.Component<"utilities.ck-editor-content">
}) => {
  removeThisWhenYouNeedMe("StrapiCkEditorContent")

  return <CkEditorRenderer htmlContent={component.content} />
}

StrapiCkEditorContent.displayName = "CkEditorContent"

export default StrapiCkEditorContent
