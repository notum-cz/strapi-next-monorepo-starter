import { Schema } from "@repo/strapi"

import { AppLocale } from "@/types/general"

import { getAuth } from "@/lib/auth"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import Strapi from "@/lib/strapi"
import { LoggedUserMenu } from "@/components/elementary/navbar/LoggedUserMenu"
import { NavbarItem } from "@/components/elementary/navbar/NavbarItem"

import { ImageWithLink } from "../components/ImageWithLink"

async function fetchData(locale: string) {
  try {
    return await Strapi.fetchOne(
      "api::navbar.navbar",
      undefined,
      {
        locale,
        populate: ["logoImage", "links"],
        pLevel: 5,
      },
      undefined,
      { omitAuthorization: true }
    )
  } catch (e: any) {
    console.error(
      `Data for "api::navbar.navbar" content type wasn't fetched: `,
      e?.message
    )
    return undefined
  }
}

export async function PageBuilderNavbar({
  locale,
  pageSpecificNavbar,
}: {
  readonly locale: AppLocale
  readonly pageSpecificNavbar?: Schema.Attribute.ComponentValue<
    "layout.navbar",
    false
  > | null
}) {
  removeThisWhenYouNeedMe("PageBuilderNavbar")

  const response = await fetchData(locale)
  const component = response?.data

  const navbar = pageSpecificNavbar ?? component

  if (navbar == null) {
    return null
  }

  const links = (navbar.links ?? []).filter((link) => link.href)

  const session = await getAuth()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-gray-400">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <ImageWithLink
            component={navbar.logoImage}
            linkProps={{ className: "flex items-center space-x-2" }}
            imageProps={{
              forcedSizes: { width: 90, height: 60 },
            }}
          />

          {links.length > 0 ? (
            <nav className="flex gap-6">
              {links.map((link, index) => (
                <NavbarItem
                  link={{
                    href: link.href!,
                    label: link.label ?? undefined,
                  }}
                  key={String(index) + index}
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
            <NavbarItem
              link={{
                translateKey: "navbar.actions.signIn",
                href: "/auth/signin",
              }}
            />
          )}
        </div>
      </div>
    </header>
  )
}
