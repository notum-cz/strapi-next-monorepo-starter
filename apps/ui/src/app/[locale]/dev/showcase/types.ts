import type { ButtonVariant, ButtonSize } from "@/components/ui/button"

export type { ButtonVariant, ButtonSize }

export type ButtonVariantItem = {
  variant: ButtonVariant
  label: string
  size?: ButtonSize
}

export type ButtonVariants = ButtonVariantItem[]
