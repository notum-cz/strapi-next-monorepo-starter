import { AppLocale } from "@/types/general"

import { fetchFooter } from "@/lib/strapi-api/content/server"
import { Container } from "@/components/elementary/Container"
import StrapiImageWithLink from "@/components/page-builder/components/utilities/StrapiImageWithLink"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"

export async function StrapiFooter({ locale }: { readonly locale: AppLocale }) {
  const response = await fetchFooter(locale)
  const component = response?.data

  if (!component) return null

  return (
    <footer className="border-t bg-white/10 backdrop-blur">
      <Container className="p-4 md:p-6">
        <div className="space-y-6 md:space-y-8">
          {/* Logo & Sections */}
          {(component.logoImage || Boolean(component.sections?.length)) && (
            <div className="space-y-6 md:grid md:grid-cols-[auto_1fr] md:gap-8 md:space-y-0">
              {component.logoImage && (
                <div className="text-center md:text-left">
                  <StrapiImageWithLink
                    component={component.logoImage}
                    imageProps={{ hideWhenMissing: true }}
                  />
                </div>
              )}

              {Boolean(component.sections?.length) && (
                <div className="space-y-6 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:grid-cols-3">
                  {component.sections.map((section) => (
                    <div key={section.id} className="text-center md:text-left">
                      <h3 className="mb-3 text-sm font-semibold md:text-base">
                        {section.title}
                      </h3>
                      <div className="space-y-2">
                        {section.links?.map((link, i) => (
                          <StrapiLink
                            key={`${link.id}-${i}`}
                            component={link}
                            className="block text-sm text-gray-600 hover:text-gray-900"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom Bar */}
          <div className="flex flex-col gap-4 pt-6 text-xs text-gray-500 md:flex-row md:justify-between md:text-sm">
            {component.copyRight && (
              <div className="text-center md:text-left">
                {component.includeYear
                  ? `© 2025 ${component.copyRight}`
                  : component.copyRight}
              </div>
            )}

            {Boolean(component.links?.length) && (
              <div className="flex flex-wrap justify-center gap-4 md:justify-end">
                {component.links.map((link, i) => (
                  <StrapiLink
                    key={`${link.id}-${i}`}
                    component={link}
                    className="hover:text-gray-700"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default StrapiFooter
