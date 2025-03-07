import * as React from "react"

import { cn } from "@/lib/styles"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "text-grey-text flex h-full min-h-24 w-full rounded-[4px] border border-border bg-white p-2 text-xs shadow-xs placeholder:text-primary focus:outline-hidden focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{ resize: "none" }}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
