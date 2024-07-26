import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import {
  Tooltip as RadixTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Props {
  readonly children: React.ReactNode
  readonly content: React.ReactNode
  readonly contentProps?: Partial<
    React.ComponentPropsWithoutRef<typeof TooltipContent>
  >
}

export function Tooltip({ children, content, contentProps }: Props) {
  removeThisWhenYouNeedMe("Tooltip")

  return (
    <TooltipProvider>
      <RadixTooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent {...contentProps}>{content}</TooltipContent>
      </RadixTooltip>
    </TooltipProvider>
  )
}
