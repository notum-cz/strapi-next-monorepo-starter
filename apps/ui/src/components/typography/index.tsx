import React from "react"

import { cn } from "@/lib/styles"

const textColorVariants = {
  black: "text-black",
  white: "text-white",
  // more variants will be added here
}

const fontWeightVariants = {
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

const variantStyles = {
  heading1: "typo-h1",
  heading2: "typo-h2",
  heading3: "typo-h3",
  heading4: "typo-h4",
  heading5: "typo-h5",
  heading6: "typo-h6",
  base: "text-base leading-[25px]",
}

const defaultStyles: Record<TypographyTag, Variant> = {
  h1: "heading1",
  h2: "heading2",
  h3: "heading3",
  h4: "heading4",
  h5: "heading5",
  h6: "heading6",
  p: "base",
}

type Variant = keyof typeof variantStyles
type TextColor = keyof typeof textColorVariants
type TypographyTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p"
type FontWeight = keyof typeof fontWeightVariants

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
        `typo-${Tag}`,
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
