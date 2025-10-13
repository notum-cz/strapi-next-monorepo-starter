import { AppSession } from "@/types/next-auth"

import { routing } from "@/lib/navigation"

import { IntlKeysPath } from "./helpers"

// Use type safe message keys with `next-intl`
type Messages = typeof import("../../locales/en.json")

// eslint-disable-next-line no-unused-vars
export interface IntlMessages extends Messages {}

export type AppLocale = (typeof routing.locales)[number]

export interface CustomFetchOptions {
  // do not add locale query params to the request
  doNotAddLocaleQueryParams?: boolean
  // force JWT token for the request
  // if omitted, the token will be retrieved from the session
  // used by PrivateStrapiClient
  userJWT?: AppSession["strapiJWT"]
  // omit "Authorization" header from the request (don't retrieve JWT token from session)
  // used by PrivateStrapiClient
  omitUserAuthorization?: boolean
  // use proxy for the request (useful for client-side requests)
  useProxy?: boolean
}

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
