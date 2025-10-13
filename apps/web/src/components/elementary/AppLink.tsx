import React from "react"
import { VariantProps } from "class-variance-authority"

import { formatHref, isAppLink, Link } from "@/lib/navigation"
import { cn } from "@/lib/styles"
import { buttonVariants } from "@/components/ui/button"

export interface AppLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  readonly href: string
  readonly children?: React.ReactNode
  readonly openExternalInNewTab?: boolean
  readonly endAdornment?: React.ReactNode
}

export const AppLink = ({
  href,
  className,
  children,
  endAdornment,
  openExternalInNewTab = false,
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

  if (isAppLink(formattedHref)) {
    return (
      <Link href={formattedHref} {...props} className={combinedClassName}>
        {children}
        {endAdornment && (
          <span className="transition-transform duration-200 ease-in group-hover:translate-x-2">
            {endAdornment}
          </span>
        )}
      </Link>
    )
  }

  return (
    <a
      href={formattedHref}
      target={openExternalInNewTab ? "_blank" : ""}
      rel={openExternalInNewTab ? "noopener noreferrer" : ""}
      className={combinedClassName}
    >
      {children}
      {endAdornment && (
        <span className="transition-transform duration-200 ease-in group-hover:translate-x-2">
          {endAdornment}
        </span>
      )}
    </a>
  )
}

AppLink.displayName = "AppLink"

export default AppLink
