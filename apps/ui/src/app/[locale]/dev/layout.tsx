import type { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import DevNavbar from "@/app/[locale]/dev/components/DevNavbar"
import { Container } from "@/components/elementary/Container"

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/dev">) {
  const { locale } = (await params) as { locale: Locale }

  // Enable static rendering
  setRequestLocale(locale)

  return (
    <>
      <DevNavbar />
      <Container className="py-20">{children}</Container>
    </>
  )
}
