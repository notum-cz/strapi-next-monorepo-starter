import { AppLocale } from '@/types/general';
import React from "react"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"

interface Props {
  readonly children: React.ReactNode
  readonly params: Promise<{ locale: AppLocale }>
}

export async function ServerProviders({ children, params }: Props) {
  const { locale } = await params

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
