import React from "react"
import { Data } from "@repo/strapi"

export interface StrapiCopyrightProps {
  readonly component: Data.Component<"utilities.copyright"> | undefined | null
  readonly className?: string
  readonly tag?: keyof JSX.IntrinsicElements // e.g. "p", "small", "span"
  readonly hideWhenMissing?: boolean
}

export function StrapiCopyright({
  component,
  className,
  tag = "p",
  hideWhenMissing,
}: StrapiCopyrightProps) {
  if (component == null && hideWhenMissing) {
    return null
  }

  if (!component?.text) {
    return null
  }

  const currentYear = new Date().getFullYear().toString()
  const yearPattern = new RegExp(`^@\\s*${currentYear}`)
  const originalText = component.text
  const includeYear = component.includeYear ?? false

  const renderedText = includeYear
    ? yearPattern.test(originalText)
      ? originalText
      : `@ ${currentYear} ${originalText}`
    : originalText.replace("{YEAR}", currentYear)

  const Tag = tag as any

  return <Tag className={className}>{renderedText}</Tag>
}

StrapiCopyright.displayName = "StrapiCopyright"

export default StrapiCopyright
