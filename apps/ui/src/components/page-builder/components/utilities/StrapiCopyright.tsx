import React from "react"

export interface StrapiCopyrightProps {
  readonly text: string
  readonly includeYear?: boolean
  readonly className?: string
  readonly tag?: keyof JSX.IntrinsicElements
}

export function StrapiCopyright({
  text,
  includeYear = false,
  className,
  tag = "p",
}: StrapiCopyrightProps) {
  if (!text) return null

  const currentYear = new Date().getFullYear()
  const renderedText = includeYear
    ? `© ${currentYear} ${text}`
    : text.replace("{YEAR}", currentYear.toString())

  const Tag = tag as any
  return <Tag className={className}>{renderedText}</Tag>
}

export default StrapiCopyright
