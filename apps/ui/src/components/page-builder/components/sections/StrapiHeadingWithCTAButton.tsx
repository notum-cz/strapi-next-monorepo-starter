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
        <div className="mx-auto max-w-[--breakpoint-sm] grid grid-cols-1 sm:grid-cols-3 items-center text-left gap-8">
          <div className="sm:col-span-2 flex flex-col items-center text-center">
            <h2 className="mb-4 text-4xl leading-tight font-extrabold tracking-tight text-gray-900">
              {component.title}
            </h2>
            {component.subText && (
              <p className="mb-6 font-light text-gray-500 md:text-lg">
                {component.subText}
              </p>
            )}
          </div>
          <div className="sm:col-span-1 flex items-center justify-start h-full self-center">
            <StrapiLink
              component={component.cta}
              className="inline-flex w-full lg:w-fit items-center justify-center rounded-lg bg-neutral-900 px-8 py-4 text-lg font-semibold text-white hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}

StrapiHeadingWithCTAButton.displayName = "StrapiHeadingWithCTAButton"

export default StrapiHeadingWithCTAButton
