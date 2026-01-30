/**
 * Client-side hooks for games
 */

import { useQuery } from "@tanstack/react-query"

import { fetchGamesListClient } from "./client"

interface UseGamesListOptions {
  page?: number
  pageSize?: number
  genreId?: number
  platformId?: number
  search?: string
}

export function useGamesList(options: UseGamesListOptions = {}) {
  const {
    page = 1,
    pageSize = 12,
    genreId,
    platformId,
    search,
  } = options

  return useQuery({
    queryKey: ["games-list", { page, pageSize, genreId, platformId, search }],
    queryFn: () =>
      fetchGamesListClient({
        page,
        pageSize,
        genreId,
        platformId,
        search,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
