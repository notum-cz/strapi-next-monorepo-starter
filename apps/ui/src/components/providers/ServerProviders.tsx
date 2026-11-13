import { NextIntlClientProvider } from "next-intl"
import type React from "react"

import { setupLibraries } from "@/lib/general-helpers"

// Setup libraries in server environment
setupLibraries()

interface Props {
  readonly children: React.ReactNode
}

export async function ServerProviders({ children }: Props) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>
}
