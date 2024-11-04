import { Schema } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import { Container } from "@/components/elementary/Container"

import { ImageWithLink } from "./ImageWithLink"

export function HorizontalImages({
  component,
}: {
  readonly component: Schema.Attribute.ComponentValue<
    "sections.horizontal-images",
    false
  >
}) {
  removeThisWhenYouNeedMe("HorizontalImages")

  return (
    <section>
      <Container className="py-8">
        <div className="flex flex-col items-center">
          <p className="mb-6 text-center tracking-tight text-gray-900">
            {component.title}
          </p>

          <div
            className={cn(
              "no-scrollbar flex max-w-full overflow-x-auto",
              `space-x-${component.spacing ?? 4}`
            )}
          >
            {component.images?.map((x, i) => (
              <ImageWithLink
                component={x}
                key={String(x.id) + i}
                imageProps={{
                  className: cn({
                    [`rounded-${component.imageRadius}`]: Boolean(
                      component.imageRadius
                    ),
                    "object-cover": Boolean(
                      component.fixedImageHeight ?? component.fixedImageWidth
                    ),
                  }),
                  forcedSizes: {
                    width: component.fixedImageWidth,
                    height: component.fixedImageHeight,
                  },
                }}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
