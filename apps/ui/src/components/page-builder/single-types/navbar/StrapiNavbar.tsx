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
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          {navbar.logoImage?.image?.media ? (
            <StrapiImageWithLink
              component={navbar.logoImage}
              linkProps={{ className: "flex items-center gap-2" }}
              imageProps={{
                forcedSizes: { height: 30, width: 100 },
                hideWhenMissing: false,
                style: {
                  objectFit: "contain",
                  objectPosition: "left",
                  maxWidth: 100,
                  width: "fit-content",
                  maxHeight: 30,
                },
              }}
            />
          ) : (
            <AppLink href="/" className="flex items-center gap-2">
              <Image src="/images/logo.svg" alt="logo" height={60} width={60} />
            </AppLink>
          )}

          {links.length > 0 && (
            <nav className="hidden items-center md:flex">
              {links.map((link) => (
                <StrapiLink
                  component={link}
                  key={link.href}
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  )}
                />
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <LoggedUserMenu user={session.user} />
          ) : (
            <div className="flex items-center gap-2">
              <AppLink
                href="/auth/signin"
                className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                {t("actions.signIn")}
              </AppLink>
            </div>
          )}
          <LocaleSwitcher locale={locale} />
        </div>
      </div>
    </header>
  )
}

StrapiNavbar.displayName = "StrapiNavbar"

export default StrapiNavbar
