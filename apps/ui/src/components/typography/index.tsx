import React from "react"

import { cn } from "@/lib/styles"
import {
  FontWeight,
  TextColor,
  TypographyTag,
  Variant,
} from "@/components/typography/types"

export const textColorVariants = {
  black: "text-black",
  white: "text-white",
  // more variants will be added here
}

export const fontWeightVariants = {
  black: "font-black",
  extraBold: "font-extrabold",
  bold: "font-bold",
  semiBold: "font-semibold",
  medium: "font-medium",
  normal: "font-normal",
  light: "font-light",
  extraLight: "font-extraLight",
  thin: "font-thin",
}

export const variantStyles = {
  heading1: "typo-h1",
  heading2: "typo-h2",
  heading3: "typo-h3",
  heading4: "typo-h4",
  heading5: "typo-h5",
  heading6: "typo-h6",
  small: "typo-p-small",
  medium: "typo-p-medium",
  large: "typo-p-large",
}

export const defaultStyles: Record<TypographyTag, Variant> = {
  h1: "heading1",
  h2: "heading2",
  h3: "heading3",
  h4: "heading4",
  h5: "heading5",
  h6: "heading6",
  p: "medium",
  blockquote: "medium",
  ol: "medium",
  ul: "medium",
}

interface TypographyProps {
  children: React.ReactNode
  className?: string
  variant?: Variant
  textColor?: TextColor
  fontWeight?: FontWeight
  tag?: TypographyTag
  id?: string
}

export const Typography = ({
  children,
  className,
  variant,
  textColor = "black",
  fontWeight = "normal",
  tag: Tag = "p",
  id,
}: TypographyProps) => {
  const selectedVariant = variant
    ? variantStyles[variant]
    : variantStyles[defaultStyles[Tag]]

  const selectedTextColor = textColorVariants[textColor]
  const selectedFontWeight = fontWeightVariants[fontWeight]

  return (
    <Tag
      id={id}
      className={cn(
        selectedVariant,
        selectedTextColor,
        selectedFontWeight,
        className
      )}
    >
      {children}
    </Tag>
  )
}

Typography.displayName = "Typography"

export default Typography
