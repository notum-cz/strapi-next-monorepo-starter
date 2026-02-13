import type { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { use } from "react"

export default function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/dynamic/[[...rest]]">) {
  const { locale } = use(params) as { locale: Locale }

  setRequestLocale(locale)

  return <div className="flex items-center pb-8">{children}</div>
}
