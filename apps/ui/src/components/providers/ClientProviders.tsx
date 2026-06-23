"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import type React from "react"
import { z } from "zod"

import { useTranslatedZod } from "@/hooks/useTranslatedZod"
import { setupLibraries } from "@/lib/general-helpers"

// Setup libraries in client environment
// eslint-disable-next-line unicorn/no-top-level-side-effects
setupLibraries()

const queryClient = new QueryClient()

export function ClientProviders({
  children,
}: {
  readonly children: React.ReactNode
}) {
  useTranslatedZod(z)

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  )
}
