import type { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { Container } from "@/components/elementary/Container"
import PagesCatalog from "@/components/elementary/PagesCatalog"
import { cn } from "@/lib/styles"

export default async function ClientPage({
  params,
}: PageProps<"/[locale]/client-page">) {
  const { locale } = (await params) as { locale: Locale }

  setRequestLocale(locale)

  return (
    <main className={cn("flex w-full flex-col overflow-hidden")}>
      <Container>
        <PagesCatalog />
      </Container>
    </main>
  )
}
