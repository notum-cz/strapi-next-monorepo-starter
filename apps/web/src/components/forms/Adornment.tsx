import { CheckIcon, CrossIcon } from "lucide-react"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

export const AdornmentSuccess = () => {
  removeThisWhenYouNeedMe("AdornmentSuccess")

  return (
    <span>
      <CheckIcon height="1.5rem" width="1.5rem" />
    </span>
  )
}

export const AdornmentError = () => {
  removeThisWhenYouNeedMe("AdornmentError")

  return (
    <span>
      <CrossIcon height="1.5rem" width="1.5rem" />
    </span>
  )
}
