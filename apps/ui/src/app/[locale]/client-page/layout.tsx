import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/client-page">) {
  const { locale } = (await params) as { locale: Locale }

  // Enable static rendering
  setRequestLocale(locale)

  return <div className="flex items-center py-8">{children}</div>
}
