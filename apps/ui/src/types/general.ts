import { useTranslations } from "next-intl"

import { routing } from "@/lib/navigation"

import { IntlKeysPath } from "./helpers"

export type AppLocale = (typeof routing.locales)[number]

export interface AppError {
  message: string | number
  status: number
  name?: string
  details?: Record<string, any>
  translateKeyPrefixForErrors?: Parameters<typeof useTranslations>[0]
}

export interface AppLink {
  href: string
  target?: string
  label?: string
  translateKey?: IntlKeysPath
}
