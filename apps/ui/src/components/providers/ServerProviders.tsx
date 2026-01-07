import React from "react"
import { NextIntlClientProvider } from "next-intl"

import { setupLibraries } from "@/lib/general-helpers"

// Setup libraries in server environment
setupLibraries()

interface Props {
  readonly children: React.ReactNode
}

export async function ServerProviders({ children }: Props) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>
}
