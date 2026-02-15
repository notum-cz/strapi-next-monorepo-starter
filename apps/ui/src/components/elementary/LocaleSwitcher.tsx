"use client"

import React, { useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { Locale } from "next-intl"

import { routing, usePathname, useRouter } from "@/lib/navigation"
import { UseSearchParamsWrapper } from "@/components/helpers/UseSearchParamsWrapper"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const localeTranslation = {
  cs: "Czech",
  en: "English",
}

const LocaleSwitcher = ({ locale }: { locale: Locale }) => {
  return (
    <UseSearchParamsWrapper>
      <SuspensedLocaleSwitcher locale={locale} />
    </UseSearchParamsWrapper>
  )
}
const SuspensedLocaleSwitcher = ({ locale }: { locale: Locale }) => {
  // prevent the locale switch from blocking the UI thread
  const [, startTransition] = useTransition()

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleLocaleChange = (locale: Locale) => {
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
      <SelectTrigger className="w-18 font-bold uppercase">
        <SelectValue>{locale}</SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" className="bg-white">
        {routing.locales.map((locale, index) => (
          <React.Fragment key={locale}>
            <SelectItem key={locale} value={locale}>
              {localeTranslation[locale]}
            </SelectItem>
            {index < routing.locales.length - 1 && (
              <SelectSeparator key={`${locale}-separator`} />
            )}
          </React.Fragment>
        ))}
      </SelectContent>
    </Select>
  )
}

export default LocaleSwitcher
