import type { TextColor } from "@/components/typography/config"

export const themeColorPalette: Record<
  string,
  { label: string; background: string; text: TextColor }
> = {
  "bg-background": {
    label: "--color-background",
    background: "bg-background",
    text: "black",
  },
  "bg-foreground": {
    label: "--color-foreground",
    background: "bg-foreground",
    text: "white",
  },
  "bg-card": {
    label: "--color-card",
    background: "bg-card",
    text: "black",
  },
  "bg-card-foreground": {
    label: "--color-card-foreground",
    background: "bg-card-foreground",
    text: "white",
  },
  "bg-popover": {
    label: "--color-popover",
    background: "bg-popover",
    text: "black",
  },
  "bg-popover-foreground": {
    label: "--color-popover-foreground",
    background: "bg-popover-foreground",
    text: "black",
  },
  "bg-primary": {
    label: "--color-primary",
    background: "bg-primary",
    text: "white",
  },
  "bg-primary-foreground": {
    label: "--color-primary-foreground",
    background: "bg-primary-foreground",
    text: "black",
  },
  "bg-secondary": {
    label: "--color-secondary",
    background: "bg-secondary",
    text: "black",
  },
  "bg-secondary-foreground": {
    label: "--color-secondary-foreground",
    background: "bg-secondary-foreground",
    text: "white",
  },
  "bg-muted": {
    label: "--color-muted",
    background: "bg-muted",
    text: "black",
  },
  "bg-muted-foreground": {
    label: "--color-muted-foreground",
    background: "bg-muted-foreground",
    text: "black",
  },
  "bg-accent": {
    label: "--color-accent",
    background: "bg-accent",
    text: "black",
  },
  "bg-accent-foreground": {
    label: "--color-accent-foreground",
    background: "bg-accent-foreground",
    text: "white",
  },
  "bg-destructive": {
    label: "--color-destructive",
    background: "bg-destructive",
    text: "white",
  },
  "bg-destructive-foreground": {
    label: "--color-destructive-foreground",
    background: "bg-destructive-foreground",
    text: "black",
  },
  "bg-border": {
    label: "--color-border",
    background: "bg-border",
    text: "black",
  },
  "bg-input": {
    label: "--color-input",
    background: "bg-input",
    text: "black",
  },
  "bg-ring": {
    label: "--color-ring",
    background: "bg-ring",
    text: "white",
  },
}

// I intentionally duplicate the variant keys here instead of reading them from `buttonVariants` as I want to avoid modifying the default shadcn component structure
export const BUTTON_SHOWCASE = {
  variants: ["default", "outline", "secondary", "ghost", "destructive", "link"],
  sizes: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
} as const
