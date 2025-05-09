"use client"

import React, { useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider, signOut, useSession } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { z } from "zod"

import { setupLibraries } from "@/lib/general-helpers"
import { useTranslatedZod } from "@/hooks/useTranslatedZod"

// Setup libraries in client environment
setupLibraries()

const queryClient = new QueryClient()

export function ClientProviders({
  children,
}: {
  readonly children: React.ReactNode
}) {
  useTranslatedZod(z)

  return (
    <SessionProvider>
      <TokenProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          forcedTheme="light"
        >
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </ThemeProvider>
      </TokenProvider>
    </SessionProvider>
  )
}

function TokenProvider({ children }: { readonly children: React.ReactNode }) {
  const session = useSession()

  useEffect(() => {
    if (session.data?.error === "invalid_strapi_token") {
      signOut({ callbackUrl: "/auth/signin" })
    }
  }, [session])

  return <>{children}</>
}
