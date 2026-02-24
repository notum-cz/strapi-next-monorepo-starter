import type { Locale } from "next-intl"
import { use } from "react"

import { Container } from "@/components/elementary/Container"
import { ThemeToggle } from "@/components/elementary/ThemeToggle"
import StrapiImageWithLink from "@/components/page-builder/components/utilities/StrapiImageWithLink"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"
import Typography from "@/components/typography"
import { fetchFooter } from "@/lib/strapi-api/content/server"
import { cn } from "@/lib/styles"

export function StrapiFooter({ locale }: { readonly locale: Locale }) {
  const response = use(fetchFooter(locale))
  const footer = response?.data

  if (footer == null) {
    return null
  }

  return (
    <div className="bg-primary/10 w-full border-t shadow-sm backdrop-blur transition-colors duration-300">
      <Container className="pt-8 pb-4">
        <div className="flex flex-col justify-between gap-10 lg:flex-row">
          <div className="flex flex-col items-center justify-center space-y-4 md:items-start md:justify-start">
            <StrapiImageWithLink
              component={footer.logoImage}
              imageProps={{ hideWhenMissing: true }}
            />
          </div>

          <div
            className={cn(
              "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
            )}
          >
            {footer.sections?.map((section) => (
              <div
                className="flex flex-col items-center md:items-start"
                key={section.id}
              >
                <h3 className="pb-2 text-lg font-bold">{section.title}</h3>

                {section.links?.map((link) => (
                  <StrapiLink
                    key={link.id}
                    component={link}
                    className="text-primary w-fit text-sm hover:underline"
                  />
                ))}
              </div>
            ))}
          </div>
          <ThemeToggle className="absolute top-6 right-6 lg:flex" />
        </div>

        <div className="flex flex-col-reverse justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            {footer.copyRight && (
              <Typography className="mx-auto w-fit lg:mx-0">
                {footer.copyRight.replace(
                  "{YEAR}",
                  new Date().getFullYear().toString()
                )}
              </Typography>
            )}
          </div>

          <div className="flex flex-col items-center sm:flex-row md:space-x-4 lg:items-end">
            {footer.links?.map((link) => (
              <StrapiLink
                key={link.id}
                component={link}
                className="w-full md:w-fit"
              />
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}

StrapiFooter.displayName = "StrapiFooter"

export default StrapiFooter
