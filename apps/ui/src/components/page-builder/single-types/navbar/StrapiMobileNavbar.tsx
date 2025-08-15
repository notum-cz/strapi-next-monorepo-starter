"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Data } from "@repo/strapi"

import { AppLocale } from "@/types/general"

import AppLink from "@/components/elementary/AppLink"
import LocaleSwitcher from "@/components/elementary/LocaleSwitcher"
import StrapiImageWithLink from "@/components/page-builder/components/utilities/StrapiImageWithLink"
import StrapiNavLink from "@/components/page-builder/components/utilities/StrapiNavLink"
import StrapiSocialIcon from "@/components/page-builder/components/utilities/StrapiSocialIcon"

interface StrapiMobileNavbarProps {
  navbar: Data.ContentType<"api::navbar.navbar">
  links: NonNullable<Data.ContentType<"api::navbar.navbar">["links"]>
  locale: AppLocale
}

export function StrapiMobileNavbar({ navbar, links, locale }: StrapiMobileNavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Lock scroll and blur background content
      document.body.style.overflow = 'hidden'
      const mainContent = document.querySelector('main')
      if (mainContent) {
        mainContent.style.filter = 'blur(3px)'
        mainContent.style.transition = 'filter 0.2s ease'
      }
    } else {
      // Restore scroll and remove blur
      document.body.style.overflow = ''
      const mainContent = document.querySelector('main')
      if (mainContent) {
        mainContent.style.filter = ''
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ''
      const mainContent = document.querySelector('main')
      if (mainContent) {
        mainContent.style.filter = ''
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
              <Image src="/images/logo.svg" alt="logo" height={40} width={40} />
            </AppLink>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-0 left-0 right-0 bg-white shadow-xl">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b">
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
                    <Image src="/images/logo.svg" alt="logo" height={40} width={40} />
                  </AppLink>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Menu Content */}
            <div className="px-4 py-6 space-y-6">
              {links.length > 0 && (
                <nav className="space-y-3">
                  {links.map((link) => (
                    <div key={link.href} onClick={() => setIsOpen(false)}>
                      <StrapiNavLink component={link} />
                    </div>
                  ))}
                </nav>
              )}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-3">
                  {navbar.socialIcons?.map((socialIcon) => (
                    <StrapiSocialIcon key={socialIcon.id} component={socialIcon} />
                  ))}
                </div>
                <LocaleSwitcher locale={locale} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}