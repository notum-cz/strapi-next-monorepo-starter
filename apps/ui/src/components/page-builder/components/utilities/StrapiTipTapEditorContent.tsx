import type { Data } from "@repo/strapi-types"

import { Container } from "@/components/elementary/Container"
import { TiptapRichText } from "@/components/elementary/tiptap-editor"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

function StrapiTipTapEditorContent({
  component,
}: {
  component: Data.Component<"utilities.tip-tap-rich-text">
}) {
  removeThisWhenYouNeedMe("StrapiTipTapEditorContent")

  return (
    <Container className="tip-tap-editor-wrapper">
      <TiptapRichText content={component.content} />
    </Container>
  )
}

export default StrapiTipTapEditorContent
