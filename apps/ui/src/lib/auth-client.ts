import { createAuthClient } from "better-auth/react"

import type { BetterAuthClientPlugin } from "better-auth/client"

import {
  strapiAuthPlugin,
  strapiOAuthPlugin,
  updatePasswordPlugin,
} from "./auth"

// Client plugin that infers endpoints from server plugin
const strapiAuthClientPlugin = {
  id: "strapi-auth",
  $InferServerPlugin: {} as typeof strapiAuthPlugin,
} satisfies BetterAuthClientPlugin

// Client plugin for update password endpoint
const updatePasswordClientPlugin = {
  id: "update-password",
  $InferServerPlugin: {} as typeof updatePasswordPlugin,
} satisfies BetterAuthClientPlugin

// Client plugin for Strapi OAuth endpoint
const strapiOAuthClientPlugin = {
  id: "strapi-oauth",
  $InferServerPlugin: {} as typeof strapiOAuthPlugin,
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    strapiAuthClientPlugin,
    updatePasswordClientPlugin,
    strapiOAuthClientPlugin,
  ],
})
