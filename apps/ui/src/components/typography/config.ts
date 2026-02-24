export type FontWeight = keyof typeof fontWeightVariants
export type Variant = keyof typeof variantStyles
export type TextColor = keyof typeof textColorVariants
export type TypographyTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p"
export type ElementTag = "ol" | "ul" | "blockquote"

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

export const defaultStyles: Record<TypographyTag | ElementTag, Variant> = {
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
