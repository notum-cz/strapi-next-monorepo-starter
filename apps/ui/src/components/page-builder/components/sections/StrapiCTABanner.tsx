import { Data } from "@repo/strapi-types"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import CkEditorRenderer from "@/components/elementary/ck-editor"
import { Container } from "@/components/elementary/Container"
import { StrapiBasicImage } from "@/components/page-builder/components/utilities/StrapiBasicImage"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"

export function StrapiCTABanner({
  component,
}: {
  readonly component: Data.Component<"sections.cta-banner">
}) {
  removeThisWhenYouNeedMe("StrapiCTABanner")

  console.log("Rendering StrapiCTABanner with component:", component.links)
  const { title, description, links, features } = component
  const isThereFeatures = features && features.length > 0
  return (
    <section className="px-6 2xl:px-0">
      <Container className="relative isolate flex flex-col justify-center gap-6 overflow-hidden bg-[#ff8e8e]/5 px-6 py-24 shadow-sm sm:rounded-3xl sm:px-16 lg:flex-row lg:gap-16">
        <div
          className={cn(
            "flex flex-col gap-6 lg:w-1/2",
            !isThereFeatures && "mx-auto"
          )}
        >
          <CkEditorRenderer htmlContent={title} />
          <CkEditorRenderer htmlContent={description} />
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            {links?.map((link) => (
              <StrapiLink key={link.id} component={link} />
            ))}
          </div>
        </div>
        {isThereFeatures && (
          <div className="flex flex-col gap-6 lg:w-1/2 lg:flex-row">
            {features?.map(({ id, title, description, image }) => (
              <div key={id} className="flex cursor-default gap-4">
                <div className="flex flex-col gap-4">
                  {image ? (
                    <StrapiBasicImage
                      component={image}
                      height={28}
                      width={28}
                      className="object-contain"
                    />
                  ) : null}
                  <CkEditorRenderer htmlContent={title} />
                  <CkEditorRenderer htmlContent={description} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}

StrapiCTABanner.displayName = "StrapiCTABanner"

export default StrapiCTABanner
