"use client"

/**
 * Client-side API calls for games
 */

import qs from "qs"

import { fetchClientAPI } from "../fetch"

interface FetchGamesListClientOptions {
  page?: number
  pageSize?: number
  genreId?: number
  platformId?: number
  search?: string
}

export async function fetchGamesListClient(
  options: FetchGamesListClientOptions = {}
) {
  const {
    page = 1,
    pageSize = 12,
    genreId,
    platformId,
    search,
  } = options

  const filterObj: any = {}

  if (genreId) {
    filterObj.genres = {
      id: {
        $eq: genreId,
      },
    }
  }

  if (platformId) {
    filterObj.platforms = {
      id: {
        $eq: platformId,
      },
    }
  }

  if (search) {
    filterObj.$or = [
      {
        title: {
          $containsi: search,
        },
      },
      {
        description: {
          $containsi: search,
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

  return fetchClientAPI(`games?${query}`)
}
