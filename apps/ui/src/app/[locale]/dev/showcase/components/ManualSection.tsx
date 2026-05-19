import type { ComponentPropsWithoutRef } from "react"

import Typography from "@/components/typography"
import type { TextColor } from "@/components/typography/config"

interface ManualSectionProps extends ComponentPropsWithoutRef<"div"> {
  title?: string
  textColor?: TextColor
}

function ManualSection({
  children,
  title,
  textColor = "black",
  ...props
}: ManualSectionProps) {
  return (
    <div {...props}>
      {title ? (
        <Typography tag="h3" textColor={textColor}>
          {title}
        </Typography>
      ) : null}
      {children}
    </div>
  )
}

export default ManualSection
