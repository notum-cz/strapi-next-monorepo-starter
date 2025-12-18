import { use } from "react"
import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

export default function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/[[...rest]]">) {
  const { locale } = use(params) as { locale: Locale }

  setRequestLocale(locale)

  return <div className="flex items-center pb-8">{children}</div>
}
