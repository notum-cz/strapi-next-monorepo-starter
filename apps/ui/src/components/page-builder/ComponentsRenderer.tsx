import { Attribute, Types } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

import { AnimatedLogoRow } from "./components/AnimatedLogoRow"
import { CarouselGrid } from "./components/CarouselGrid"
import { ContactFormSection } from "./components/ContactFormSection"
import { Faq } from "./components/Faq"
import { FeatureGrid } from "./components/FeatureGrid"
import { HeadingWithCTAButton } from "./components/HeadingWithCTAButton"
import { Hero } from "./components/Hero"
import { HorizontalImages } from "./components/HorizontalImagesSlider"
import { ImageWithCTAButton } from "./components/ImageWithCTAButton"

// Define page-level components supported by this switch
const printableComps: {
  // eslint-disable-next-line no-unused-vars
  [K in Types.Common.UID.Component]?: React.ComponentType<any>
} = {
  "sections.faq": Faq,
  "sections.hero": Hero,
  "sections.feature-grid": FeatureGrid,
  "sections.carousel": CarouselGrid,
  "sections.heading-with-cta-button": HeadingWithCTAButton,
  "sections.image-with-cta-button": ImageWithCTAButton,
  "sections.animated-logo-row": AnimatedLogoRow,
  "sections.horizontal-images": HorizontalImages,
  "sections.contact-form": ContactFormSection,
  // Add more components here
}

export function ComponentsRenderer({
  pageComponents,
}: {
  readonly pageComponents: Attribute.GetDynamicZoneValue<
    Attribute.DynamicZone<Types.Common.UID.Component[]>
  >
}) {
  removeThisWhenYouNeedMe("ComponentsRenderer")

  return (
    <section>
      {pageComponents
        .filter((comp) => comp != null)
        .map((comp) => {
          const name = comp.__component
          const id = comp.id
          const key = `${name}-${id}`
          const Component = printableComps[name]

          if (Component == null) {
            console.warn(`Unknown component "${name}" with id "${id}".`)

            return (
              <div key={key} className="font-medium text-red-500">
                Component &quot;{key}&quot; is not implemented on the frontend.
              </div>
            )
          }

          return <Component key={key} component={comp} />
        })}
    </section>
  )
}
