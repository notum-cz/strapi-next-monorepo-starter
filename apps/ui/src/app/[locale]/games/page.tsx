/**
 * Games listing page
 * Route: /[locale]/games
 *
 * This page displays all games with filtering capabilities.
 * It uses ISR with a 1-hour revalidation time.
 */

import { use } from "react"
import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { fetchGamesList, fetchGenres, fetchPlatforms } from "@/lib/strapi-api/games/server"
import { routing } from "@/lib/navigation"
import { debugStaticParams } from "@/lib/build"
import { isDevelopment } from "@/lib/general-helpers"
import { Container } from "@/components/elementary/Container"
import { ErrorBoundary } from "@/components/elementary/ErrorBoundary"
import GamesListingContent from "@/components/games/GamesListingContent"
import { SimpleBreadcrumbs } from "@/components/games/SimpleBreadcrumbs"

export const revalidate = 3600 // 1 hour - ISR revalidation time

/**
 * Generate static params for locale-specific games pages
 */
export async function generateStaticParams() {
  const params = routing.locales.map((locale) => ({
    locale,
  }))

  debugStaticParams(params, "games (listing)")
  return params
}

/**
 * Game listing page component
 */
export default async function GamesPage(
  props: PageProps<"/[locale]/games">
) {
  const params = await props.params
  const { locale } = params

  setRequestLocale(locale as Locale)

  // Fetch data in parallel for better performance
  const [gamesData, genres, platforms] = await Promise.all([
    fetchGamesList(locale as Locale, 1, 12),
    fetchGenres(),
    fetchPlatforms(),
  ])

  return (
    <main className="flex w-full flex-col overflow-hidden">
      <Container>
        <SimpleBreadcrumbs
          className="mt-6 mb-8"
          items={[
            { label: "Home", href: "/" },
            { label: "Games", href: "/games", isCurrent: true },
          ]}
        />

        <h1 className="text-4xl font-bold mb-8">Games</h1>
      </Container>

      <ErrorBoundary>
        <GamesListingContent
          initialGames={gamesData.data}
          initialMeta={gamesData.meta}
          genres={genres}
          platforms={platforms}
        />
      </ErrorBoundary>
    </main>
  )
}
