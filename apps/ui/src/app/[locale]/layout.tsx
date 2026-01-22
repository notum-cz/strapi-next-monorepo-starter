import "@/styles/globals.css"

import { Metadata } from "next"
import { notFound } from "next/navigation"
import Script from "next/script"
import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { debugStaticParams } from "@/lib/build"
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
  const locales = routing.locales.map((locale) => ({ locale }))
  debugStaticParams(locales, "[locale]")
  return locales
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

  /**
   * This allows you to make all env variables RUNTIME.
   *
   * No env variables are going to be embedded during the build-time. To avoid embedding,
   * you must not use "NEXT_PUBLIC_" prefix for any env variable that you want to keep
   * private and dynamic at runtime.
   *
   * Instead, use this method to pass only the required env variables to the client side.
   * To access them from CSR or SSR context, read them from `window.CSR_CONFIG`
   * (or `globalThis.CSR_CONFIG` in shared/SSR code) instead of using `process.env` directly.
   *
   * Do not include "STRAPI_URL", we want to keep it private (hence why we use proxying).
   */
  const CSR_ENVs = [
    "NODE_ENV",
    "SENTRY_DSN",
    "DEBUG_STRAPI_CLIENT_API_CALLS",
    "SHOW_NON_BLOCKING_ERRORS",
    "APP_PUBLIC_URL",
  ]

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Script id="csr-config" strategy="beforeInteractive">
          {`
         window.CSR_CONFIG = window.CSR_CONFIG || {};
         window.CSR_CONFIG = ${JSON.stringify({
           ...CSR_ENVs.reduce(
             (acc, curr) => {
               acc[curr] = process.env?.[curr]
               return acc
             },
             {} as Record<string, string | undefined>
           ),
         })};
       `}
        </Script>
      </head>
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
