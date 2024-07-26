import React from "react"
import { Params } from "next/dist/shared/lib/router/utils/route-matcher"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"

interface Props {
  readonly children: React.ReactNode
  readonly params: Params
}

export async function ServerProviders({ children, params: { locale } }: Props) {
  let messages
  try {
    messages = (await import(`../../../locales/${locale}.json`)).default
  } catch (error) {
    notFound()
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
