import React from "react"
import { Schema } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Link } from "@/lib/navigation"

export interface LinkStrapiProps {
  readonly component:
    | Schema.Attribute.ComponentValue<"shared.link", false>
    | undefined
    | null

  readonly children?: React.ReactNode
  readonly className?: string
  readonly hideWhenMissing?: boolean
}

export function LinkStrapi({
  component,
  children,
  className,
  hideWhenMissing,
}: LinkStrapiProps) {
  removeThisWhenYouNeedMe("LinkStrapi")

  if (component == null && hideWhenMissing) {
    return null
  }

  if (component?.href == null) {
    return children ?? component?.label ?? null
  }

  return (
    <Link
      href={component.href}
      target={component.newTab ? "_blank" : undefined}
      className={className}
    >
      {children ?? component.label}
    </Link>
  )
}
