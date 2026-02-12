import type React from "react"

import { FormDescription } from "@/components/ui/form"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

type Props = {
  readonly description?: React.ReactNode
}

export function AppFormDescription({ description }: Props) {
  removeThisWhenYouNeedMe("AppFormDescription")

  if (description == null) {
    return null
  }

  return <FormDescription>{description}</FormDescription>
}
