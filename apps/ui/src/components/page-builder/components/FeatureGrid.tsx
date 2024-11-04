import { Schema } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import { Container } from "@/components/elementary/Container"

import { BasicImage } from "./BasicImage"

const DEFAULT_IMG_SIZE = 50

export function FeatureGrid({
  component,
}: {
  readonly component: Schema.Attribute.ComponentValue<
    "sections.feature-grid",
    false
  >
}) {
  removeThisWhenYouNeedMe("FeatureGrid")

  const [desktop, tablet, mobile] = [
    component.gridCol?.desktop ?? 4,
    component.gridCol?.tablet ?? 3,
    component.gridCol?.mobile ?? 1,
  ]

  return (
    <section>
      <Container className="grid px-4 py-8 lg:grid-cols-12 lg:gap-8 lg:py-16 xl:gap-0">
        <div
          className={cn(
            "grid gap-8",
            `grid-cols-${mobile}`,
            `sm:grid-cols-${mobile}`,
            `md:grid-cols-${tablet}`,
            `lg:grid-cols-${desktop}`
          )}
        >
          {component.items?.map((item) => (
            <div className="flex flex-col" key={item.id}>
              <BasicImage
                component={item.image}
                className={cn(
                  "mb-2 object-cover",
                  component.imageRadius && `rounded-${component.imageRadius}`
                )}
                fallbackSizes={{
                  width: DEFAULT_IMG_SIZE,
                  height: DEFAULT_IMG_SIZE,
                }}
              />

              <h3 className="text-lg font-bold">{item.title}</h3>
              {item.subTitle && <p className="pb-2">{item.subTitle}</p>}
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
