/**
 * Games dynamic route with SSG (Static Site Generation)
 * and ISR (Incremental Static Regeneration)
 *
 * Route: /[locale]/games/[slug]
 *
 * SSG: All game pages are pre-built at build time based on available games in Strapi
 * ISR: When a game is updated in Strapi, the page is automatically regenerated
 * in the background without rebuilding the entire site
 */

import { use } from "react"
import { notFound } from "next/navigation"
import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { debugStaticParams } from "@/lib/build"
import { isDevelopment } from "@/lib/general-helpers"
import { getMetadataFromStrapi } from "@/lib/metadata"
import {
  fetchAllGamesSlugs,
  fetchGameBySlug,
  fetchRelatedGames,
} from "@/lib/strapi-api/games/server"
import { routing } from "@/lib/navigation"
import { cn } from "@/lib/styles"
import { Container } from "@/components/elementary/Container"
import { ErrorBoundary } from "@/components/elementary/ErrorBoundary"
import GamePageContent from "@/components/games/GamePageContent"
import StrapiStructuredData from "@/components/page-builder/components/seo-utilities/StrapiStructuredData"
import { SimpleBreadcrumbs } from "@/components/games/SimpleBreadcrumbs"

/**
 * ISR Configuration:
 * - revalidate: 3600 = 1 hour
 *   The cached page will be revalidated every hour.
 *   If someone visits after the 1-hour window, Next.js will regenerate it in the background.
 *
 * - dynamicParams: true
 *   Allows new game pages to be generated on demand if a new game is added to Strapi
 *   after the initial build. Without this, unknown slugs would return 404.
 */
export const revalidate = 3600 // 1 hour - ISR revalidation time
export const dynamicParams = true // Enable on-demand ISR for new games

/**
 * Static Params Generation for SSG
 * This function runs at build time and tells Next.js which game pages to pre-generate.
 * All games returned here will be statically generated as HTML during the build.
 */
export async function generateStaticParams({
  params: { locale },
}: {
  params: { locale: string }
}) {
  // In development, only generate for English to speed up builds
  if (isDevelopment()) {
    debugStaticParams([], "games/[slug]", { isDevelopment: true })
    return [
      {
        locale: "en",
        slug: "fallback",
      },
    ]
  }

  // Fetch all game slugs for each locale
  const params = []

  for (const currentLocale of routing.locales) {
    const games = await fetchAllGamesSlugs(currentLocale as Locale)
    const gameSlugs = games.map((game: any) => ({
      locale: currentLocale,
      slug: game.slug,
    }))
    params.push(...gameSlugs)
  }

  debugStaticParams(params, "games/[slug]")

  // Return at least one fallback param for export output
  return params.length > 0
    ? params
    : [
        {
          locale: "en",
          slug: "fallback",
        },
      ]
}

/**
 * Generate metadata for the game page
 * This runs at build time for SSG and on-demand for ISR
 */
export async function generateMetadata(
  props: PageProps<"/[locale]/games/[slug]">
) {
  const params = await props.params
  const { slug, locale } = params

  const game = await fetchGameBySlug(slug, locale as Locale)

  if (!game) {
    return {}
  }

  // Use game data or Strapi SEO settings if available
  const seoData = game.seo || {}

  return {
    title: seoData.metaTitle || game.title,
    description: seoData.metaDescription || game.description,
    openGraph: {
      title: seoData.metaTitle || game.title,
      description: seoData.metaDescription || game.description,
      images: game.cover
        ? [
            {
              url: game.cover.url,
              alt: game.cover.alternativeText || game.title,
            },
          ]
        : [],
    },
  }
}

/**
 * Game page component
 * This will be statically generated (SSG) at build time and revalidated (ISR) every hour
 */
export default async function GamePage(
  props: PageProps<"/[locale]/games/[slug]">
) {
  const params = await props.params
  const { slug, locale } = params

  setRequestLocale(locale as Locale)

  // Fetch game data - this will use the ISR cache when available
  const game = await fetchGameBySlug(slug, locale as Locale)

  if (!game) {
    notFound()
  }

  // Fetch related games
  const relatedGames = await fetchRelatedGames(game.id, locale as Locale)

  return (
    <>
      <StrapiStructuredData
        structuredData={game?.seo?.structuredData}
      />

      <main className={cn("flex w-full flex-col overflow-hidden")}>
        <Container>
          <SimpleBreadcrumbs
            className="mt-6 mb-8"
            items={[
              { label: "Home", href: "/" },
              { label: "Games", href: "/games" },
              { label: game.title, href: `/games/${game.slug}`, isCurrent: true },
            ]}
          />
        </Container>

        <ErrorBoundary>
          <GamePageContent
            game={game}
            relatedGames={relatedGames}
          />
        </ErrorBoundary>
      </main>
    </>
  )
}
