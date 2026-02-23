import {
  type FontWeight,
  type ElementTag,
  type TypographyTag,
  type TextColor,
  type Variant,
  defaultStyles,
  fontWeightVariants,
  textColorVariants,
  variantStyles,
} from "@/components/html/config"
import { cn } from "@/lib/styles"

type HtmlClassNameParams = {
  tag: ElementTag | TypographyTag
  variant?: Variant
  textColor: TextColor
  fontWeight: FontWeight
  className?: string
}

export function resolveHtmlComponentClassName({
  tag,
  variant,
  textColor,
  fontWeight,
  className,
}: HtmlClassNameParams) {
  const selectedVariant = variant
    ? variantStyles[variant]
    : variantStyles[defaultStyles[tag]]

  return cn(
    selectedVariant,
    textColorVariants[textColor],
    fontWeightVariants[fontWeight],
    className
  )
}
