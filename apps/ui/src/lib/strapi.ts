import { env } from "@/env.mjs"
import { getSession } from "next-auth/react"
import qs from "qs"

import type {
  APIResponse,
  APIResponseCollection,
  APIResponseWithBreadcrumbs,
  AppLocalizedParams,
  PageLocalization,
} from "@/types/api"
import type { AppError } from "@/types/general"
import type { FindFirst, FindMany, ID, Result, UID } from "@repo/strapi"
import { AppSession } from "@/types/next-auth"

import { getAuth } from "@/lib/auth"

import { isDevelopment } from "./general-helpers"

type CustomFetchOptions = {
  // do not add locale query params to the request
  doNotAddLocaleQueryParams?: boolean
  // force JWT token for the request
  // if omitted, the token will be retrieved from the session
  strapiJWT?: AppSession["strapiJWT"]
  // omit "Authorization" header from the request
  omitAuthorization?: boolean
}

/**
 * IMPORTANT:
 * Add endpoints here that are queried from the frontend.
 * Mapping of Strapi content type UIDs to API endpoint paths.
 */
// eslint-disable-next-line no-unused-vars
export const API_ENDPOINTS: { [key in UID.ContentType]?: string } = {
  "api::page.page": "/pages",
  "api::footer.footer": "/footer",
  "api::navbar.navbar": "/navbar",
  // Add UID<->endpoint mapping for ContentTypes here
} as const

export default class Strapi {
  public static async fetchAPI(
    path: string,
    params: AppLocalizedParams<Record<string, any>> = {},
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ) {
    const { url, headers } = await Strapi.prepareRequest(
      path,
      {
        ...params,
        ...(options?.doNotAddLocaleQueryParams
          ? {}
          : { locale: params.locale }),
      },
      options?.strapiJWT,
      options?.omitAuthorization
    )

    const response = await fetch(url, {
      ...requestInit,
      next: {
        ...requestInit?.next,
        // if revalidate is set to a number since 0 implies cache: 'no-store' and a positive value implies cache: 'force-cache'.
        revalidate: isDevelopment() ? 0 : requestInit?.next?.revalidate ?? 60,
      },
      headers: {
        ...requestInit?.headers,
        ...headers,
      },
    })

    const { json, text } = await Strapi.parseResponse(response)

    if (text) {
      const appError: AppError = {
        name: "Invalid response content type",
        message: "Received text response rather than JSON.",
        details: { text },
        status: response.status,
      }
      throw new Error(JSON.stringify(appError))
    }

    if (!response.ok) {
      const { error } = json
      const appError: AppError = {
        message: error?.message,
        name: error?.name,
        details: error?.details,
        status: response.status ?? error?.status,
      }
      throw new Error(JSON.stringify(appError))
    }

    return json
  }

  /**
   * Fetches one document by ID or Single type (without ID)
   */
  public static async fetchOne<
    TContentTypeUID extends UID.ContentType,
    TParams extends AppLocalizedParams<FindFirst<TContentTypeUID>>,
  >(
    uid: TContentTypeUID,
    documentId?: ID | undefined,
    params?: TParams,
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ): Promise<APIResponse<Result<TContentTypeUID, TParams>>> {
    const path = Strapi.getStrapiApiPathByUId(uid)
    const url = `${path}${documentId ? `/${documentId}` : ""}`
    return await Strapi.fetchAPI(url, params, requestInit, options)
  }

  /**
   * Fetches multiple documents
   */
  public static async fetchMany<
    TContentTypeUID extends UID.ContentType,
    TParams extends AppLocalizedParams<FindMany<TContentTypeUID>>,
  >(
    uid: TContentTypeUID,
    params?: TParams,
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ): Promise<APIResponseCollection<Result<TContentTypeUID, TParams>>> {
    const path = Strapi.getStrapiApiPathByUId(uid)
    return await Strapi.fetchAPI(path, params, requestInit, options)
  }

  /**
   * Fetches all documents
   */
  public static async fetchAll<
    TContentTypeUID extends UID.ContentType,
    TParams extends AppLocalizedParams<FindMany<TContentTypeUID>>,
  >(
    uid: TContentTypeUID,
    params?: TParams,
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ): Promise<APIResponseCollection<Result<TContentTypeUID, TParams>>> {
    const path = Strapi.getStrapiApiPathByUId(uid)

    // Strapi can be configured in https://docs.strapi.io/dev-docs/configurations/api
    const maxPageSize = 100

    const firstPage: APIResponseCollection<Result<TContentTypeUID, TParams>> =
      await Strapi.fetchAPI(
        path,
        { ...params, pagination: { page: 1, pageSize: maxPageSize } },
        requestInit,
        options
      )

    if (firstPage.meta.pagination.pageCount === 1) {
      return firstPage
    }

    const otherPages = Array.from(
      { length: firstPage.meta.pagination.pageCount - 1 },
      (_, i) =>
        Strapi.fetchAPI(
          path,
          {
            ...params,
            pagination: {
              ...firstPage.meta.pagination,
              page: i + 2,
              pageSize: maxPageSize,
            },
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
    TParams extends AppLocalizedParams<FindMany<TContentTypeUID>>,
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
    const path = Strapi.getStrapiApiPathByUId(uid)
    const response: APIResponseCollection<Result<TContentTypeUID, TParams>> =
      await Strapi.fetchAPI(path, mergedParams, requestInit, options)

    // return last published entry
    return {
      data: response.data.pop() ?? null,
      meta: {},
    }
  }

  /**
   * Fetches a single entity by full path
   */
  public static async fetchOneByFullPath<
    TContentTypeUID extends UID.ContentType,
    TParams extends AppLocalizedParams<FindMany<TContentTypeUID>>,
  >(
    uid: TContentTypeUID,
    fullPath: string | null,
    params?: TParams,
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ): Promise<
    APIResponseWithBreadcrumbs<
      Result<TContentTypeUID, TParams> & PageLocalization
    >
  > {
    const slugFilter =
      fullPath && fullPath.length > 0 ? { $eq: fullPath } : { $null: true }
    const mergedParams = {
      ...params,
      sort: { publishedAt: "desc" },
      filters: { ...params?.filters, fullPath: slugFilter },
    }
    const path = Strapi.getStrapiApiPathByUId(uid)

    const response: APIResponseCollection<Result<TContentTypeUID, TParams>> =
      await Strapi.fetchAPI(path, mergedParams, requestInit, options)

    // return last published entry
    return {
      // @ts-expect-error localizations TODO @dominik-juriga
      data: response.data.pop() ?? null,
      meta: response.meta,
    }
  }

  public static async prepareRequest(
    path: string,
    params: object,
    jwt?: string,
    omitAuthorization?: boolean
  ) {
    let url = `/api${path.startsWith("/") ? path : `/${path}`}`

    const queryString =
      typeof params === "object" ? qs.stringify(params) : params
    if (queryString != null && queryString?.length > 0) {
      url += `?${queryString}`
    }

    let completeUrl = `/api/proxy${url}`
    if (typeof window === "undefined") {
      // SSR components do not support relative URLs, so we have to prefix it with local app URL
      completeUrl = `${env.APP_PUBLIC_URL}${completeUrl}`
    }

    let strapiToken = omitAuthorization ? undefined : jwt
    if (!omitAuthorization && !strapiToken) {
      strapiToken = await Strapi.getStrapiUserTokenFromNextAuth()
    }

    return {
      url: completeUrl,
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

  /**
   * Get user-permission token from the NextAuth session
   * @returns strapiToken
   */
  private static async getStrapiUserTokenFromNextAuth() {
    const isRSC = typeof window === "undefined"
    if (isRSC) {
      // server side
      const session = await getAuth()
      return session?.strapiJWT
    }

    // client side
    // this makes HTTP request to /api/auth/session to get the session
    // this is not the best solution because it makes HTTP request to the server
    // but useSession() can't be used here
    const session = await getSession()
    return session?.strapiJWT
  }

  private static async parseResponse(response: Response) {
    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      return {
        contentType,
        json: await response.json(),
      }
    }

    return {
      contentType,
      text: await response.text(),
    }
  }
}
