import "@/styles/globals.css"

import { notFound } from "next/navigation"

import { LayoutProps } from "@/types/next"

import { fontRoboto } from "@/lib/fonts"
import { setupLibraries } from "@/lib/general-helpers"
import { locales } from "@/lib/i18n"
import { cn } from "@/lib/styles"
import { Navbar } from "@/components/elementary/navbar/Navbar"
import { TailwindIndicator } from "@/components/elementary/TailwindIndicator"
import { ClientProviders } from "@/components/providers/ClientProviders"
import { ServerProviders } from "@/components/providers/ServerProviders"
import { Toaster } from "@/components/ui/toaster"

setupLibraries()

export default async function RootLayout({ children, params }: LayoutProps) {
  if (!locales.includes(params.locale)) {
    notFound()
  }

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
