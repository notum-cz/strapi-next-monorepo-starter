import Typography from "@/components/typography"
import {
  type Variant,
  type FontWeight,
  fontWeightVariants,
  variantStyles,
} from "@/components/typography/config"

const HEADING_VARIANTS = Object.keys(variantStyles).filter((k) =>
  k.startsWith("heading")
) as (keyof typeof variantStyles)[]

const FONT_WEIGHTS = Object.keys(fontWeightVariants) as FontWeight[]

export default function HeadingsVariantsSection() {
  return (
    <div className="grid gap-6">
      {HEADING_VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-6">
          <Typography tag="h4">{variant}</Typography>

          <div className="flex flex-col gap-4">
            {FONT_WEIGHTS.map((w) => (
              <div key={w} className="">
                <Typography variant={variant as Variant} fontWeight={w}>
                  Typography showcase example
                </Typography>
              </div>
            ))}
          </div>
          <Typography variant={variant as Variant} className="italic">
            Typography showcase example
          </Typography>
        </div>
      ))}
    </div>
  )
}
