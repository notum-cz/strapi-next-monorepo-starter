import Typography from "@/components/typography"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function RadioGroupSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <Typography>Default</Typography>
        <RadioGroup defaultValue="one" aria-label="showcase-radio">
          <div className="flex items-center gap-3">
            <RadioGroupItem value="one" id="showcase-radio-1" />
            <label htmlFor="showcase-radio-1">
              <Typography variant="small">Option one</Typography>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="two" id="showcase-radio-2" />
            <label htmlFor="showcase-radio-2">
              <Typography variant="small">Option two</Typography>
            </label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
