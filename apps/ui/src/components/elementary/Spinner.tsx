import { cn } from "@/lib/styles"

interface Props {
  readonly className?: string
  readonly borderColorClass?: string
  readonly borderWidthClass?: string
}

export function Spinner({
  className = "",
  borderColorClass = "border-white",
  borderWidthClass = "border",
}: Props) {
  return (
    <span
      className={cn(
        "box-border inline-block min-h-2 min-w-2 animate-spin rounded-full border-solid border-b-transparent",
        borderWidthClass,
        borderColorClass,
        className
      )}
    />
  )
}
