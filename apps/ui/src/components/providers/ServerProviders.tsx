import React from "react"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"

import { AppLocale } from "@/types/general"

import { setupLibraries } from "@/lib/general-helpers"

// Setup libraries in server environment
setupLibraries()

interface Props {
  readonly children: React.ReactNode
  readonly locale: AppLocale
}

export async function ServerProviders({ children, locale }: Props) {
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
