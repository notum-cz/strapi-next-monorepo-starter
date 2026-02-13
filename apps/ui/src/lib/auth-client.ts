import type { BetterAuthClientPlugin } from "better-auth/client"
import { createAuthClient } from "better-auth/react"

import { getEnvVar } from "@/lib/env-vars"
import type { BetterAuthSessionWithStrapi } from "@/types/better-auth"

import type { strapiAuthPlugin, strapiOAuthPlugin } from "./auth"

const strapiAuthClientPlugin = {
  id: "strapi-auth",
  $InferServerPlugin: {} as typeof strapiAuthPlugin,
} satisfies BetterAuthClientPlugin

const strapiOAuthClientPlugin = {
  id: "strapi-oauth",
  $InferServerPlugin: {} as typeof strapiOAuthPlugin,
} satisfies BetterAuthClientPlugin

export const authClient = createAuthClient({
  baseURL: getEnvVar("APP_PUBLIC_URL"),
  plugins: [strapiAuthClientPlugin, strapiOAuthClientPlugin],
})

export const getSessionCSR = async () => {
  const session = await authClient.getSession()

  return {
    data: session.data as BetterAuthSessionWithStrapi | null,
    error: session.error,
  }
}
