import { use } from "react"
import { headers } from "next/headers"
import { Locale } from "next-intl"

import { getSessionSSR } from "@/lib/auth"
import { fetchNavbar } from "@/lib/strapi-api/content/server"
import NavbarInner from "@/components/page-builder/single-types/navbar/NavbarInner"

export function StrapiNavbar({ locale }: { readonly locale: Locale }) {
  const response = use(fetchNavbar(locale))
  const navbar = response?.data

  if (navbar == null) {
    return null
  }

  console.log("Navbar data:", navbar)

  const session = use(getSessionSSR(use(headers())))

  return <NavbarInner locale={locale} navbarData={navbar} session={session} />
}
StrapiNavbar.displayName = "StrapiNavbar"

export default StrapiNavbar
