import ColorBox from "@/app/[locale]/dev/showcase/components/ColorBox"
import { themeColorPalette } from "@/app/[locale]/dev/showcase/constants"
import type { TextColor } from "@/components/typography/config"

function ColorsSection() {
  return (
    <div className="flex flex-wrap gap-4 lg:gap-10">
      {Object.keys(themeColorPalette).map((k) => {
        const mapping = (
          themeColorPalette as Record<
            string,
            { label: string; background: string; text: TextColor }
          >
        )[k] || {
          label: "unknown",
          background: "bg-unknown",
          text: "black",
        }

        const bg = mapping.background
        const txt = mapping.text

        return <ColorBox key={k} background={bg} textColor={txt} />
      })}
    </div>
  )
}

export default ColorsSection
