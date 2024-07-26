import type { Attribute, Common, Entity, Params } from "@repo/strapi"

interface APIIdProperty {
  id: number
}

export interface APIResponseData<TContentTypeUID extends Common.UID.ContentType>
  extends APIIdProperty {
  attributes: Attribute.GetValues<TContentTypeUID>
}

export interface APIResponseCollectionPagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

export interface APIResponseCollectionMetadata {
  pagination: APIResponseCollectionPagination
}

export interface APIResponse<TContentTypeUID extends Common.UID.ContentType> {
  data: APIResponseData<TContentTypeUID> | null
  meta: object
}

export interface APIResponseCollection<
  TContentTypeUID extends Common.UID.ContentType,
> {
  data: APIResponseData<TContentTypeUID>[]
  meta: APIResponseCollectionMetadata
}

export type APILocaleCode = string

type WithLocale<T> = T & { locale?: APILocaleCode }

export type APIUrlParams<TContentTypeUID extends Common.UID.ContentType> =
  WithLocale<
    Params.Pick<
      TContentTypeUID,
      | "fields"
      | "filters"
      | "sort"
      | "populate"
      | "publicationState"
      | "pagination"
    >
  >

export interface ApiLocale {
  id: Entity.ID
  createdAt: string
  updatedAt: string
  code: string
  isDefault: boolean
  name: string
}

export type UnwrappedAPIResponseData<
  T extends APIResponseData<Common.UID.ContentType>,
> = T["attributes"] & {
  id: T["id"]
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

export type StrapiDataWrapper<T> = {
  data: {
    id: Entity.ID
    attributes: T
  }
}
