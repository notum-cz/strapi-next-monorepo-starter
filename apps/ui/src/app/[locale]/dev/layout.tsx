import { notFound } from "next/navigation"

import DevNavbar from "@/app/[locale]/dev/components/DevNavbar"
import { Container } from "@/components/elementary/Container"
import { isProduction } from "@/lib/general-helpers"

// Evaluate the production gate at request time; APP_ENV is injected at runtime,
// not baked at build time. Applies to the whole /[locale]/dev/* subtree.
export const dynamic = "force-dynamic"

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
