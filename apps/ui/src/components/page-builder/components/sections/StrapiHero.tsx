import { Data } from "@repo/strapi-types"
import { Check } from "lucide-react"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Container } from "@/components/elementary/Container"
import { StrapiBasicImage } from "@/components/page-builder/components/utilities/StrapiBasicImage"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"
import Heading from "@/components/typography/Heading"
import { Paragraph } from "@/components/typography/Paragraph"

export function StrapiHero({
  component,
}: {
  readonly component: Data.Component<"sections.hero">
}) {
  removeThisWhenYouNeedMe("StrapiHero")

  return (
    <section style={{ backgroundColor: component.bgColor ?? "transparent" }}>
      <Container className="flex flex-col gap-6 px-4 py-8 md:flex-row lg:py-12 xl:gap-0">
        <div
          className={`flex w-full flex-col justify-center ${
            component.image?.media ? "md:w-1/2" : "md:w-full"
          }`}
        >
          <Heading
            tag="h1"
            variant="heading1"
            className="mb-4 max-w-2xl text-center text-3xl sm:text-4xl lg:text-start"
          >
            {component.title}
          </Heading>
          {component.subTitle && (
            <Heading
              tag="h2"
              variant="heading2"
              className="mb-6 max-w-2xl text-center lg:text-start"
            >
              {component.subTitle}
            </Heading>
          )}
          {component?.steps &&
            component?.steps?.length > 0 &&
            component.steps.map((step) => (
              <div key={step.id} className="flex items-center gap-1 py-2">
                <Check className="text-primary-500" />
                <Paragraph>{step.text}</Paragraph>
              </div>
            ))}

          {component.links && (
            <div className="flex flex-col gap-2 pt-4 lg:flex-row lg:gap-4">
              {component.links.map((link, i) => (
                <StrapiLink
                  key={i}
                  component={link}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-neutral-900 px-5 py-3 text-base font-medium text-white transition-colors hover:bg-neutral-800 focus:ring-2 focus:ring-neutral-400 focus:outline-none lg:w-fit"
                />
              ))}
            </div>
          )}
        </div>

        {component.image?.media && (
          <div className="flex items-center justify-center md:mt-0 md:w-1/2">
            <StrapiBasicImage
              component={component.image}
              className="rounded-3xl object-contain"
              forcedSizes={{ height: 500 }}
            />
          </div>
        )}
      </Container>
    </section>
  )
}

StrapiHero.displayName = "StrapiHero"

export default StrapiHero
