import React from "react"
import { Data } from "@repo/strapi-types"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import AppLink from "@/components/elementary/AppLink"
import { StrapiBasicImage } from "@/components/page-builder/components/utilities/StrapiBasicImage"

export interface StrapiLinkProps {
  readonly component: Data.Component<"utilities.link"> | undefined | null
  readonly children?: React.ReactNode
  readonly className?: string
  readonly hideWhenMissing?: boolean
}

const getStrapiLinkHref = (
  component?: Data.Component<"utilities.link"> | null
) => {
  // Add more when needed
  switch (component?.type) {
    case "external":
      return component.href
    case "page":
      return component.page?.fullPath ?? "#"
    default:
      return undefined
  }
}

export function StrapiLink({
  component,
  children,
  className,
  hideWhenMissing,
}: StrapiLinkProps) {
  removeThisWhenYouNeedMe("StrapiLink")

  if (component == null && hideWhenMissing) {
    return null
  }

  const { newTab = false, label, decorations } = component ?? {}

  const {
    variant = "link",
    size = "default",
    leftIcon,
    rightIcon,
    hasIcons = false,
  } = decorations ?? {}

  const linkHref = getStrapiLinkHref(component)

  if (!linkHref) {
    return children ?? label ?? null
  }

  return (
    <AppLink
      href={linkHref}
      openInNewTab={newTab ?? false}
      className={className}
      startAdornment={
        hasIcons && leftIcon ? (
          <StrapiBasicImage component={leftIcon} fill />
        ) : undefined
      }
      endAdornment={
        hasIcons && rightIcon ? (
          <StrapiBasicImage component={rightIcon} fill />
        ) : undefined
      }
      variant={variant}
      size={size}
    >
      {children ?? label}
    </AppLink>
  )
}

StrapiLink.displayName = "StrapiLink"

export default StrapiLink
