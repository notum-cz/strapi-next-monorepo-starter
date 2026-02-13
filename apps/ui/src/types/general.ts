import type { Metadata } from "next"

// Use type safe message keys with `next-intl`
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type Messages = typeof import("../../locales/en.json")

export interface IntlMessages extends Messages {}

export interface CustomFetchOptions {
  // do not add locale query params to the request
  doNotAddLocaleQueryParams?: boolean
  // force JWT token for the request
  // if omitted, the token will be retrieved from the session
  // used by PrivateStrapiClient
  userJWT?: string
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
  details?: Record<string, unknown>
}

export type NextMetadataTwitterCard =
  | "summary"
  | "summary_large_image"
  | "player"
  | "app"

export type SocialMetadata = {
  twitter: Metadata["twitter"]
  openGraph: Metadata["openGraph"]
}
