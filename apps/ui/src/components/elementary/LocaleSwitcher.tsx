"use client"

import React, { useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { ChevronDown, Globe } from "lucide-react"

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
      <SelectTrigger className="flex h-9 w-auto items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
        <Globe className="h-4 w-4 text-gray-500" />
        <span className="font-medium">{localeTranslation[locale]}</span>
        <ChevronDown className="h-3 w-3 text-gray-400 transition-transform duration-200" />
      </SelectTrigger>
      <SelectContent className="min-w-[140px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
        {routing.locales.map((locale, index) => (
          <React.Fragment key={locale}>
            <SelectItem
              key={locale}
              value={locale}
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 focus:outline-none"
            >
              <span className="mx-3 text-xs font-bold tracking-wide text-gray-400 uppercase">
                {locale}
              </span>
              <span>{localeTranslation[locale]}</span>
            </SelectItem>
            {index < routing.locales.length - 1 && (
              <SelectSeparator
                key={`${locale}-separator`}
                className="my-1 bg-gray-100"
              />
            )}
          </React.Fragment>
        ))}
      </SelectContent>
    </Select>
  )
}

export default LocaleSwitcher
