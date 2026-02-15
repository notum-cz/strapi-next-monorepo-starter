"use client"

import type { Data } from "@repo/strapi-types"
import type { Locale } from "next-intl"
import { useState } from "react"

import { Container } from "@/components/elementary/Container"
import LocaleSwitcher from "@/components/elementary/LocaleSwitcher"
import { StrapiBasicImage } from "@/components/page-builder/components/utilities/StrapiBasicImage"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"
import { MobileMenuToggle } from "@/components/page-builder/single-types/navbar/MobileMenuToggle"
import { MobileNavigation } from "@/components/page-builder/single-types/navbar/MobileNavigation"
import { NavbarAuthSection } from "@/components/page-builder/single-types/navbar/NavbarAuthSection"
import type { BetterAuthSessionWithStrapi } from "@/types/better-auth"

import { DesktopNavigation } from "./DesktopNavigation"

export function NavbarInner({
  locale,
  navbarData,
  session,
}: {
  readonly locale: Locale
  readonly navbarData?: Data.ContentType<"api::navbar.navbar">
  readonly session?: BetterAuthSessionWithStrapi | null
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 h-16 w-full border-b bg-white/60 shadow-sm backdrop-blur-md transition-colors duration-300">
        <div className="flex h-16 items-center">
          <Container className="flex h-full items-center justify-between px-6">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-2">
              {/* Logo */}
              {navbarData?.logoImage?.image ? (
                <StrapiBasicImage
                  component={navbarData?.logoImage.image}
                  width={80}
                  height={30}
                  className="flex shrink-0 object-contain"
                />
              ) : null}

              {/* NAVBAR ITEMS */}

              {/* Desktop Navigation */}
              <DesktopNavigation navbarItems={navbarData?.navbarItems} />
            </div>

            {/* RIGHT SIDE */}
            <div className="hidden h-full items-center gap-2 lg:flex">
              <NavbarAuthSection sessionSSR={session} />
              <LocaleSwitcher locale={locale} />
              <div className="flex h-8 w-px flex-1 bg-black/70" />
              {/* Primary buttons */}
              {navbarData?.primaryButtons?.map((button) => (
                <StrapiLink key={button.id} component={button} />
              ))}
            </div>
            <MobileMenuToggle
              open={mobileOpen}
              onToggle={() => setMobileOpen((v) => !v)}
            />
          </Container>
        </div>
      </header>
      <MobileNavigation
        navbarItems={navbarData?.navbarItems}
        primaryButtons={navbarData?.primaryButtons}
        isOpen={mobileOpen}
        setOpen={setMobileOpen}
        session={session}
        locale={locale}
      />
    </>
  )
}
NavbarInner.displayName = "NavbarInner"

export default NavbarInner
