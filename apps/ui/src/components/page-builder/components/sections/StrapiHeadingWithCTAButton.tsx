import React from "react"
import { Data } from "@repo/strapi-types"

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
        <div className="mx-auto grid max-w-[--breakpoint-sm] grid-cols-1 items-center gap-8 text-left sm:grid-cols-3">
          <div className="flex flex-col items-center text-center sm:col-span-2">
            <h2 className="mb-4 text-4xl leading-tight font-extrabold tracking-tight text-gray-900">
              {component.title}
            </h2>
            {component.subText && (
              <p className="mb-6 font-light text-gray-500 md:text-lg">
                {component.subText}
              </p>
            )}
          </div>
          <div className="flex h-full items-center justify-start self-center sm:col-span-1">
            <StrapiLink
              component={component.cta}
              className="inline-flex w-full items-center justify-center rounded-lg bg-neutral-900 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-neutral-800 focus:ring-2 focus:ring-neutral-400 focus:outline-none lg:w-fit"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}

StrapiHeadingWithCTAButton.displayName = "StrapiHeadingWithCTAButton"

export default StrapiHeadingWithCTAButton
