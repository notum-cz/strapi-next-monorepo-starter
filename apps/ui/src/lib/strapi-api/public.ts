import { env } from "@/env.mjs"
import qs from "qs"

import { CustomFetchOptions } from "@/types/general"

import BaseStrapiClient from "@/lib/strapi-api/base"
import { createStrapiAuthHeader } from "@/lib/strapi-api/request-auth"

export class PublicClient extends BaseStrapiClient {
  protected async prepareRequest(
    path: string,
    params: object,
    requestInit?: RequestInit,
    options?: CustomFetchOptions
  ): Promise<{ url: string; headers: Record<string, string> }> {
    let url = `/api${path.startsWith("/") ? path : `/${path}`}`

    const queryString =
      typeof params === "object" ? qs.stringify(params) : params
    if (queryString != null && queryString?.length > 0) {
      url += `?${queryString}`
    }

    let completeUrl = ""
    let headers: Record<string, string> = {}

    if (options?.useProxy) {
      // If useProxy is set, we need to use the public-proxy endpoint here in Next.js
      // (for client-side requests)
      completeUrl = `/api/public-proxy${url}`
    } else {
      // Directly use the Strapi URL. Same logic as in proxy route handler must be applied
      // (for SSR components and server actions/context)
      completeUrl = `${env.STRAPI_URL}${url}`

      // If there is no method specified in requestInit, default is GET
      const isReadOnly = ["GET", "HEAD"].includes(requestInit?.method ?? "GET")
      const authHeader = await createStrapiAuthHeader({
        isReadOnly,
        isPrivate: false,
      })

      headers = {
        ...authHeader,
      }
    }

    const isFormData = requestInit?.body instanceof FormData

    return {
      url: completeUrl,
      headers: {
        Accept: "application/json",
        ...(isFormData ? {} : { "Content-type": "application/json" }),
        ...headers,
      },
    }
  }
}
