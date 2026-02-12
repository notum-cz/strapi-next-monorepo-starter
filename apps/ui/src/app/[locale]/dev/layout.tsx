import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { Container } from "@/components/elementary/Container"
import DevNavbar from "@/app/[locale]/dev/components/DevNavbar"

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
