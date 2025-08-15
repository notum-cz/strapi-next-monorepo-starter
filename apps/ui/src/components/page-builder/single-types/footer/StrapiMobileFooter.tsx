import { Data } from "@repo/strapi"
import { Container } from "@/components/elementary/Container"
import StrapiImageWithLink from "@/components/page-builder/components/utilities/StrapiImageWithLink"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"

interface StrapiMobileFooterProps {
  component: Data.ContentType<"api::footer.footer">
}

export function StrapiMobileFooter({ component }: StrapiMobileFooterProps) {
  return (
    <footer className="border-t bg-white/10 backdrop-blur md:hidden">
      <Container className="p-4">
        <div className="space-y-6">
          {/* Logo */}
          {component.logoImage && (
            <div className="text-center">
              <StrapiImageWithLink
                component={component.logoImage}
                imageProps={{ hideWhenMissing: true }}
              />
            </div>
          )}
          
          {/* Sections */}
          {Boolean(component.sections?.length) && (
            <div className="space-y-6">
              {component.sections.map((section) => (
                <div key={section.id} className="text-center">
                  <h3 className="mb-3 text-sm font-semibold">{section.title}</h3>
                  <div className="space-y-2">
                    {section.links?.map((link, i) => (
                      <StrapiLink
                        key={`${link.id}-${i}`}
                        component={link}
                        className="block text-sm text-gray-600"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Bottom Links */}
          {Boolean(component.links?.length) && (
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              {component.links.map((link, i) => (
                <StrapiLink
                  key={`${link.id}-${i}`}
                  component={link}
                  className="text-gray-500"
                />
              ))}
            </div>
          )}
          
          {/* Copyright */}
          {component.copyRight && (
            <div className="text-center text-xs text-gray-500">
              {component.includeYear
                ? `© ${new Date().getFullYear()} ${component.copyRight}`
                : component.copyRight}
            </div>
          )}
        </div>
      </Container>
    </footer>
  )
}

export default StrapiMobileFooter