import type React from "react"

import { cn } from "@/lib/styles"

export function Container({
  children,
  className,
  hideDefaultPadding,
}: {
  readonly children: React.ReactNode
  readonly className?: string
  readonly hideDefaultPadding?: boolean
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        hideDefaultPadding ? "max-w-screen-default" : "max-w-[1296px] px-6",
        className
      )}
    >
      {children}
    </div>
  )
}
