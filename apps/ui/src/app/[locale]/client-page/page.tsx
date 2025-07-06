import { cn } from "@/lib/styles"
import { Container } from "@/components/elementary/Container"
import PagesCatalog from "@/components/elementary/PagesCatalog"

export default function ClientPage() {
  return (
    <main className={cn("flex w-full flex-col overflow-hidden")}>
      <Container>
        <PagesCatalog />
      </Container>
    </main>
  )
}
