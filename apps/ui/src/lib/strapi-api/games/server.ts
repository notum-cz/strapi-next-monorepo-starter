/**
 * Server-side Strapi API calls for Games
 * Used for SSG and ISR generation
 */

import { Locale } from "next-intl"
import qs from "qs"

import { fetchAPI } from "../fetch"

/**
 * Fetch all games slugs for SSG generation
 * This is used in generateStaticParams to know which game pages to generate
 */
export async function fetchAllGamesSlugs(locale: Locale) {
  try {
    const query = qs.stringify({
      locale,
      fields: ["slug"],
      pagination: {
        pageSize: 1000,
      },
    })

    const response = await fetchAPI(`games?${query}`)
    return response?.data ?? []
  } catch (error) {
    console.error("[fetchAllGamesSlugs] Error:", error)
    return []
  }
}

/**
 * Fetch a single game by slug
 * This includes all related data: developer, genres, platforms, media, etc.
 */
export async function fetchGameBySlug(slug: string, locale: Locale) {
  try {
    const query = qs.stringify({
      filters: {
        slug: {
          $eq: slug,
        },
        locale: {
          $eq: locale,
        },
      },
      populate: {
        developer: {
          populate: "*",
        },
        genres: {
          populate: "*",
        },
        platforms: {
          populate: "*",
        },
        cover: {
          fields: ["url", "alternativeText", "width", "height"],
        },
        screenshots: {
          fields: ["url", "alternativeText", "width", "height"],
        },
        trailer: {
          fields: ["url", "provider"],
        },
        seo: {
          populate: "*",
        },
      },
    })

    const response = await fetchAPI(`games?${query}`)
    return response?.data?.[0] ?? null
  } catch (error) {
    console.error("[fetchGameBySlug] Error for slug:", slug, error)
    return null
  }
}

/**
 * Fetch paginated list of games
 * Used for the games listing page
 */
export async function fetchGamesList(
  locale: Locale,
  page: number = 1,
  pageSize: number = 12,
  filters?: {
    genreId?: number
    platformId?: number
    search?: string
  }
) {
  try {
    const filterObj: any = {
      locale: {
        $eq: locale,
      },
    }

    if (filters?.genreId) {
      filterObj.genres = {
        id: {
          $eq: filters.genreId,
        },
      }
    }

    if (filters?.platformId) {
      filterObj.platforms = {
        id: {
          $eq: filters.platformId,
        },
      }
    }

    if (filters?.search) {
      filterObj.$or = [
        {
          title: {
            $containsi: filters.search,
          },
        },
        {
          description: {
            $containsi: filters.search,
          },
        },
      ]
    }

    const query = qs.stringify({
      filters: filterObj,
      populate: {
        cover: {
          fields: ["url", "alternativeText", "width", "height"],
        },
        developer: {
          fields: ["name"],
        },
        genres: {
          fields: ["name"],
        },
      },
      pagination: {
        page,
        pageSize,
      },
      sort: ["createdAt:desc"],
    })

    const response = await fetchAPI(`games?${query}`)
    return {
      data: response?.data ?? [],
      meta: response?.meta ?? {},
    }
  } catch (error) {
    console.error("[fetchGamesList] Error:", error)
    return {
      data: [],
      meta: {},
    }
  }
}

/**
 * Fetch related games (same genre or developer)
 */
export async function fetchRelatedGames(
  currentGameId: number,
  locale: Locale,
  limit: number = 4
) {
  try {
    const query = qs.stringify({
      filters: {
        id: {
          $ne: currentGameId,
        },
        locale: {
          $eq: locale,
        },
      },
      populate: {
        cover: {
          fields: ["url", "alternativeText", "width", "height"],
        },
        developer: {
          fields: ["name"],
        },
      },
      pagination: {
        limit,
      },
      sort: ["createdAt:desc"],
    })

    const response = await fetchAPI(`games?${query}`)
    return response?.data ?? []
  } catch (error) {
    console.error("[fetchRelatedGames] Error:", error)
    return []
  }
}

/**
 * Get all available genres for filtering
 */
export async function fetchGenres() {
  try {
    const query = qs.stringify({
      pagination: {
        pageSize: 100,
      },
      sort: ["name:asc"],
    })

    const response = await fetchAPI(`genres?${query}`)
    return response?.data ?? []
  } catch (error) {
    console.error("[fetchGenres] Error:", error)
    return []
  }
}

/**
 * Get all available platforms for filtering
 */
export async function fetchPlatforms() {
  try {
    const query = qs.stringify({
      pagination: {
        pageSize: 100,
      },
      sort: ["name:asc"],
    })

    const response = await fetchAPI(`platforms?${query}`)
    return response?.data ?? []
  } catch (error) {
    console.error("[fetchPlatforms] Error:", error)
    return []
  }
}
