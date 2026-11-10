import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"

import { isValidLocale } from "@/lib/navigation"

export default async function AuthLayout({
  children,
  params,
}: LayoutProps<"/[locale]/auth">) {
  const { locale } = await params
  if (!isValidLocale(locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return (
    <section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
      {children}
    </section>
  )
}
