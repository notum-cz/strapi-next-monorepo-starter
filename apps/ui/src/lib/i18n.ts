import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"

import { routing } from "./navigation"

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: (
      await (locale === "en"
        ? // When using Turbopack, this will enable HMR for `en`
          import("../../locales/en.json")
        : import(`../../locales/${locale}.json`))
    ).default,
    timeZone: "Europe/Prague",
  }
})
