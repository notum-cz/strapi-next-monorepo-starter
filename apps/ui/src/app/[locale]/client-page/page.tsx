import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { cn } from "@/lib/styles"
import { Container } from "@/components/elementary/Container"
import PagesCatalog from "@/components/elementary/PagesCatalog"

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
