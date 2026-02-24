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
        hideDefaultPadding ? "max-w-312" : "max-w-308 px-6",
        className
      )}
    >
      {children}
    </div>
  )
}
