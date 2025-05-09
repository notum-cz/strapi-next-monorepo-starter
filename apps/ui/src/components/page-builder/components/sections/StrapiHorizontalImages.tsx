import { Data } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import { Container } from "@/components/elementary/Container"
import StrapiImageWithLink from "@/components/page-builder/components/utilities/StrapiImageWithLink"

export function StrapiHorizontalImages({
  component,
}: {
  readonly component: Data.Component<"sections.horizontal-images">
}) {
  removeThisWhenYouNeedMe("StrapiHorizontalImages")

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
              <StrapiImageWithLink
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

StrapiHorizontalImages.displayName = "StrapiHorizontalImages"

export default StrapiHorizontalImages
