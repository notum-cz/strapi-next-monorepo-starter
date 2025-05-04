import "@/styles/globals.css"

import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"

import { LayoutProps } from "@/types/next"

import { fontRoboto } from "@/lib/fonts"
import { routing } from "@/lib/navigation"
import { cn } from "@/lib/styles"
import { Navbar } from "@/components/elementary/navbar/Navbar"
import { TailwindIndicator } from "@/components/elementary/TailwindIndicator"
import { ClientProviders } from "@/components/providers/ClientProviders"
import { ServerProviders } from "@/components/providers/ServerProviders"
import TrackingScripts from "@/components/providers/TrackingScripts"
import { Toaster } from "@/components/ui/toaster"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale } = await params

  if (!routing.locales.includes(locale)) {
    notFound()
  }

  // Enable static rendering
  // https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#static-rendering
  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontRoboto.variable
        )}
      >
        <TrackingScripts />
        <ServerProviders params={params}>
          <ClientProviders>
            <div className="relative flex min-h-screen flex-col">
              <Navbar locale={locale} />
              <div className="flex-1">
                <div className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
                  {children}
                </div>
              </div>
            </div>
            <TailwindIndicator />
            <Toaster />
          </ClientProviders>
        </ServerProviders>
      </body>
    </html>
  )
}
