import type { Data } from "@repo/strapi-types"

import { Container } from "@/components/elementary/Container"
import { TiptapRichText } from "@/components/elementary/tiptap-editor"
import {
  type TextColor,
  textColorVariants,
} from "@/components/typography/config"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import type { PageBuilderComponentProps } from "@/types/general"

function StrapiTipTapEditorContent({
  component,
  textColor,
}: PageBuilderComponentProps & {
  component: Data.Component<"utilities.tip-tap-rich-text">
  textColor?: TextColor
}) {
  removeThisWhenYouNeedMe("StrapiTipTapEditorContent")

  const textColorClass = textColorVariants[textColor ?? "black"]

  return (
    <Container className="tip-tap-editor-wrapper">
      <TiptapRichText
        className={cn(textColorClass)}
        content={component.content}
      />
    </Container>
  )
}

export default StrapiTipTapEditorContent
