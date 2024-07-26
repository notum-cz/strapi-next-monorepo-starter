import { notFound } from "next/navigation"
import { getRequestConfig } from "next-intl/server"

export const locales = ["cs", "en"] as const
export const defaultLocale = "en"

export default getRequestConfig(async ({ locale }: { locale: string }) => {
  if (!locales.includes(locale as any)) {
    notFound()
  }

  return {
    messages: (
      await (locale === "en"
        ? // When using Turbopack, this will enable HMR for `en`
          import("../../locales/en.json")
        : import(`../../locales/${locale}.json`))
    ).default,
    timeZone: "Europe/Prague",
  }
})
