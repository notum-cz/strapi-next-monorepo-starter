import "@/styles/globals.css"

import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"

import { LayoutProps } from "@/types/next"

import { fontRoboto } from "@/lib/fonts"
import { setupLibraries } from "@/lib/general-helpers"
import { routing } from "@/lib/navigation"
import { cn } from "@/lib/styles"
import { Navbar } from "@/components/elementary/navbar/Navbar"
import { TailwindIndicator } from "@/components/elementary/TailwindIndicator"
import { ClientProviders } from "@/components/providers/ClientProviders"
import { ServerProviders } from "@/components/providers/ServerProviders"
import { Toaster } from "@/components/ui/toaster"

setupLibraries()

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({ children, params }: LayoutProps) {
  if (!routing.locales.includes(params.locale)) {
    notFound()
  }

  // Enable static rendering
  // https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#static-rendering
  setRequestLocale(params.locale)

  return (
    <html lang={params.locale} suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontRoboto.variable
        )}
      >
        <ServerProviders params={params}>
          <ClientProviders>
            <div className="relative flex min-h-screen flex-col">
              <Navbar locale={params.locale} />
              <div className="flex-1">
                <div className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
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
