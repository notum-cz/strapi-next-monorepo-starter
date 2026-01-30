/**
 * Game-related TypeScript types
 */

export interface GameImage {
  id: number
  url: string
  alternativeText?: string
  width?: number
  height?: number
  mime?: string
  size?: number
}

export interface Developer {
  id: number
  name: string
  description?: string
  website?: string
  logo?: GameImage
}

export interface Genre {
  id: number
  name: string
  slug: string
  description?: string
  icon?: GameImage
}

export interface Platform {
  id: number
  name: string
  slug: string
  description?: string
  icon?: GameImage
}

export interface GameSEO {
  id: number
  metaTitle?: string
  metaDescription?: string
  metaImage?: GameImage
  structuredData?: Record<string, any>
  preventIndexing?: boolean
}

export interface Game {
  id: number
  title: string
  slug: string
  description: string
  longDescription?: string
  cover?: GameImage
  screenshots?: GameImage[]
  trailer?: {
    id: number
    url: string
    provider?: "youtube" | "vimeo"
  }
  developer?: Developer
  genres?: Genre[]
  platforms?: Platform[]
  releaseDate?: string
  rating?: number
  website?: string
  price?: number
  discountPrice?: number
  inStock?: boolean
  downloadSize?: number
  tags?: string[]
  seo?: GameSEO
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale?: string
}

export interface GameListResponse {
  data: Game[]
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export interface GamesFilterOptions {
  genreId?: number
  platformId?: number
  search?: string
  page?: number
  pageSize?: number
}

export interface GamesListState {
  games: Game[]
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  error?: Error
}
