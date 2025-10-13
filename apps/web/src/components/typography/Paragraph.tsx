import React from "react"

import { cn } from "@/lib/styles"

export const variantStyles = {
  base: "text-base leading-[25px]",
  // more variants will be added here
}

export const textColorVariants = {
  black: "text-black",
  white: "text-white",
  // more variants will be added here
}

type Variant = keyof typeof variantStyles
type TextColor = keyof typeof textColorVariants

export const Paragraph = ({
  children,
  className,
  variant = "base",
  textColor = "black",
}: {
  className?: string
  children?: React.ReactNode
  variant?: Variant
  textColor?: TextColor
}) => {
  const selectedVariant = variantStyles[variant]
  const selectedTextColor = textColorVariants[textColor]

  return (
    <p className={cn(selectedVariant, selectedTextColor, className)}>
      {children}
    </p>
  )
}

Paragraph.displayName = "Paragraph"

export default Paragraph
