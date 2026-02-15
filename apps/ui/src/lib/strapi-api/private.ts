import qs from "qs"

import { getEnvVar } from "@/lib/env-vars"
import BaseStrapiClient from "@/lib/strapi-api/base"
import {
  createStrapiAuthHeader,
  formatStrapiAuthorizationHeader,
} from "@/lib/strapi-api/request-auth"
import type { CustomFetchOptions } from "@/types/general"

export class PrivateClient extends BaseStrapiClient {
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
      completeUrl = `/api/private-proxy${url}`
    } else {
      // Directly use the Strapi URL. Same logic as in proxy route handler must be applied
      // (for SSR components and server actions/context)
      const strapiUrl = getEnvVar("STRAPI_URL", true)
      completeUrl = `${strapiUrl!}${url}`
    }

    if (!options?.omitUserAuthorization) {
      if (options?.userJWT) {
        headers = {
          ...formatStrapiAuthorizationHeader(options.userJWT),
        }
      } else {
        const authHeader = await createStrapiAuthHeader({ isPrivate: true })

        headers = { ...authHeader }
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
