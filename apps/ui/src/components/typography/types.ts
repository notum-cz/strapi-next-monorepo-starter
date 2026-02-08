import {
  fontWeightVariants,
  textColorVariants,
  variantStyles,
} from "@/components/typography"

export type Variant = keyof typeof variantStyles
export type TextColor = keyof typeof textColorVariants
export type TypographyTag =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "ol"
  | "ul"
  | "blockquote"
export type FontWeight = keyof typeof fontWeightVariants
