import Image from "next/image"
import { Data } from "@repo/strapi"
import { getTranslations } from "next-intl/server"

import { AppLocale } from "@/types/general"

import { getAuth } from "@/lib/auth"
import { fetchNavbar } from "@/lib/strapi-api/content/server"
import { cn } from "@/lib/styles"
import AppLink from "@/components/elementary/AppLink"
import LocaleSwitcher from "@/components/elementary/LocaleSwitcher"
import StrapiImageWithLink from "@/components/page-builder/components/utilities/StrapiImageWithLink"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"
import { LoggedUserMenu } from "@/components/page-builder/single-types/navbar/LoggedUserMenu"

const hardcodedLinks: NonNullable<
  Data.ContentType<"api::navbar.navbar">["links"]
> = [{ id: "client-page", href: "/client-page", label: "Client Page" }]

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

          {links.length > 0 ? (
            <nav className="flex">
              {links.map((link) => (
                <StrapiLink
                  component={link}
                  key={link.href}
                  className={cn(
                    "flex items-center text-sm font-medium hover:text-red-600"
                  )}
                />
              ))}
            </nav>
          ) : null}
        </div>

        <div className="hidden flex-1 items-center justify-end space-x-4 lg:flex">
          {session?.user ? (
            <nav className="flex items-center space-x-1">
              <LoggedUserMenu user={session.user} />
            </nav>
          ) : (
            <AppLink href="/auth/signin">{t("actions.signIn")}</AppLink>
          )}
          <LocaleSwitcher locale={locale} />
        </div>
      </div>
    </header>
  )
}

StrapiNavbar.displayName = "StrapiNavbar"

export default StrapiNavbar
