import React from "react"
import { ControllerFieldState } from "react-hook-form"

import { cn } from "@/lib/styles"
import { FormLabel } from "@/components/ui/form"

type Props = {
  readonly label?: React.ReactNode
  readonly fieldState?: ControllerFieldState
  readonly required?: boolean
  readonly className?: string
}

export function AppFormLabel({
  fieldState,
  label,
  required,
  className,
}: Props) {
  if (label == null) {
    return null
  }

  return (
    <FormLabel
      className={cn(
        {
          "font-normal": !fieldState?.invalid,
          "font-medium": fieldState?.invalid,
        },
        className
      )}
    >
      {label}
      {required && <span className="text-red-500">*</span>}
    </FormLabel>
  )
}
