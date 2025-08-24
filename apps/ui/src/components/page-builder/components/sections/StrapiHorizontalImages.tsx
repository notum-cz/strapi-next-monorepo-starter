import { Data } from "@repo/strapi"

import { Container } from "@/components/elementary/Container"
import { StrapiBasicImage } from "@/components/page-builder/components/utilities/StrapiBasicImage"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"

export function StrapiHorizontalImages({
  component,
}: {
  readonly component: Data.Component<"sections.horizontal-images">
}) {
  return (
    <section>
      <Container className="py-8">
        <div className="flex flex-col items-center">
          <p className="mb-6 text-center tracking-tight text-gray-900">
            {component.title}
          </p>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {component.images?.map((x, i) => (
              <div key={String(x.id) + i} className="flex-shrink-0">
                {x.link ? (
                  <StrapiLink component={x.link} className="block h-auto p-0">
                    <StrapiBasicImage
                      component={x.image}
                      className="rounded-lg object-cover"
                      forcedSizes={{
                        width: component.fixedImageWidth || 300,
                        height: component.fixedImageHeight || 200,
                      }}
                    />
                  </StrapiLink>
                ) : (
                  <StrapiBasicImage
                    component={x.image}
                    className="rounded-lg object-cover"
                    forcedSizes={{
                      width: component.fixedImageWidth || 300,
                      height: component.fixedImageHeight || 200,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

StrapiHorizontalImages.displayName = "StrapiHorizontalImages"

export default StrapiHorizontalImages
