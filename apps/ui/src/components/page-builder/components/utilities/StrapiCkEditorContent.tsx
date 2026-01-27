import React from "react"
import { Data } from "@repo/strapi-types"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import CkEditorSSRRenderer from "@/components/elementary/ck-editor/CkEditorSSRRenderer"

export const StrapiCkEditorContent = ({
  component,
}: {
  readonly component: Data.Component<"utilities.ck-editor-content">
}) => {
  removeThisWhenYouNeedMe("StrapiCkEditorContent")

  return (
    <CkEditorSSRRenderer
      htmlContent={component.content}
      className="mx-auto w-full max-w-[1296px] px-4 py-8 lg:py-12"
    />
  )
}

StrapiCkEditorContent.displayName = "CkEditorContent"

export default StrapiCkEditorContent
