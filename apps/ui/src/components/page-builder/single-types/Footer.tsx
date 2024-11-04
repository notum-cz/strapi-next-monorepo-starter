import { Fragment } from "react"

import { AppLocale } from "@/types/general"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import Strapi from "@/lib/strapi"
import { cn } from "@/lib/styles"
import { Container } from "@/components/elementary/Container"

import { ImageWithLink } from "../components/ImageWithLink"
import { LinkStrapi } from "../components/LinkStrapi"

async function fetchData(locale: string) {
  try {
    return await Strapi.fetchOne(
      "api::footer.footer",
      undefined,
      {
        locale,
        populate: ["sections", "gridCols", "logoImage", "links"],
        pLevel: 5,
      },
      undefined,
      { omitAuthorization: true }
    )
  } catch (e: any) {
    console.error(
      `Data for "api::footer.footer" content type wasn't fetched: `,
      e?.message
    )
    return undefined
  }
}

export async function PageBuilderFooter({
  locale,
}: {
  readonly locale: AppLocale
}) {
  removeThisWhenYouNeedMe("PageBuilderFooter")

  const response = await fetchData(locale)
  const component = response?.data

  if (component == null) {
    return null
  }

  const [desktop, tablet, mobile] = [
    component.gridCols?.desktop ?? 4,
    component.gridCols?.tablet ?? 3,
    component.gridCols?.mobile ?? 1,
  ]

  return (
    <div className="bg-gray-100">
      <Container className="pb-8 pt-12">
        <div className="grid grid-cols-1 gap-10 pb-8 sm:grid-cols-[30%_1fr]">
          <div className="flex flex-col space-y-4">
            <ImageWithLink component={component.logoImage} />
          </div>
          <div
            className={cn(
              "grid gap-8",
              `grid-cols-${mobile}`,
              `sm:grid-cols-${mobile}`,
              `md:grid-cols-${tablet}`,
              `lg:grid-cols-${desktop}`
            )}
          >
            {component.sections?.map((section) => (
              <div className="flex flex-col" key={section.id}>
                <h3 className="pb-2 text-lg font-bold">{section.title}</h3>

                {section.links?.map((link, i) => (
                  <LinkStrapi
                    key={String(link.id) + i}
                    component={link}
                    className="w-fit text-sm text-primary hover:underline"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {component.copyRight && (
              <p className="">
                {component.copyRight.replace(
                  "{YEAR}",
                  new Date().getFullYear().toString()
                )}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end sm:flex-row sm:items-center sm:space-x-4">
            {component.links?.map((link, i) => (
              <Fragment key={String(link.id) + i}>
                <LinkStrapi
                  component={link}
                  className="relative w-fit text-sm text-primary hover:underline"
                />

                {i < component.links!.length - 1 && (
                  <span
                    key={link.id + "_dot"}
                    className="mx-2 hidden pt-0.5 sm:inline-block"
                  >
                    •
                  </span>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}
