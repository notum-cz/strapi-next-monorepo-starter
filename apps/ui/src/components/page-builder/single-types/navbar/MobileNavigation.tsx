"use client"

import type { Data } from "@repo/strapi-types"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { Locale } from "next-intl"
import { useState } from "react"

import LocaleSwitcher from "@/components/elementary/LocaleSwitcher"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"
import { NavbarAuthSection } from "@/components/page-builder/single-types/navbar/NavbarAuthSection"
import Typography from "@/components/typography"
import { cn } from "@/lib/styles"
import type { BetterAuthSessionWithStrapi } from "@/types/better-auth"

interface MobileNavigationProps {
  navbarItems?: Data.ContentType<"api::navbar.navbar">["navbarItems"]
  primaryButtons?: Data.ContentType<"api::navbar.navbar">["primaryButtons"]
  isOpen: boolean
  setOpen: (open: boolean) => void
  session?: BetterAuthSessionWithStrapi | null
  locale?: Locale
}

export function MobileNavigation({
  navbarItems,
  primaryButtons,
  isOpen,
  setOpen,
  session,
  locale,
}: MobileNavigationProps) {
  const [activeItem, setActiveItem] =
    useState<Data.Component<"layout.navbar-item"> | null>(null)

  if (!navbarItems?.length) return null

  return (
    <nav
      className={cn(
        "fixed inset-0 z-50 flex size-full flex-col bg-white",
        "transition-transform duration-300 lg:hidden",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="relative flex h-16 items-center border-b px-6">
        {/* Back */}
        {activeItem ? (
          <button
            onClick={() => setActiveItem(null)}
            className="flex items-center gap-1 text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <span />
        )}

        {/* Center label */}
        <Typography className="absolute left-1/2 -translate-x-1/2">
          {activeItem?.label}
        </Typography>

        {/* Close */}
        <button
          onClick={() => {
            setActiveItem(null)
            setOpen(false)
          }}
          className="ml-auto"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col divide-y overflow-y-auto">
        {!activeItem &&
          navbarItems.map((item) => {
            const hasChildren = !!item.categoryItems?.length

            return (
              <div key={item.id}>
                {item.isCategoryLink && item.link ? (
                  <StrapiLink
                    component={{ ...item.link }}
                    onClick={() => setOpen(false)}
                    className="flex min-h-17 w-full items-center justify-between px-6 py-5 text-lg"
                  >
                    {item.link.label}
                  </StrapiLink>
                ) : hasChildren ? (
                  <button
                    onClick={() => setActiveItem(item)}
                    className="flex w-full items-center justify-between px-6 py-5 text-lg"
                  >
                    {item.label}
                    <ChevronRight className="h-5 w-5" />
                  </button>
                ) : (
                  <Typography className="px-6 py-5 text-lg">
                    {item.label}
                  </Typography>
                )}
              </div>
            )
          })}

        {/* SUB MENU */}
        {activeItem &&
          activeItem.categoryItems?.map((subItem) => (
            <StrapiLink
              key={subItem.id}
              component={subItem}
              onClick={() => setOpen(false)}
              className="flex min-h-18 w-full items-center justify-between px-6 py-5 text-lg"
            />
          ))}
      </div>
      {/* FOOTER */}
      <div className="mt-auto space-y-4 border-t px-6 py-4">
        {/* Auth + Locale */}
        <div className="flex w-full items-center justify-between gap-2">
          <NavbarAuthSection sessionSSR={session} />
          {locale ? <LocaleSwitcher locale={locale} /> : null}
        </div>
        {primaryButtons?.length ? (
          <div className="space-y-2">
            {primaryButtons.map((button) => (
              <StrapiLink
                key={button.id}
                component={button}
                onClick={() => setOpen(false)}
                className="w-full"
              />
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  )
}
