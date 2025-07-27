import { CheckIcon, CrossIcon } from "lucide-react"

export const AdornmentSuccess = () => {
  return (
    <span>
      <CheckIcon height="1.5rem" width="1.5rem" />
    </span>
  )
}

export const AdornmentError = () => {
  return (
    <span>
      <CrossIcon height="1.5rem" width="1.5rem" />
    </span>
  )
}
