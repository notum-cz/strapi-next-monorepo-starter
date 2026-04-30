"use client"

import type { Data } from "@repo/strapi-types"
import { Menu, X } from "lucide-react"
import type { Locale } from "next-intl"

import { MobileNavigation } from "@/components/page-builder/single-types/navbar/MobileNavigation"
import { Button } from "@/components/ui/button"
import { useNavbarMobile } from "@/hooks/useNavbarMobile"
import { cn } from "@/lib/styles"
import type { BetterAuthSessionWithStrapi } from "@/types/better-auth"

export { NavbarMobileProvider } from "@/hooks/useNavbarMobile"

export function NavbarMobileToggle() {
  const [mobileOpen, setMobileOpen] = useNavbarMobile()

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("lg:hidden", mobileOpen && "hamburger-menu")}
      aria-label="Toggle menu"
      onClick={() => setMobileOpen((open) => !open)}
    >
      {mobileOpen ? <X /> : <Menu />}
    </Button>
  )
}

export function NavbarMobileNavigation({
  navbarItems,
  primaryButtons,
  session,
  locale,
}: {
  readonly primaryButtons?: Data.ContentType<"api::navbar.navbar">["primaryButtons"]
  readonly navbarItems?: Data.ContentType<"api::navbar.navbar">["navbarItems"]
  readonly session?: BetterAuthSessionWithStrapi | null
  readonly locale: Locale
}) {
  const [mobileOpen, setMobileOpen] = useNavbarMobile()

  return (
    <MobileNavigation
      navbarItems={navbarItems}
      primaryButtons={primaryButtons}
      isOpen={mobileOpen}
      setOpen={setMobileOpen}
      session={session}
      locale={locale}
    />
  )
}
