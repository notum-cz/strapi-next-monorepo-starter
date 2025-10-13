// https://next-auth.js.org/getting-started/typescript

import { DefaultSession } from "next-auth"

type DefaultSessionUser = DefaultSession["user"]

interface AppUser extends DefaultSessionUser {
  userId?: number
  strapiJWT?: string
  blocked?: boolean
}

export interface AppSession {
  strapiJWT?: string
  user: AppUser
  error?: "invalid_strapi_token" | "different_provider" | "oauth_error"
}

declare module "next-auth" {
  // Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
  // eslint-disable-next-line no-unused-vars
  interface Session extends AppSession {
    user: User
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends AppUser {}
}

declare module "next-auth/jwt" {
  // Returned by the `jwt` callback and `getToken`, when using JWT sessions
  // eslint-disable-next-line no-unused-vars
  interface JWT {
    userId?: number
    strapiJWT?: string
    blocked?: boolean
    error?: "invalid_strapi_token" | "different_provider" | "oauth_error"
  }
}
