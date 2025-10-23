import { setRequestLocale } from "next-intl/server"

import { AppLocale } from "@/types/general"

export default async function AuthLayout({
  children,
  params,
}: LayoutProps<"/[locale]/auth">) {
  const { locale } = await params

  setRequestLocale(locale as AppLocale)

  return (
    <section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
      {children}
    </section>
  )
}
