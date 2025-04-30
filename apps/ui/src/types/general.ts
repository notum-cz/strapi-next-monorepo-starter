import { useTranslations } from "next-intl"

import { routing } from "@/lib/navigation"

import { IntlKeysPath } from "./helpers"

// Use type safe message keys with `next-intl`
type Messages = typeof import("../../locales/en.json")

// eslint-disable-next-line no-unused-vars
export interface IntlMessages extends Messages {}

export type AppLocale = (typeof routing.locales)[number]

export interface AppError {
  message: string | number
  status: number
  name?: string
  details?: Record<string, any>
}

export interface AppLink {
  href: string
  target?: string
  label?: string
  translateKey?: IntlKeysPath
}

export type NextMetadataTwitterCard =
  | "summary"
  | "summary_large_image"
  | "player"
  | "app"
