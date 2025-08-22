import React from "react"
import { Data } from "@repo/strapi"

import { Container } from "@/components/elementary/Container"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"

export const StrapiHeadingWithCTAButton = ({
  component,
}: {
  readonly component: Data.Component<"sections.heading-with-cta-button">
}) => {
  return (
    <section>
      <Container className="py-8 lg:py-12">
        <div className="mx-auto max-w-4xl text-left md:text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
            {component.title}
          </h2>
          {component.subText && (
            <p className="mb-6 text-base text-gray-600 md:text-lg">
              {component.subText}
            </p>
          )}

          <StrapiLink
            component={component.cta}
            className="focus:ring-primary-300 bg-primary inline-flex items-center justify-center rounded-lg px-5 py-3 text-center text-base font-medium text-white focus:ring-4"
          />
        </div>
      </Container>
    </section>
  )
}

StrapiHeadingWithCTAButton.displayName = "StrapiHeadingWithCTAButton"

export default StrapiHeadingWithCTAButton
