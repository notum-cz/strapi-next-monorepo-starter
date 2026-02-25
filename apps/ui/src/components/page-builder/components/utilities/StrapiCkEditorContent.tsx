import type { Data } from "@repo/strapi-types"

import CKEditorRenderer from "@/components/elementary/ck-editor"
import { Container } from "@/components/elementary/Container"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import type { PageBuilderComponentProps } from "@/types/general"

export function StrapiCkEditorContent({
  component,
}: PageBuilderComponentProps & {
  component: Data.Component<"utilities.ck-editor-content">
}) {
  removeThisWhenYouNeedMe("StrapiCkEditorContent")

  return (
    <Container>
      <CKEditorRenderer
        htmlContent={component.content}
        className="mx-auto w-full max-w-324 px-4 py-8 lg:py-12"
      />
    </Container>
  )
}

StrapiCkEditorContent.displayName = "CkEditorContent"

export default StrapiCkEditorContent
