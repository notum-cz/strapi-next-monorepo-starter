import type React from "react"

import type {
  TextColor,
  TypographyTag,
  FontWeight,
  Variant,
} from "@/components/html/config"
import { resolveHtmlComponentClassName } from "@/components/html/helpers"

interface TypographyProps {
  readonly children: React.ReactNode
  readonly className?: string
  readonly variant?: Variant
  readonly textColor?: TextColor
  readonly fontWeight?: FontWeight
  readonly tag?: TypographyTag
  readonly id?: string
}

export function Typography({
  children,
  className,
  variant,
  textColor = "black",
  fontWeight = "normal",
  tag: Tag = "p",
  id,
}: TypographyProps) {
  return (
    <Tag
      id={id}
      className={resolveHtmlComponentClassName({
        tag: Tag,
        variant,
        textColor,
        fontWeight,
        className,
      })}
    >
      {children}
    </Tag>
  )
}

Typography.displayName = "Typography"

export default Typography
