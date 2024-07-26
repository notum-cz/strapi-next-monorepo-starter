import React from "react"

import { cn } from "@/lib/styles"

export const Container = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={cn(className, "mx-auto max-w-screen-xl px-4 xl:px-0")}>
      {children}
    </div>
  )
}
