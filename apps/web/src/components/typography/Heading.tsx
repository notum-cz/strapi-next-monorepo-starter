import React from "react"

import { cn } from "@/lib/styles"

const variantStyles = {
  heading1: "typo-h1",
  heading2: "typo-h2",
  heading3: "typo-h3",
  heading4: "typo-h4",
  heading5: "typo-h5",
  heading6: "typo-h6",
}

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

type Variant = keyof typeof variantStyles
type TextColor = keyof typeof textColorVariants
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
type FontWeight = keyof typeof fontWeightVariants

interface HeadingProps {
  children: React.ReactNode
  className?: string
  variant?: Variant
  textColor?: TextColor
  fontWeight?: FontWeight
  tag?: HeadingTag
  id?: string
}

export const Heading = ({
  children,
  className,
  variant = "heading3",
  textColor = "black",
  fontWeight = "semiBold",
  tag = "h3",
  id,
}: HeadingProps) => {
  const selectedVariant = variantStyles[variant]
  const selectedTextColor = textColorVariants[textColor]
  const selectedFontWeight = fontWeightVariants[fontWeight]

  const Tag = tag as HeadingTag

  if (!Tag) {
    return null
  }

  return (
    <Tag
      id={id}
      className={cn(
        `typo-${tag}`,
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

Heading.displayName = "Heading"

export default Heading
