import Image from "next/image"
import { Data } from "@repo/strapi"
import { getTranslations } from "next-intl/server"

import { AppLocale } from "@/types/general"

import { getAuth } from "@/lib/auth"
import { fetchNavbar } from "@/lib/strapi-api/content/server"
import { cn } from "@/lib/styles"
import AppLink from "@/components/elementary/AppLink"
import LocaleSwitcher from "@/components/elementary/LocaleSwitcher"
import { ScrollProgressBar } from "@/components/elementary/ScrollProgressBar"
import StrapiDesignerTitle from "@/components/page-builder/components/utilities/StrapiDesignerTitle"
import StrapiImageWithLink from "@/components/page-builder/components/utilities/StrapiImageWithLink"
import StrapiNavLink from "@/components/page-builder/components/utilities/StrapiNavLink"
import StrapiSocialIcon from "@/components/page-builder/components/utilities/StrapiSocialIcon"

import { StrapiMobileNavbar } from "./StrapiMobileNavbar"

// import { LoggedUserMenu } from "@/components/page-builder/single-types/navbar/LoggedUserMenu"

const hardcodedLinks: NonNullable<
  Data.ContentType<"api::navbar.navbar">["links"]
> = [
  //{ id: "client-page", href: "/client-page", label: "Client Page" }
]

export async function StrapiNavbar({ locale }: { readonly locale: AppLocale }) {
  const response = await fetchNavbar(locale)
  const navbar = response?.data

  if (navbar == null) {
    return null
  }

  const t = await getTranslations("navbar")

  const links = (navbar.links ?? [])
    .filter((link) => link.href)
    .concat(...hardcodedLinks)

  const session = await getAuth()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 shadow-sm backdrop-blur transition-colors duration-300">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="flex h-16 items-center justify-between px-8">
          <div className="flex items-center">
            {navbar.logoImage ? (
              <StrapiImageWithLink
                component={navbar.logoImage}
                linkProps={{ className: "flex items-center space-x-2" }}
                imageProps={{
                  forcedSizes: { width: 100, height: 66 },
                  hideWhenMissing: true,
                }}
              />
            ) : (
              <AppLink href="/" className="text-2xl font-bold">
                <Image
                  src="/images/logo.svg"
                  alt="logo"
                  height={50}
                  width={50}
                  priority
                />
              </AppLink>
            )}
            {navbar.designerTitle && (
              <div className="hidden lg:block">
                <StrapiDesignerTitle component={navbar.designerTitle} />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-6">
            {links.length > 0 && (
              <nav className="flex h-7 items-center">
                {links.map((link) => (
                  <StrapiNavLink component={link} key={link.href} />
                ))}
              </nav>
            )}
            <div className="flex items-center space-x-3">
              <div className="flex h-7 items-center space-x-3">
                {navbar.socialIcons?.map((socialIcon) => (
                  <StrapiSocialIcon
                    key={socialIcon.id}
                    component={socialIcon}
                  />
                ))}
              </div>
              <div className="flex h-7 items-center">
                <LocaleSwitcher locale={locale} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <StrapiMobileNavbar navbar={navbar} links={links} locale={locale} />
      </div>

      <ScrollProgressBar />
    </header>
  )
}

StrapiNavbar.displayName = "StrapiNavbar"

export default StrapiNavbar
