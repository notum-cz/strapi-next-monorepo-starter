import { setRequestLocale } from "next-intl/server"

import { LayoutProps } from "@/types/next"

export default function AuthLayout({ children, params }: LayoutProps) {
  setRequestLocale(params.locale)

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      {children}
    </section>
  )
}
