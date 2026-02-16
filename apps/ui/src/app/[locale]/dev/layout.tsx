import { notFound } from "next/navigation"

import DevNavbar from "@/app/[locale]/dev/components/DevNavbar"
import { Container } from "@/components/elementary/Container"
import { isProduction } from "@/lib/general-helpers"

export default async function Layout({
  children,
}: LayoutProps<"/[locale]/dev">) {
  if (isProduction()) {
    notFound()
  }

  return (
    <>
      <DevNavbar />
      <Container className="py-20">{children}</Container>
    </>
  )
}
