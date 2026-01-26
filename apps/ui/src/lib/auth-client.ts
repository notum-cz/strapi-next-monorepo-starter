import { createAuthClient } from "better-auth/react"

import type { BetterAuthClientPlugin } from "better-auth/client"
import { BetterAuthSessionWithStrapi } from "@/types/better-auth"

import { getEnvVar } from "@/lib/env-vars"

import { strapiAuthPlugin, strapiOAuthPlugin } from "./auth"

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
