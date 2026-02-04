import React from "react"
import { VariantProps } from "class-variance-authority"

import { formatHref, isAppLink, Link } from "@/lib/navigation"
import { cn } from "@/lib/styles"
import { buttonVariants } from "@/components/ui/button"

export interface AppLinkProps
  extends
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  readonly href: string
  readonly children?: React.ReactNode
  readonly openInNewTab?: boolean
  readonly startAdornment?: React.ReactNode
  readonly endAdornment?: React.ReactNode
}

export const AppLink = ({
  href,
  className,
  children,
  endAdornment,
  startAdornment,
  openInNewTab = false,
  variant = "link",
  size = "default",
  ...props
}: AppLinkProps) => {
  const combinedClassName = cn(
    "group flex flex-row items-center gap-2",
    buttonVariants({ variant, size }),
    className
  )

  const formattedHref = formatHref(href)

  const AppLinkInner = (
    <>
      {startAdornment && (
        <span className="relative size-4 transition-transform duration-200 ease-in group-hover:-translate-x-2">
          {startAdornment}
        </span>
      )}
      {children}
      {endAdornment && (
        <span className="relative size-4 transition-transform duration-200 ease-in group-hover:translate-x-2">
          {endAdornment}
        </span>
      )}
    </>
  )

  if (isAppLink(formattedHref)) {
    return (
      <Link
        href={formattedHref}
        {...props}
        target={openInNewTab ? "_blank" : ""}
        rel={openInNewTab ? "noopener" : ""}
        className={combinedClassName}
      >
        {AppLinkInner}
      </Link>
    )
  }

  return (
    <a
      href={formattedHref}
      target={openInNewTab ? "_blank" : ""}
      rel={openInNewTab ? "noopener noreferrer" : ""}
      className={combinedClassName}
    >
      {AppLinkInner}
    </a>
  )
}

AppLink.displayName = "AppLink"

export default AppLink
