import React from "react"
import { Schema } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Container } from "@/components/elementary/Container"

import { LinkStrapi } from "./LinkStrapi"

export const HeadingWithCTAButton = ({
  component,
}: {
  readonly component: Schema.Attribute.ComponentValue<
    "sections.heading-with-cta-button",
    false
  >
}) => {
  removeThisWhenYouNeedMe("HeadingWithCTAButton")

  return (
    <section className="px-4 py-8 sm:py-16 lg:px-6">
      <Container>
        <div className="mx-auto max-w-screen-sm text-center">
          <h2 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-gray-900">
            {component.title}
          </h2>
          {component.subText && (
            <p className="mb-6 font-light text-gray-500 md:text-lg">
              {component.subText}
            </p>
          )}

          <LinkStrapi
            component={component.cta}
            className="focus:ring-primary-300 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-center text-base font-medium text-white focus:ring-4"
          />
        </div>
      </Container>
    </section>
  )
}
