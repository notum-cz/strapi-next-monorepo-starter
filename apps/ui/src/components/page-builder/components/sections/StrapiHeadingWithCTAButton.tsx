import React from "react"
import { Data } from "@repo/strapi"

import { Container } from "@/components/elementary/Container"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"
import { Button } from "@/components/ui/button"

export const StrapiHeadingWithCTAButton = ({
  component,
}: {
  readonly component: Data.Component<"sections.heading-with-cta-button">
}) => {
  return (
    <section className="relative overflow-hidden from-slate-50 via-white to-red-50/30">
      <div className="bg-grid-slate-100 dark:bg-grid-slate-700/25 absolute inset-0 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      <Container className="relative py-16 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                {component.title}
              </span>
            </h2>

            {component.subText && (
              <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600">
                {component.subText}
              </p>
            )}
          </div>

          {component.cta && (
            <div className="mt-10">
              <StrapiLink
                component={component.cta}
                className="no-underline hover:no-underline"
              >
                <Button size="lg">{component.cta.label}</Button>
              </StrapiLink>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

StrapiHeadingWithCTAButton.displayName = "StrapiHeadingWithCTAButton"

export default StrapiHeadingWithCTAButton
