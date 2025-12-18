import "@/styles/globals.css"

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { fontRoboto } from "@/lib/fonts"
import { routing } from "@/lib/navigation"
import { cn } from "@/lib/styles"
import { ErrorBoundary } from "@/components/elementary/ErrorBoundary"
import StrapiPreviewListener from "@/components/elementary/StrapiPreviewListener"
import { TailwindIndicator } from "@/components/elementary/TailwindIndicator"
import StrapiFooter from "@/components/page-builder/single-types/footer/StrapiFooter"
import StrapiNavbar from "@/components/page-builder/single-types/navbar/StrapiNavbar"
import { ClientProviders } from "@/components/providers/ClientProviders"
import { ServerProviders } from "@/components/providers/ServerProviders"
import TrackingScripts from "@/components/providers/TrackingScripts"
import { Toaster } from "@/components/ui/toaster"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: {
    template: "%s / Notum Technologies",
    default: "",
  },
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = (await params) as { locale: Locale }

  // Enable static rendering
  // https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#static-rendering
  setRequestLocale(locale)

  if (!routing.locales.includes(locale)) {
    notFound()
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-gray-100 font-sans antialiased",
          fontRoboto.variable
        )}
      >
        <TrackingScripts />
        <ServerProviders>
          <StrapiPreviewListener />
          <ClientProviders>
            <div className="relative flex min-h-screen flex-col">
              <ErrorBoundary hideFallback>
                <StrapiNavbar locale={locale} />
              </ErrorBoundary>

              <div className="flex-1">
                <div>{children}</div>
              </div>

              <TailwindIndicator />

              <Toaster />

              <ErrorBoundary hideFallback>
                <StrapiFooter locale={locale} />
              </ErrorBoundary>
            </div>
          </ClientProviders>
        </ServerProviders>
      </body>
    </html>
  )
}
