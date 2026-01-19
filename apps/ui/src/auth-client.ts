import { createAuthClient } from "better-auth/react"

import {
  strapiAuthClientPlugin,
  strapiOAuthClientPlugin,
  updatePasswordClientPlugin,
} from "@/lib/client-plugin"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    strapiAuthClientPlugin,
    updatePasswordClientPlugin,
    strapiOAuthClientPlugin,
  ],
})
