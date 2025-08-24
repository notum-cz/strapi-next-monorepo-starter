"use client"

import React, { useTransition } from "react"
import { useSearchParams } from "next/navigation"

import { AppLocale } from "@/types/general"

import { routing, usePathname, useRouter } from "@/lib/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select"

const localeTranslation = {
  cs: "Czech",
  en: "English",
}

const LocaleSwitcher = ({ locale }: { locale: AppLocale }) => {
  // prevent the locale switch from blocking the UI thread
  const [, startTransition] = useTransition()

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleLocaleChange = (locale: AppLocale) => {
    const queryParams = searchParams.toString()

    // next-intl router.replace does not persist query params
    startTransition(() => {
      router.replace(
        queryParams.length > 0 ? `${pathname}?${queryParams}` : pathname,
        { locale }
      )
    })
  }

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-18 cursor-pointer font-bold uppercase" aria-label="Select language">
        {locale}
      </SelectTrigger>
      <SelectContent className="border-gray-300 bg-white/90 shadow-lg backdrop-blur">
        {routing.locales.map((locale, index) => (
          <React.Fragment key={locale}>
            <SelectItem
              key={locale}
              value={locale}
              className="cursor-pointer transition-colors duration-150 hover:bg-[var(--color-brand-red)]/10 focus:bg-[var(--color-brand-red)]/10"
            >
              {localeTranslation[locale]}
            </SelectItem>
            {index < routing.locales.length - 1 && (
              <SelectSeparator
                key={`${locale}-separator`}
                className="bg-gray-300"
              />
            )}
          </React.Fragment>
        ))}
      </SelectContent>
    </Select>
  )
}

export default LocaleSwitcher
