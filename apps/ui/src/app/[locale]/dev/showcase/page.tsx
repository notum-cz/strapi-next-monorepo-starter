import type * as React from "react"

import { AnchorButton } from "@/app/[locale]/dev/showcase/components/AnchorButton"
import ManualItem from "@/app/[locale]/dev/showcase/components/ManualItem"
import ManualSection from "@/app/[locale]/dev/showcase/components/ManualSection"
import showcaseItems from "@/app/[locale]/dev/showcase/showcaseItems"
import Typography from "@/components/typography"

function ShowcasePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <Typography tag="h1">Brand manual</Typography>
        <Typography tag="h2">Atomic Items</Typography>
        <nav className="flex flex-wrap gap-2">
          {showcaseItems
            .filter((i) => i.kind === "atomic")
            .map(({ id, label }) => (
              <AnchorButton key={id} id={id} label={label} />
            ))}
        </nav>
        <Typography tag="h2">Components preview </Typography>
        <nav className="flex flex-wrap gap-2">
          {showcaseItems
            .filter((i) => i.kind === "component")
            .map(({ id, label }) => (
              <AnchorButton key={id} id={id} label={label} />
            ))}
        </nav>
      </div>
      {showcaseItems.map(({ id, component: Component, label, description }) => {
        const Comp = Component as React.ComponentType<Record<string, unknown>>

        return (
          <ManualSection
            key={id}
            title={label}
            id={id}
            className="flex flex-col gap-6"
          >
            <ManualItem description={description}>
              <Comp />
            </ManualItem>
          </ManualSection>
        )
      })}
    </div>
  )
}

export default ShowcasePage
