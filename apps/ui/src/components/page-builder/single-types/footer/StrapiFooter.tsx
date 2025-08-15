import { AppLocale } from "@/types/general"
import { fetchFooter } from "@/lib/strapi-api/content/server"
import { Container } from "@/components/elementary/Container"
import StrapiImageWithLink from "@/components/page-builder/components/utilities/StrapiImageWithLink"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"
import StrapiMobileFooter from "./StrapiMobileFooter"

export async function StrapiFooter({ locale }: { readonly locale: AppLocale }) {
  const response = await fetchFooter(locale)
  const component = response?.data

  if (!component) return null

  return (
    <>
      {/* Mobile Footer */}
      <StrapiMobileFooter component={component} />
      
      {/* Desktop Footer */}
      <footer className="hidden bg-white/10 backdrop-blur md:block">
        <Container className="p-6">
          <div className="space-y-8">
            {/* Logo & Sections */}
            {(component.logoImage || Boolean(component.sections?.length)) && (
              <div className="grid gap-8 md:grid-cols-[auto_1fr]">
                {component.logoImage && (
                  <StrapiImageWithLink
                    component={component.logoImage}
                    imageProps={{ hideWhenMissing: true }}
                  />
                )}
                
                {Boolean(component.sections?.length) && (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {component.sections.map((section) => (
                      <div key={section.id}>
                        <h3 className="mb-3 font-semibold">{section.title}</h3>
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
            <div className="flex flex-col gap-4 pt-6 text-sm text-gray-500 sm:flex-row sm:justify-between">
              {component.copyRight && (
                <div>
                  {component.includeYear
                    ? `© ${new Date().getFullYear()} ${component.copyRight}`
                    : component.copyRight}
                </div>
              )}
              
              {Boolean(component.links?.length) && (
                <div className="flex flex-wrap gap-4">
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
    </>
  )
}

export default StrapiFooter
