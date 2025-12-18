import { Locale } from "next-intl"

export interface APIResponseCollectionPagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

export interface APIResponseCollectionMetadata {
  pagination: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}

export interface APIResponse<T> {
  data: T | null
  meta: object
}

export interface APIResponseCollection<T> {
  data: T[]
  meta: APIResponseCollectionMetadata
}

type StrapiImageMediaFormat = {
  ext?: string
  url?: string
  hash?: string
  mime?: string
  name?: string
  path?: string
  size?: number
  width?: number
  height?: number
}

export type StrapiImageMedia = {
  documentId: string
  id: number
  name?: string
  alternativeText?: string
  caption?: string
  width?: number
  height?: number
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  formats: {
    large: StrapiImageMediaFormat
    small: StrapiImageMediaFormat
    medium: StrapiImageMediaFormat
    thumbnail: StrapiImageMediaFormat
  }
  hash?: string
  ext?: string
  mime?: string
  size?: number
  url?: string
  previewUrl?: string
  provider?: string
  provider_metadata?: string
}

export interface APIResponseWithBreadcrumbs<T> {
  data: T | null
  meta: APIResponseCollectionMetadata & { breadcrumbs?: BreadCrumb[] }
}

export type AppLocalizedParams<T> = T & {
  // In fetch functions we can pass the Locale to get the correct data
  // Locale is meant to be frontend locale, that is mapped to the Strapi locale
  // before firing the request
  locale?: Locale
  middlewarePopulate?: string[]
}

export type BreadCrumb = {
  title: string
  fullPath: string
}

export type PageLocalization = {
  localizations: Array<{
    id: number
    documentId: string
    fullPath: string
    locale: string
  }>
} | null
