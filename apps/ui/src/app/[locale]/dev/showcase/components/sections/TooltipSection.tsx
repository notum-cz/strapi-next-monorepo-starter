import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function TooltipSection() {
  return (
    <div className="flex flex-col gap-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className="mx-auto w-fit">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>This is a tooltip</TooltipContent>
      </Tooltip>
    </div>
  )
}
