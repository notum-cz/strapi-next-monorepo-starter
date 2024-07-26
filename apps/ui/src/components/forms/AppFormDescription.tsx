import React from "react"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { FormDescription } from "@/components/ui/form"

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
