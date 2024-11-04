import { Schema } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Container } from "@/components/elementary/Container"

import { BasicImage } from "./BasicImage"
import { LinkStrapi } from "./LinkStrapi"

export const ImageWithCTAButton = ({
  component,
}: {
  readonly component: Schema.Attribute.ComponentValue<
    "sections.image-with-cta-button",
    false
  >
}) => {
  removeThisWhenYouNeedMe("ImageWithCTAButton")

  return (
    <section className="">
      <Container className="items-center gap-8 px-4 py-8 sm:py-16 md:grid md:grid-cols-2 lg:px-6 xl:gap-16">
        <div className="flex justify-center">
          <BasicImage
            component={component.image}
            className="w-full object-contain object-center"
            hideWhenMissing
          />
        </div>

        <div className="mt-4 md:mt-0">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {component.title}
          </h2>
          {component.subText && (
            <p className="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg">
              {component.subText}
            </p>
          )}

          <LinkStrapi
            component={component.link}
            className="focus:ring-primary-300 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-center text-base font-medium text-white focus:ring-4"
          />
        </div>
      </Container>
    </section>
  )
}
