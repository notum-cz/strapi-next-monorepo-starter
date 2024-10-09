import React from "react"

import { cn } from "@/lib/styles"

const variantStyles = {
  heading1:
    "text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl",
  heading3: "md:text-4xl text-2xl font-bold",
  // more variants will be added here
}

const textColorVariants = {
  black: "text-black",
  white: "text-white",
  // more variants will be added here
}

type Variant = keyof typeof variantStyles
type TextColor = keyof typeof textColorVariants
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

interface HeadingProps {
  children: React.ReactNode
  className?: string
  variant?: Variant
  textColor?: TextColor
  tag?: HeadingTag
}

const Heading = ({
  children,
  className,
  variant = "heading3",
  textColor = "black",
  tag = "h3",
}: HeadingProps) => {
  const selectedVariant = variantStyles[variant]
  const selectedTextColor = textColorVariants[textColor]

  const Tag = tag as HeadingTag

  if (!Tag) {
    return null
  }

  return (
    <Tag className={cn(selectedVariant, selectedTextColor, className)}>
      {children}
    </Tag>
  )
}

export default Heading
