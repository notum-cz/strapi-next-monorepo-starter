import type React from "react"
import type { ControllerFieldState } from "react-hook-form"

import { FormLabel } from "@/components/ui/form"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"

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
  removeThisWhenYouNeedMe("AppFormLabel")

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
