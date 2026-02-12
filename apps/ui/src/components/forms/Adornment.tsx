import { CheckIcon, CrossIcon } from "lucide-react"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

export function AdornmentSuccess() {
  removeThisWhenYouNeedMe("AdornmentSuccess")

  return (
    <span>
      <CheckIcon height="1.5rem" width="1.5rem" />
    </span>
  )
}

export function AdornmentError() {
  removeThisWhenYouNeedMe("AdornmentError")

  return (
    <span>
      <CrossIcon height="1.5rem" width="1.5rem" />
    </span>
  )
}
