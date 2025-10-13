import React from "react"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"

import { AppLocale } from "@/types/general"

import { setupLibraries } from "@/lib/general-helpers"

// Setup libraries in server environment
setupLibraries()

interface Props {
  readonly children: React.ReactNode
  readonly params: Promise<{ locale: AppLocale }>
}

export async function ServerProviders({ children, params }: Props) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
