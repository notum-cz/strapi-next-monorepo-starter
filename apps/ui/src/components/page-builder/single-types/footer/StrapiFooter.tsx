import { AppLocale } from "@/types/general"

import { fetchFooter } from "@/lib/strapi-api/content/server"
import { Container } from "@/components/elementary/Container"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"
import StrapiQuoteCarousel from "@/components/page-builder/components/utilities/StrapiQuoteCarousel"
import StrapiSocialIcon from "@/components/page-builder/components/utilities/StrapiSocialIcon"

export async function StrapiFooter({ locale }: { readonly locale: AppLocale }) {
  const response = await fetchFooter(locale)
  const component = response?.data

  if (!component) return null

  return (
    <footer className="border-t border-gray-200 bg-white text-gray-900">
      <Container className="px-4 py-12 md:px-6 lg:py-16">
        <div className="space-y-12">
          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
            {/* Brand Section */}
            <div className="space-y-6">
              {component.quoteCarousel && (
                <StrapiQuoteCarousel
                  component={component.quoteCarousel}
                  className="max-w-md text-sm leading-relaxed text-gray-500"
                />
              )}

              {Boolean(component.socialIcons?.length) && (
                <div className="flex items-center gap-4">
                  {component.socialIcons.map((socialIcon) => (
                    <StrapiSocialIcon
                      key={socialIcon.id}
                      component={socialIcon}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Sections */}
            {Boolean(component.sections?.length) && (
              <div
                className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-${Math.min(component.sections.length, 4)}`}
              >
                {component.sections.slice(0, 4).map((section) => (
                  <div key={section.id} className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <nav className="space-y-3">
                      {section.links?.map((link, i) => (
                        <StrapiLink
                          key={`${link.id}-${i}`}
                          component={link}
                          className="block text-sm text-gray-600 transition-colors duration-200 hover:text-gray-900"
                        />
                      ))}
                    </nav>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col gap-4 border-t pt-8 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {component.copyRight && (
                <div className="text-sm text-gray-500">
                  {component.includeYear
                    ? `© ${new Date().getFullYear()} ${component.copyRight}`
                    : component.copyRight}
                </div>
              )}
            </div>

            {Boolean(component.links?.length) && (
              <nav className="flex flex-col gap-3 md:flex-row md:flex-wrap md:gap-6">
                {component.links.map((link, i) => (
                  <StrapiLink
                    key={`${link.id}-${i}`}
                    component={link}
                    className="w-full !items-start !justify-start py-2 text-left text-sm text-gray-600 transition-colors duration-200 hover:text-gray-700 md:w-auto md:py-0"
                  />
                ))}
              </nav>
            )}
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default StrapiFooter
