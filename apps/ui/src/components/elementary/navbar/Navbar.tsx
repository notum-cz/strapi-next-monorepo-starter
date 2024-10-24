import Image from "next/image"

import { AppLink, AppLocale } from "@/types/general"

import { getAuth } from "@/lib/auth"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Link } from "@/lib/navigation"

import LocaleSwitcher from "../LocaleSwitcher"
import { LoggedUserMenu } from "./LoggedUserMenu"
import { NavbarItem } from "./NavbarItem"

const mainNavLinks: Array<AppLink> = [
  {
    href: "/profile",
    translateKey: "navbar.actions.profile",
  },
  {
    href: "/builder",
    label: "Page builder",
  },
  {
    href: "/docs",
    label: "Docs",
  },
]

export async function Navbar({ locale }: { locale: AppLocale }) {
  removeThisWhenYouNeedMe("Navbar")

  const session = await getAuth()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-gray-400">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="https://notum.cz/wp-content/uploads/2020/04/notum_white.svg"
              width={90}
              height={60}
              alt=""
            />
          </Link>

          <nav className="flex gap-6">
            {mainNavLinks.map((link) => (
              <NavbarItem link={link} key={link.href} />
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <LocaleSwitcher locale={locale} />
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
