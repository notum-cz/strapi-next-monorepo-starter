import { setRequestLocale } from "next-intl/server"

import { LayoutProps } from "@/types/next"

export default async function AuthLayout({ children, params }: LayoutProps) {
  const { locale } = await params

  setRequestLocale(locale)

  return (
    <section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
      {children}
    </section>
  )
}
