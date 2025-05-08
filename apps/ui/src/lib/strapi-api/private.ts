import { env } from "@/env.mjs"
import { getSession } from "next-auth/react"
import qs from "qs"

import { CustomFetchOptions } from "@/types/general"

import { getAuth } from "@/lib/auth"
import BaseStrapiClient from "@/lib/strapi-api/base"

export class PrivateClient extends BaseStrapiClient {
  protected async prepareRequest(
    path: string,
    params: object,
    options?: CustomFetchOptions
  ): Promise<{ url: string; headers: Record<string, string> }> {
    let url = `/api${path.startsWith("/") ? path : `/${path}`}`

    const queryString =
      typeof params === "object" ? qs.stringify(params) : params
    if (queryString != null && queryString?.length > 0) {
      url += `?${queryString}`
    }

    let completeUrl = `/api/private-proxy${url}`
    if (typeof window === "undefined") {
      // SSR components do not support relative URLs, so we have to prefix it with local app URL
      completeUrl = `${env.APP_PUBLIC_URL}${completeUrl}`
    }

    const token = options?.omitUserAuthorization
      ? undefined
      : options?.userJWT || (await this.getStrapiUserTokenFromNextAuth())

    return {
      url: completeUrl,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  }

  /**
   * Get user-permission token from the NextAuth session
   * @returns strapiToken
   */
  private async getStrapiUserTokenFromNextAuth() {
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
}
