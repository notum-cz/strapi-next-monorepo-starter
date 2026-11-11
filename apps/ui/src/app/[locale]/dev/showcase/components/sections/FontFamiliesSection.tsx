import ManualItem from "@/app/[locale]/dev/showcase/components/ManualItem"
import Typography from "@/components/typography"

function FontFamiliesSection() {
  return (
    <div className="flex flex-col gap-4">
      <Typography tag="h6">Roboto</Typography>
      <ManualItem description='<Typography variant="heading6">Typography showcase example</Typography>'>
        <Typography variant="heading6">Typography showcase example</Typography>
      </ManualItem>
      <Typography variant="small">
        Headings and body text use the local Roboto variable font from the
        shared design system.
      </Typography>
    </div>
  )
}

export default FontFamiliesSection
