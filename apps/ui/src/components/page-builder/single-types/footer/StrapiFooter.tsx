import { Fragment } from "react"
import { Locale } from "next-intl"

import { fetchFooter } from "@/lib/strapi-api/content/server"
import { cn } from "@/lib/styles"
import { Container } from "@/components/elementary/Container"
import StrapiImageWithLink from "@/components/page-builder/components/utilities/StrapiImageWithLink"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"

export async function StrapiFooter({ locale }: { readonly locale: Locale }) {
  const response = await fetchFooter(locale)
  const component = response?.data

  if (component == null) {
    return null
  }

  return (
    <div className="w-full border-t bg-white/10 shadow-sm backdrop-blur transition-colors duration-300">
      <Container className="pt-8 pb-4">
        <div className="grid grid-cols-1 gap-6 pb-4 sm:grid-cols-[30%_1fr]">
          <div className="flex flex-col space-y-4">
            <StrapiImageWithLink
              component={component.logoImage}
              imageProps={{ hideWhenMissing: true }}
            />
          </div>

          <div className={cn("grid gap-8")}>
            {component.sections?.map((section) => (
              <div className="flex flex-col" key={section.id}>
                <h3 className="pb-2 text-lg font-bold">{section.title}</h3>

                {section.links?.map((link, i) => (
                  <StrapiLink
                    key={String(link.id) + i}
                    component={link}
                    className="text-primary w-fit text-sm hover:underline"
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
                <StrapiLink
                  component={link}
                  className="text-primary relative w-fit text-sm hover:underline"
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

StrapiFooter.displayName = "StrapiFooter"

export default StrapiFooter
