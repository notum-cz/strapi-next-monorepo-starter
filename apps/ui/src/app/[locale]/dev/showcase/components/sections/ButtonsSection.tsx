import { PlusIcon } from "lucide-react"

import { BUTTON_SHOWCASE } from "@/app/[locale]/dev/showcase/constants"
import Typography from "@/components/typography"
import { Button } from "@/components/ui/button"

function ButtonsSection() {
  return (
    <div className="grid gap-6 p-2">
      <div className="flex flex-col gap-2">
        <Typography>Variants</Typography>
        <div className="flex flex-wrap items-center gap-3">
          {BUTTON_SHOWCASE.variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-2">
          <Typography>Sizes</Typography>
          {BUTTON_SHOWCASE.sizes.map((size) => (
            <div key={size} className="flex flex-col gap-2">
              <Typography variant="small">{size}</Typography>
              <Button size={size}>
                {size.startsWith("icon") ? (
                  <PlusIcon className="h-4 w-4" />
                ) : (
                  "Button showcase"
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Typography>States</Typography>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Disabled</Button>
          <Button isLoading>Loading</Button>
        </div>
      </div>
    </div>
  )
}

export default ButtonsSection
