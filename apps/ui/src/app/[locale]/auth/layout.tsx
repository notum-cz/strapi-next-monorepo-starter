import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

export default async function AuthLayout({
  children,
  params,
}: LayoutProps<"/[locale]/auth">) {
  const { locale } = (await params) as { locale: Locale }

  setRequestLocale(locale)

  return (
    <section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
      {children}
    </section>
  )
}
