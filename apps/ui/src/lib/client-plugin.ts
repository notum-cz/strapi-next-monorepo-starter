import type { BetterAuthClientPlugin } from "better-auth/client"

import {
  strapiAuthPlugin,
  strapiOAuthPlugin,
  updatePasswordPlugin,
} from "./auth"

// Client plugin that infers endpoints from server plugin
export const strapiAuthClientPlugin = {
  id: "strapi-auth",
  $InferServerPlugin: {} as typeof strapiAuthPlugin,
} satisfies BetterAuthClientPlugin

// Client plugin for update password endpoint
export const updatePasswordClientPlugin = {
  id: "update-password",
  $InferServerPlugin: {} as typeof updatePasswordPlugin,
} satisfies BetterAuthClientPlugin

// Client plugin for Strapi OAuth endpoint
export const strapiOAuthClientPlugin = {
  id: "strapi-oauth",
  $InferServerPlugin: {} as typeof strapiOAuthPlugin,
} satisfies BetterAuthClientPlugin
