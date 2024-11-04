import { Schema } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Container } from "@/components/elementary/Container"
import Heading from "@/components/typography/Heading"
import { Paragraph } from "@/components/typography/Paragraph"

import { BasicImage } from "./BasicImage"
import { LinkStrapi } from "./LinkStrapi"

export function Hero({
  component,
}: {
  readonly component: Schema.Attribute.ComponentValue<"sections.hero", false>
}) {
  removeThisWhenYouNeedMe("Hero")

  return (
    <section style={{ backgroundColor: component.bgColor ?? "transparent" }}>
      <Container className="grid gap-8 px-4 py-8 md:grid-cols-12 lg:py-16 xl:gap-0">
        <div className="mr-auto flex w-full flex-col items-center justify-center md:col-span-7">
          <Heading
            tag="h1"
            variant="heading1"
            className="mb-4 max-w-2xl text-center"
          >
            {component.title}
          </Heading>
          {component.subTitle && (
            <Paragraph className="mb-6 max-w-2xl font-light text-gray-500">
              {component.subTitle}
            </Paragraph>
          )}

          {component.links && (
            <div className="space-x flex">
              {component.links.map((link, i) => (
                <LinkStrapi
                  key={i}
                  component={link}
                  className="focus:ring-primary-300 mr-3 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-center text-base font-medium text-white focus:ring-4"
                />
              ))}
            </div>
          )}
        </div>

        {component.image?.media && (
          <div className="hidden md:col-span-5 md:mt-0 md:flex">
            <BasicImage component={component.image} className="object-cover" />
          </div>
        )}
      </Container>
    </section>
  )
}
