import ManualItem from "@/app/[locale]/dev/showcase/components/ManualItem"
import Typography from "@/components/typography"
import {
  type variantStyles,
  type Variant,
  type FontWeight,
  fontWeightVariants,
} from "@/components/typography/config"

const BODY_VARIANTS = [
  "small",
  "medium",
  "large",
] as (keyof typeof variantStyles)[]

const FONT_WEIGHTS = Object.keys(fontWeightVariants) as FontWeight[]

export default function BodyVariantsSection() {
  return (
    <div className="grid gap-6">
      {BODY_VARIANTS.map((variant) => (
        <div key={variant} className="grid gap-4">
          <Typography tag="h4">{variant}</Typography>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-4">
              {FONT_WEIGHTS.map((w) => (
                <ManualItem
                  key={w}
                  description={`<Typography variant="${variant}" fontWeight="${w}">Example</Typography>`}
                >
                  <Typography variant={variant as Variant} fontWeight={w}>
                    {`${variant} — ${w}`}
                  </Typography>
                </ManualItem>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
