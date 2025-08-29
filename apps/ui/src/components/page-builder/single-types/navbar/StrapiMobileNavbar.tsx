"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Data } from "@repo/strapi"

import { AppLocale } from "@/types/general"

import AppLink from "@/components/elementary/AppLink"
import LocaleSwitcher from "@/components/elementary/LocaleSwitcher"
import StrapiImageWithLink from "@/components/page-builder/components/utilities/StrapiImageWithLink"

import StrapiSocialIcon from "@/components/page-builder/components/utilities/StrapiSocialIcon"

interface StrapiMobileNavbarProps {
  navbar: Data.ContentType<"api::navbar.navbar">
  links: NonNullable<Data.ContentType<"api::navbar.navbar">["links"]>
  locale: AppLocale
}

export function StrapiMobileNavbar({
  navbar,
  links,
  locale,
}: StrapiMobileNavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) {
      // Lock scroll and blur background content
      document.body.style.overflow = "hidden"
      const mainContent = document.querySelector("main")
      if (mainContent) {
        mainContent.style.filter = "blur(3px)"
        mainContent.style.transition = "filter 0.2s ease"
      }
    } else {
      // Restore scroll and remove blur
      document.body.style.overflow = ""
      const mainContent = document.querySelector("main")
      if (mainContent) {
        mainContent.style.filter = ""
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ""
      const mainContent = document.querySelector("main")
      if (mainContent) {
        mainContent.style.filter = ""
      }
    }
  }, [isOpen])

  return (
    <>
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          {navbar.logoImage ? (
            <StrapiImageWithLink
              component={navbar.logoImage}
              linkProps={{ className: "flex items-center" }}
              imageProps={{
                forcedSizes: { width: 80, height: 53 },
                hideWhenMissing: true,
              }}
            />
          ) : (
            <AppLink href="/" className="text-xl font-bold">
              <Image
                src="/images/logo.svg"
                alt="logo"
                height={40}
                width={40}
                priority
              />
            </AppLink>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="touch-manipulation rounded-lg p-3 transition-all duration-200 hover:bg-gray-100 active:bg-gray-200"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
        >
          {/* Menu Panel */}
          <div
            className="absolute top-0 right-0 left-0 bg-white shadow-xl"
            role="dialog"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
          >
            {/* Header */}
            <div className="relative z-10 flex h-16 items-center justify-between border-b border-gray-200 px-4">
              <div className="flex items-center">
                {navbar.logoImage ? (
                  <StrapiImageWithLink
                    component={navbar.logoImage}
                    linkProps={{ className: "flex items-center" }}
                    imageProps={{
                      forcedSizes: { width: 80, height: 53 },
                      hideWhenMissing: true,
                    }}
                  />
                ) : (
                  <AppLink href="/" className="text-xl font-bold">
                    <Image
                      src="/images/logo.svg"
                      alt="logo"
                      height={40}
                      width={40}
                      priority
                    />
                  </AppLink>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="touch-manipulation rounded-lg p-2 transition-colors duration-150 hover:bg-gray-100 active:bg-gray-200"
                aria-label="Close menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu Content */}
            <div className="animate-in slide-in-from-top duration-[315ms]">
              {links.length > 0 && (
                <div>
                  {links.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <div
                        key={link.href}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        <a
                          href={link.href || "#"}
                          onClick={() => setIsOpen(false)}
                          className={`block w-full px-6 py-4 text-left text-base transition-colors duration-200 ${
                            isActive
                              ? "border-l-4 border-l-[var(--color-brand-red)] bg-[var(--color-brand-red)]/10 font-semibold text-[var(--color-brand-red)]"
                              : "text-gray-800 hover:bg-gray-50 hover:text-[var(--color-brand-red)]"
                          }`}
                        >
                          {link.label}
                        </a>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="border-t border-gray-200 bg-gray-50/30 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {navbar.socialIcons?.map((socialIcon) => (
                      <div
                        key={socialIcon.id}
                        className="transition-transform duration-200 hover:scale-110"
                      >
                        <StrapiSocialIcon component={socialIcon} />
                      </div>
                    ))}
                  </div>
                  <LocaleSwitcher locale={locale} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
