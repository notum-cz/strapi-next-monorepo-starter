import Typography from "@/components/typography"
import { Checkbox } from "@/components/ui/checkbox"

export default function CheckboxSection() {
  return (
    <div className="flex flex-col gap-6">
      <Typography>Default</Typography>
      <div className="flex items-center gap-3">
        <Checkbox id="showcase-checkbox-1" />
        <label htmlFor="showcase-checkbox-1">
          <Typography variant="small">Unchecked</Typography>
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="showcase-checkbox-2" defaultChecked />
        <label htmlFor="showcase-checkbox-2">
          <Typography variant="small">Checked</Typography>
        </label>
      </div>
    </div>
  )
}
