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
        "text-sm font-medium text-gray-700 mb-1",
        {
          "text-red-600": fieldState?.invalid && fieldState?.isTouched,
          "text-green-600": !fieldState?.invalid && fieldState?.isTouched,
        },
        className
      )}
    >
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </FormLabel>
  )
}
