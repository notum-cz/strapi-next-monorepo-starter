import { Schema, UID } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

import { ErrorBoundary } from "../elementary/ErrorBoundary"
import { AnimatedLogoRow } from "./components/AnimatedLogoRow"
import { CarouselGrid } from "./components/CarouselGrid"
import { ContactFormSection } from "./components/ContactFormSection"
import { Faq } from "./components/Faq"
import { FeatureGrid } from "./components/FeatureGrid"
import { HeadingWithCTAButton } from "./components/HeadingWithCTAButton"
import { Hero } from "./components/Hero"
import { HorizontalImages } from "./components/HorizontalImagesSlider"
import { ImageWithCTAButton } from "./components/ImageWithCTAButton"
import { Newsletter } from "./components/Newsletter"

// Define page-level components supported by this switch
const printableComps: {
  // eslint-disable-next-line no-unused-vars
  [K in UID.Component]?: React.ComponentType<any>
} = {
  "sections.animated-logo-row": AnimatedLogoRow,
  "sections.carousel": CarouselGrid,
  "sections.contact-form": ContactFormSection,
  "sections.faq": Faq,
  "sections.feature-grid": FeatureGrid,
  "sections.hero": Hero,
  "sections.heading-with-cta-button": HeadingWithCTAButton,
  "sections.horizontal-images": HorizontalImages,
  "sections.image-with-cta-button": ImageWithCTAButton,
  "sections.newsletter": Newsletter,
  // Add more components here
}

export function ComponentsRenderer({
  pageComponents,
}: {
  readonly pageComponents: Schema.Attribute.GetDynamicZoneValue<
    Schema.Attribute.DynamicZone<UID.Component[]>
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

          return (
            <ErrorBoundary key={key}>
              <Component component={comp} />
            </ErrorBoundary>
          )
        })}
    </section>
  )
}
