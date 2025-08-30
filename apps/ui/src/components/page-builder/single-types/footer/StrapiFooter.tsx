import { AppLocale } from "@/types/general"

import { fetchFooter } from "@/lib/strapi-api/content/server"
import { Container } from "@/components/elementary/Container"
import StrapiImageWithLink from "@/components/page-builder/components/utilities/StrapiImageWithLink"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"

export async function StrapiFooter({ locale }: { readonly locale: AppLocale }) {
  const response = await fetchFooter(locale)
  const component = response?.data

  if (!component) return null

  const getBackgroundClasses = () => {
    const bgType = (component.backgroundColor || "").split(" ")[0] || "light"
    switch (bgType) {
      case "dark":
        return "bg-gray-900 text-white border-gray-800"
      case "brand":
        return "bg-gradient-to-br from-red-50 to-red-100/50 text-gray-900 border-red-200/50"
      default:
        return "bg-white text-gray-900 border-gray-200"
    }
  }

  const getLinkClasses = (isBottomLink = false) => {
    const bgType = (component.backgroundColor || "").split(" ")[0] || "light"
    const baseClasses = "transition-colors duration-200"

    switch (bgType) {
      case "dark":
        return `${baseClasses} text-gray-300 hover:text-white ${isBottomLink ? "hover:text-gray-200" : ""}`
      case "brand":
        return `${baseClasses} text-gray-700 hover:text-red-600 ${isBottomLink ? "hover:text-red-500" : ""}`
      default:
        return `${baseClasses} text-gray-600 hover:text-gray-900 ${isBottomLink ? "hover:text-gray-700" : ""}`
    }
  }

  const getHeadingClasses = () => {
    const bgType = (component.backgroundColor || "").split(" ")[0] || "light"
    switch (bgType) {
      case "dark":
        return "text-white font-semibold"
      case "brand":
        return "text-gray-900 font-semibold"
      default:
        return "text-gray-900 font-semibold"
    }
  }

  const getCopyrightClasses = () => {
    const bgType = (component.backgroundColor || "").split(" ")[0] || "light"
    switch (bgType) {
      case "dark":
        return "text-gray-400"
      case "brand":
        return "text-gray-600"
      default:
        return "text-gray-500"
    }
  }

  return (
    <footer className={`border-t ${getBackgroundClasses()}`}>
      <Container className="px-4 py-12 md:px-6 lg:py-16">
        <div className="space-y-12">
          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
            {/* Brand Section */}
            <div className="space-y-6">
              {component.logoImage && (
                <div>
                  <StrapiImageWithLink
                    component={component.logoImage}
                    imageProps={{
                      hideWhenMissing: true,
                      forcedSizes: { width: 120, height: 40 },
                    }}
                  />
                </div>
              )}

              {component.description && (
                <p
                  className={`max-w-md text-sm leading-relaxed ${getCopyrightClasses()}`}
                >
                  {component.description}
                </p>
              )}

              {Boolean(component.socialIcons?.length) && (
                <div className="flex items-center gap-4">
                  {component.socialIcons.map((socialIcon) => (
                    <div
                      key={socialIcon.id}
                      className="transition-transform duration-200 hover:scale-110"
                    >
                      <StrapiImageWithLink
                        component={socialIcon}
                        imageProps={{
                          forcedSizes: { width: 24, height: 24 },
                          hideWhenMissing: true,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Sections */}
            {Boolean(component.sections?.length) && (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {component.sections.map((section) => (
                  <div key={section.id} className="space-y-4">
                    <h3 className={`text-sm ${getHeadingClasses()}`}>
                      {section.title}
                    </h3>
                    <nav className="space-y-3">
                      {section.links?.map((link, i) => (
                        <StrapiLink
                          key={`${link.id}-${i}`}
                          component={link}
                          className={`block text-sm ${getLinkClasses()}`}
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
                <div className={`text-sm ${getCopyrightClasses()}`}>
                  {component.includeYear
                    ? `© ${new Date().getFullYear()} ${component.copyRight}`
                    : component.copyRight}
                </div>
              )}
            </div>

            {Boolean(component.links?.length) && (
              <nav className="flex flex-wrap gap-6">
                {component.links.map((link, i) => (
                  <StrapiLink
                    key={`${link.id}-${i}`}
                    component={link}
                    className={`text-sm ${getLinkClasses(true)}`}
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
