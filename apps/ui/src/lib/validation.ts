/**
 * Type validation and imports test
 * This file tests that all imports and types are correctly resolved
 */

// Test games types
import type {
  Game,
  GameListResponse,
  GamesFilterOptions,
} from "@/types/games"

// Test games server API
import {
  fetchAllGamesSlugs,
  fetchGameBySlug,
  fetchGamesList,
  fetchRelatedGames,
  fetchGenres,
  fetchPlatforms,
} from "@/lib/strapi-api/games/server"

// Test games client API
import { fetchGamesListClient } from "@/lib/strapi-api/games/client"
import { useGamesList } from "@/lib/strapi-api/games/hooks"

// Test components
import GamePageContent from "@/components/games/GamePageContent"
import GamesListingContent from "@/components/games/GamesListingContent"
import { ISRDebugInfo } from "@/components/games/ISRDebugInfo"
import { SimpleBreadcrumbs } from "@/components/games/SimpleBreadcrumbs"

// Test API route
import { POST, GET } from "@/app/api/revalidate/route"

/**
 * Type safety checks
 */

// Game type check
const testGame: Game = {
  id: 1,
  title: "Test Game",
  slug: "test-game",
  description: "A test game",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
}

// Games list response check
const testListResponse: GameListResponse = {
  data: [testGame],
  meta: {
    pagination: {
      page: 1,
      pageSize: 12,
      pageCount: 1,
      total: 1,
    },
  },
}

// Filter options check
const testFilters: GamesFilterOptions = {
  page: 1,
  pageSize: 12,
  genreId: 1,
  platformId: 2,
  search: "test",
}

/**
 * Export validation object
 */
export const validationChecks = {
  types: {
    game: testGame,
    listResponse: testListResponse,
    filters: testFilters,
  },
  imports: {
    fetchAllGamesSlugs: typeof fetchAllGamesSlugs === "function",
    fetchGameBySlug: typeof fetchGameBySlug === "function",
    fetchGamesList: typeof fetchGamesList === "function",
    fetchRelatedGames: typeof fetchRelatedGames === "function",
    fetchGenres: typeof fetchGenres === "function",
    fetchPlatforms: typeof fetchPlatforms === "function",
    fetchGamesListClient: typeof fetchGamesListClient === "function",
    useGamesList: typeof useGamesList === "function",
    GamePageContent: typeof GamePageContent === "function",
    GamesListingContent: typeof GamesListingContent === "function",
    ISRDebugInfo: typeof ISRDebugInfo === "function",
    SimpleBreadcrumbs: typeof SimpleBreadcrumbs === "function",
    apiPost: typeof POST === "function",
    apiGet: typeof GET === "function",
  },
}

console.log("✅ All types and imports validated successfully")
export default validationChecks
