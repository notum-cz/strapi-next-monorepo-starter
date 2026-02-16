import { headers } from "next/headers"
import Image from "next/image"
import type { Locale } from "next-intl"
import { use } from "react"

import AppLink from "@/components/elementary/AppLink"
import LocaleSwitcher from "@/components/elementary/LocaleSwitcher"
import StrapiImageWithLink from "@/components/page-builder/components/utilities/StrapiImageWithLink"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"
import { NavbarAuthSection } from "@/components/page-builder/single-types/navbar/NavbarAuthSection"
import { getSessionSSR } from "@/lib/auth"
import { fetchNavbar } from "@/lib/strapi-api/content/server"
import { cn } from "@/lib/styles"

export function StrapiNavbar({ locale }: { readonly locale: Locale }) {
  const response = use(fetchNavbar(locale))
  const navbar = response?.data

  if (navbar == null) {
    return null
  }

  const session = use(getSessionSSR(use(headers())))

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 shadow-sm backdrop-blur transition-colors duration-300">
      <div className="flex h-16 items-center space-x-6 px-6 sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          {navbar.logoImage ? (
            <StrapiImageWithLink
              component={navbar.logoImage}
              linkProps={{ className: "flex items-center space-x-2" }}
              imageProps={{
                forcedSizes: { width: 90, height: 60 },
                hideWhenMissing: true,
              }}
            />
          ) : (
            <AppLink href="/" className="text-xl font-bold">
              <Image src="/images/logo.svg" alt="logo" height={23} width={82} />
            </AppLink>
          )}

          {navbar.links && navbar.links.length > 0 ? (
            <nav className="flex">
              {navbar.links.map((link) => (
                <StrapiLink
                  component={link}
                  key={link.page?.fullPath ?? link.href ?? link.id}
                  className={cn(
                    "flex items-center text-sm font-medium hover:text-red-600"
                  )}
                />
              ))}
            </nav>
          ) : null}
        </div>

        <NavbarAuthSection sessionSSR={session} />
        <LocaleSwitcher locale={locale} />
      </div>
    </header>
  )
}

StrapiNavbar.displayName = "StrapiNavbar"

export default StrapiNavbar
