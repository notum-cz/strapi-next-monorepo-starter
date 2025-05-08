import { Data } from "@repo/strapi"

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
      <Container className="grid gap-6 px-4 py-8 md:grid-cols-12 lg:py-12 xl:gap-0">
        <div className="mr-auto flex w-full flex-col items-center justify-center md:col-span-6">
          <Heading
            tag="h1"
            variant="heading1"
            className="mb-4 max-w-2xl text-center"
          >
            {component.title}
          </Heading>
          {component.subTitle && (
            <Paragraph className="mb-6 max-w-2xl">
              {component.subTitle}
            </Paragraph>
          )}

          {component.links && (
            <div className="space-x flex">
              {component.links.map((link, i) => (
                <StrapiLink
                  key={i}
                  component={link}
                  className="focus:ring-primary-300 bg-primary mr-3 inline-flex items-center justify-center rounded-lg px-5 py-3 text-center text-base font-medium text-white focus:ring-4"
                />
              ))}
            </div>
          )}
        </div>

        {component.image?.media && (
          <div className="hidden md:col-span-6 md:mt-0 md:flex">
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
