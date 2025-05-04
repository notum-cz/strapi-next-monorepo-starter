import React from "react"
import { Data } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Container } from "@/components/elementary/Container"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"

export const StrapiHeadingWithCTAButton = ({
  component,
}: {
  readonly component: Data.Component<"sections.heading-with-cta-button">
}) => {
  removeThisWhenYouNeedMe("StrapiHeadingWithCTAButton")

  return (
    <section className="px-4 py-8 sm:py-16 lg:px-6">
      <Container>
        <div className="mx-auto max-w-(--breakpoint-sm) text-center">
          <h2 className="mb-4 text-4xl leading-tight font-extrabold tracking-tight text-gray-900">
            {component.title}
          </h2>
          {component.subText && (
            <p className="mb-6 font-light text-gray-500 md:text-lg">
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
