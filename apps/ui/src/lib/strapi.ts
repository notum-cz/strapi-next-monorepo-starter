import { env } from "@/env.mjs"
import { getSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import qs from "qs"

import type { FindFirst, FindMany, ID, Result, UID } from "@repo/strapi"
import { APIResponse, APIResponseCollection } from "@/types/api"
import { AppError } from "@/types/general"
import { AppSession } from "@/types/next-auth"

import { getAuth } from "./auth"
import { isDevelopment } from "./general-helpers"

type CustomFetchOptions = {
  // force JWT token for the request
  // if omitted, the token will be retrieved from the session
  strapiJWT?: AppSession["strapiJWT"]
  // omit "Authorization" header from the request
  omitAuthorization?: boolean
  // map error messages to translation keys
  translateKeyPrefixForErrors?: Parameters<typeof useTranslations>[0]
}

/**
 * IMPORTANT:
 * Add endpoints here that are queried from the frontend.
 * Mapping of Strapi content type UIDs to API endpoint paths.
 */
// eslint-disable-next-line no-unused-vars
export const API_ENDPOINTS: { [key in UID.ContentType]?: string } = {
  "api::configuration.configuration": "/configuration",
  "plugin::users-permissions.user": "/users",
  "api::page.page": "/pages",
  "api::footer.footer": "/footer",
  "api::navbar.navbar": "/navbar",
  // Add UID<->endpoint mapping for ContentTypes here
} as const

export default class Strapi {
  public static async fetchAPI(
    path: string,
    params = {},
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ) {
    const { url, headers } = await this.prepareRequest(
      path,
      params,
      options?.strapiJWT,
      options?.omitAuthorization
    )
    const response = await fetch(url, {
      // turn off caching in development
      // if revalidate is set to a number since 0 implies cache: 'no-store' and a positive value implies cache: 'force-cache'.
      next: { revalidate: isDevelopment() ? 0 : env.NEXT_PUBLIC_REVALIDATE },
      ...requestInit,
      headers: { ...requestInit?.headers, ...headers },
    })
    const data = await response.json()

    if (!response.ok) {
      const { error } = data
      const appError: AppError = {
        message: error?.message,
        name: error?.name,
        details: error?.details,
        status: response.status ?? error?.status,
        translateKeyPrefixForErrors: options?.translateKeyPrefixForErrors,
      }
      throw new Error(JSON.stringify(appError))
    }

    return data
  }

  /**
   * Fetches one document by ID or Single type (without ID)
   */
  public static async fetchOne<
    TContentTypeUID extends UID.ContentType,
    TParams extends FindFirst<TContentTypeUID>,
  >(
    uid: TContentTypeUID,
    documentId?: ID | undefined,
    params?: TParams,
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ): Promise<APIResponse<Result<TContentTypeUID, TParams>>> {
    const path = this.getStrapiApiPathByUId(uid)
    const url = `${path}${documentId ? "/" + documentId : ""}`
    return this.fetchAPI(url, params, requestInit, options)
  }

  /**
   * Fetches multiple documents
   */
  public static async fetchMany<
    TContentTypeUID extends UID.ContentType,
    TParams extends FindMany<TContentTypeUID>,
  >(
    uid: TContentTypeUID,
    params?: TParams,
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ): Promise<APIResponseCollection<Result<TContentTypeUID, TParams>>> {
    const path = this.getStrapiApiPathByUId(uid)
    return this.fetchAPI(path, params, requestInit, options)
  }

  /**
   * Fetches all documents
   */
  public static async fetchAll<
    TContentTypeUID extends UID.ContentType,
    TParams extends FindMany<TContentTypeUID>,
  >(
    uid: TContentTypeUID,
    params?: TParams,
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ): Promise<APIResponseCollection<Result<TContentTypeUID, TParams>>> {
    const path = this.getStrapiApiPathByUId(uid)

    const firstPage: APIResponseCollection<Result<TContentTypeUID, TParams>> =
      await this.fetchAPI(path, { ...params }, requestInit, options)

    if (firstPage.meta.pagination.pageCount === 1) {
      return firstPage
    }

    const otherPages = Array.from(
      { length: firstPage.meta.pagination.pageCount - 1 },
      (_, i) =>
        this.fetchAPI(
          path,
          {
            ...params,
            pagination: { page: i + 2 },
          },
          requestInit,
          options
        )
    )

    return Promise.all(otherPages).then((res) => ({
      data: [firstPage.data, ...res.map((page) => page.data)].flat(),
      meta: {
        pagination: {
          page: 1,
          pageCount: 1,
          pageSize: firstPage.meta.pagination.total,
          total: firstPage.meta.pagination.total,
        },
      },
    }))
  }

  /**
   * Fetches a single entity by slug
   */
  public static async fetchOneBySlug<
    TContentTypeUID extends UID.ContentType,
    TParams extends FindMany<TContentTypeUID>,
  >(
    uid: TContentTypeUID,
    slug: string | null,
    params?: TParams,
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ): Promise<APIResponse<Result<TContentTypeUID, TParams>>> {
    const slugFilter = slug && slug.length > 0 ? { $eq: slug } : { $null: true }
    const mergedParams = {
      ...params,
      sort: { publishedAt: "desc" },
      filters: { ...params?.filters, slug: slugFilter },
    }
    const path = this.getStrapiApiPathByUId(uid)
    const response: APIResponseCollection<Result<TContentTypeUID, TParams>> =
      await this.fetchAPI(path, mergedParams, requestInit, options)

    // return last published entry
    return {
      data: response.data.pop() ?? null,
      meta: {},
    }
  }

  public static async prepareRequest(
    path: string,
    params: Object,
    jwt?: string,
    omitAuthorization?: boolean
  ) {
    let url = `/api${path.startsWith("/") ? path : `/${path}`}`

    const queryString =
      typeof params === "object" ? qs.stringify(params) : params
    if (queryString != null && queryString?.length > 0) {
      url += `?${queryString}`
    }

    let strapiToken = omitAuthorization ? undefined : jwt

    if (!omitAuthorization && !strapiToken) {
      // try to get token from session and use it for the request

      const isRSC = typeof window === "undefined"
      if (isRSC) {
        // server side
        const session = await getAuth()
        strapiToken = session?.strapiJWT
      } else {
        // client side - this makes HTTP request to /api/auth/session to get the session
        // this is not the best solution, but useSession() can't be used here
        const session = await getSession()
        strapiToken = session?.strapiJWT
      }
    }

    const strapiAPIUrl = `${env.NEXT_PUBLIC_STRAPI_URL}/api`

    return {
      url: new URL(url, strapiAPIUrl),
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
        ...(strapiToken ? { Authorization: `Bearer ${strapiToken}` } : {}),
      },
    }
  }

  /**
   * Get Path of the API route by UID
   * @param uid - UID of the Endpoint
   * @returns API Endpoint path
   */
  private static getStrapiApiPathByUId(
    uid: keyof typeof API_ENDPOINTS
  ): string {
    const path = API_ENDPOINTS[uid]
    if (path) {
      return path
    }
    throw new Error(
      `Endpoint for UID "${uid}" not found. Extend API_ENDPOINTS in lib/api/client.ts.`
    )
  }
}
