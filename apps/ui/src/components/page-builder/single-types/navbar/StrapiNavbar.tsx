import { getTranslations } from "next-intl/server"

import { AppLocale } from "@/types/general"

import { getAuth } from "@/lib/auth"
import { PublicStrapiClient } from "@/lib/strapi-api"
import { cn } from "@/lib/styles"
import AppLink from "@/components/elementary/AppLink"
import LocaleSwitcher from "@/components/elementary/LocaleSwitcher"
import StrapiImageWithLink from "@/components/page-builder/components/utilities/StrapiImageWithLink"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"
import { LoggedUserMenu } from "@/components/page-builder/single-types/navbar/LoggedUserMenu"

async function fetchData(locale: AppLocale) {
  try {
    return await PublicStrapiClient.fetchOne("api::navbar.navbar", undefined, {
      locale,
      populate: {
        links: true,
        logoImage: { populate: { image: true, link: true } },
      },
    })
  } catch (e: any) {
    console.error(
      `Data for "api::navbar.navbar" content type wasn't fetched: `,
      e?.message
    )
    return undefined
  }
}

export async function StrapiNavbar({ locale }: { readonly locale: AppLocale }) {
  const response = await fetchData(locale)
  const navbar = response?.data

  if (navbar == null) {
    return null
  }

  const t = await getTranslations("navbar")

  const links = (navbar.links ?? []).filter((link) => link.href)

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
              Strapi+Next.js
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

        <div className="flex flex-1 items-center justify-end space-x-4">
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
