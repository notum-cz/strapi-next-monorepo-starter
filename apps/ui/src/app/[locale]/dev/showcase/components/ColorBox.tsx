import Typography from "@/components/typography"
import type { TextColor } from "@/components/typography/config"
import { cn } from "@/lib/styles"

interface ColorBoxProps {
  background?: string
  textColor?: TextColor | string
}

function ColorBox({
  background = "bg-primary",
  textColor = "black",
}: ColorBoxProps) {
  return (
    <div
      className={cn(
        String(background),
        "flex size-32 flex-col justify-end pl-2"
      )}
    >
      <Typography textColor={textColor as TextColor}>
        {String(background)}
      </Typography>
    </div>
  )
}

export default ColorBox
