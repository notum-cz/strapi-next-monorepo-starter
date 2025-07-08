import type {
  APIResponse,
  APIResponseCollection,
  APIResponseWithBreadcrumbs,
  AppLocalizedParams,
  PageLocalization,
} from "@/types/api"
import type { AppError, CustomFetchOptions } from "@/types/general"
import type { FindFirst, FindMany, ID, Result, UID } from "@repo/strapi"

import { isDevelopment } from "@/lib/general-helpers"

// Add endpoints here that are queried from the frontend.
// Mapping of Strapi content type UIDs to API endpoint paths.
// eslint-disable-next-line no-unused-vars
export const API_ENDPOINTS: { [key in UID.ContentType]?: string } = {
  "api::page.page": "/pages",
  "api::footer.footer": "/footer",
  "api::navbar.navbar": "/navbar",
  "api::subscriber.subscriber": "/subscribers",
} as const

export default abstract class BaseStrapiClient {
  public async fetchAPI(
    path: string,
    params: AppLocalizedParams<Record<string, any>> = {},
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ) {
    const { url, headers } = await this.prepareRequest(
      path,
      {
        ...params,
        ...(options?.doNotAddLocaleQueryParams
          ? {}
          : { locale: params.locale }),
      },
      requestInit,
      options
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

    const { json, text } = await this.parseResponse(response)

    if (text) {
      const appError: AppError = {
        name: "Invalid response format",
        message: text,
        status: response.status,
      }
      console.error("[BaseStrapiClient] Strapi API request error: ", appError)
      throw new Error(JSON.stringify(appError))
    }

    if (!response.ok) {
      const { error } = json
      const appError: AppError = {
        name: error?.name,
        message: error?.message,
        details: error?.details,
        status: response.status ?? error?.status,
      }
      console.error("[BaseStrapiClient] Strapi API request error: ", appError)
      throw new Error(JSON.stringify(appError))
    }

    return json
  }

  /**
   * Fetches one document by ID or Single type (without ID)
   */
  public async fetchOne<
    TContentTypeUID extends UID.ContentType,
    TParams extends AppLocalizedParams<FindFirst<TContentTypeUID>>,
  >(
    uid: TContentTypeUID,
    documentId?: ID | undefined,
    params?: TParams,
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ): Promise<APIResponse<Result<TContentTypeUID, TParams>>> {
    const path = this.getStrapiApiPathByUId(uid)
    const url = `${path}${documentId ? `/${documentId}` : ""}`
    return await this.fetchAPI(url, params, requestInit, options)
  }

  /**
   * Fetches multiple documents
   */
  public async fetchMany<
    TContentTypeUID extends UID.ContentType,
    TParams extends AppLocalizedParams<FindMany<TContentTypeUID>>,
  >(
    uid: TContentTypeUID,
    params?: TParams,
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ): Promise<APIResponseCollection<Result<TContentTypeUID, TParams>>> {
    const path = this.getStrapiApiPathByUId(uid)
    return await this.fetchAPI(path, params, requestInit, options)
  }

  /**
   * Fetches all documents
   */
  public async fetchAll<
    TContentTypeUID extends UID.ContentType,
    TParams extends AppLocalizedParams<FindMany<TContentTypeUID>>,
  >(
    uid: TContentTypeUID,
    params?: TParams,
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ): Promise<APIResponseCollection<Result<TContentTypeUID, TParams>>> {
    const path = this.getStrapiApiPathByUId(uid)

    // Strapi can be configured in https://docs.strapi.io/dev-docs/configurations/api
    const maxPageSize = 100

    const firstPage: APIResponseCollection<Result<TContentTypeUID, TParams>> =
      await this.fetchAPI(
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
        this.fetchAPI(
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
  public async fetchOneBySlug<
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
    const path = this.getStrapiApiPathByUId(uid)
    const response: APIResponseCollection<Result<TContentTypeUID, TParams>> =
      await this.fetchAPI(path, mergedParams, requestInit, options)

    // return last published entry
    return {
      data: response.data.pop() ?? null,
      meta: {},
    }
  }

  /**
   * Fetches a single entity by full path
   */
  public async fetchOneByFullPath<
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
      pagination: {
        page: 1,
        pageSize: 1,
      },
    }
    const path = this.getStrapiApiPathByUId(uid)

    const response: APIResponseCollection<Result<TContentTypeUID, TParams>> =
      await this.fetchAPI(path, mergedParams, requestInit, options)

    // return last published entry
    return {
      // @ts-expect-error localizations TODO @dominik-juriga
      data: response.data.pop() ?? null,
      meta: response.meta,
    }
  }

  protected abstract prepareRequest(
    // eslint-disable-next-line no-unused-vars
    path: string,
    // eslint-disable-next-line no-unused-vars
    params: object,
    // eslint-disable-next-line no-unused-vars
    requestInit?: RequestInit,
    // eslint-disable-next-line no-unused-vars
    options?: CustomFetchOptions
  ): Promise<{ url: string; headers: Record<string, string> }>

  /**
   * Get Path of the API route by UID
   * @param uid - UID of the Endpoint
   * @returns API Endpoint path
   */
  public getStrapiApiPathByUId(uid: keyof typeof API_ENDPOINTS): string {
    const path = API_ENDPOINTS[uid]
    if (path) {
      return path
    }
    throw new Error(
      `Endpoint for UID "${uid}" not found. Extend API_ENDPOINTS in lib/api/client.ts.`
    )
  }

  private async parseResponse(response: Response) {
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
