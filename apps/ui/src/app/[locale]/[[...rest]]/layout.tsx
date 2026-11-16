import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { use } from "react"

import { isValidLocale } from "@/lib/navigation"

export default function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/[[...rest]]">) {
  const { locale } = use(params)
  if (!isValidLocale(locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return <div className="flex items-center pb-8">{children}</div>
}
