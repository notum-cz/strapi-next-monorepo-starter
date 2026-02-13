import type { Result } from "@repo/strapi-types"
import { betterAuth, type BetterAuthPlugin } from "better-auth"
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api"
import { deleteSessionCookie, setSessionCookie } from "better-auth/cookies"
import { customSession } from "better-auth/plugins"
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"
import { z } from "zod"

import { getEnvVar } from "@/lib/env-vars"
import { safeJSONParse } from "@/lib/general-helpers"
import { PrivateStrapiClient } from "@/lib/strapi-api"
import type {
  BetterAuthSessionWithStrapi,
  BetterAuthUserWithStrapi,
} from "@/types/better-auth"

export const strapiAuthPlugin = {
  id: "strapi-auth",
  endpoints: {
    signInWithStrapi: createAuthEndpoint(
      "/sign-in-strapi",
      {
        method: "POST",
        body: z.object({
          email: z.string(),
          password: z.string(),
        }),
      },
      async (ctx) => {
        try {
          const data = await PrivateStrapiClient.fetchAPI(
            `/auth/local`,
            undefined,
            {
              body: JSON.stringify({
                identifier: ctx.body.email,
                password: ctx.body.password,
              }),
              method: "POST",
            },
            { omitUserAuthorization: true }
          )
          const { jwt, user } = data
          if (jwt == null || user == null) {
            throw new APIError("UNAUTHORIZED", {
              message: "Invalid credentials",
            })
          }

          const userToSession = {
            id: user.id.toString(),
            email: user.email,
            name: user.username,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            strapiJWT: jwt,
            blocked: user.blocked,
            provider: "credentials",
          }

          const session = await ctx.context.internalAdapter.createSession(
            userToSession.id
          )

          await setSessionCookie(ctx, { user: userToSession, session })

          return ctx.json({ user: userToSession, session })
        } catch (error) {
          throwBetterAuthError(error, "Authentication failed")
        }
      }
    ),

    registerWithStrapi: createAuthEndpoint(
      "/register-strapi",
      {
        method: "POST",
        body: z.object({
          username: z.string(),
          email: z.string(),
          password: z.string(),
        }),
      },
      async (ctx) => {
        try {
          // Call Strapi to register user
          const data = await PrivateStrapiClient.fetchAPI(
            `/auth/local/register`,
            undefined,
            {
              body: JSON.stringify({
                username: ctx.body.username,
                email: ctx.body.email,
                password: ctx.body.password,
              }),
              method: "POST",
            },
            { omitUserAuthorization: true }
          )

          const { jwt, user } = data
          if (jwt == null || user == null) {
            throw new APIError("BAD_REQUEST", {
              message: "Registration failed",
            })
          }

          const userToSession: BetterAuthUserWithStrapi = {
            id: user.id.toString(),
            email: user.email,
            name: user.username,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            image: null,
            strapiJWT: jwt,
            blocked: user.blocked,
            provider: "credentials",
          }

          const session = await ctx.context.internalAdapter.createSession(
            userToSession.id
          )

          await setSessionCookie(ctx, { user: userToSession, session })

          return ctx.json({ user: userToSession, session })
        } catch (error) {
          throwBetterAuthError(error, "Registration failed")
        }
      }
    ),

    forgotPasswordWithStrapi: createAuthEndpoint(
      "/forgot-password-strapi",
      {
        method: "POST",
        body: z.object({
          email: z.string().email(),
        }),
      },
      async (ctx) => {
        try {
          await PrivateStrapiClient.fetchAPI(
            `/auth/forgot-password`,
            undefined,
            {
              body: JSON.stringify({
                email: ctx.body.email,
              }),
              method: "POST",
            },
            { omitUserAuthorization: true }
          )

          // Strapi's forgot-password endpoint returns success even if email doesn't exist
          // (for security reasons - don't reveal if email exists)
          return ctx.json({ success: true })
        } catch (error) {
          throwBetterAuthError(error, "Failed to send password reset email")
        }
      }
    ),

    resetPasswordWithStrapi: createAuthEndpoint(
      "/reset-password-strapi",
      {
        method: "POST",
        body: z.object({
          code: z.string(),
          password: z.string(),
          passwordConfirmation: z.string(),
        }),
      },
      async (ctx) => {
        try {
          await PrivateStrapiClient.fetchAPI(
            `/auth/reset-password`,
            undefined,
            {
              body: JSON.stringify({
                code: ctx.body.code,
                password: ctx.body.password,
                passwordConfirmation: ctx.body.passwordConfirmation,
              }),
              method: "POST",
            },
            { omitUserAuthorization: true }
          )

          return ctx.json({ success: true })
        } catch (error) {
          throwBetterAuthError(error, "Failed to set a new password")
        }
      }
    ),

    updatePasswordWithStrapi: createAuthEndpoint(
      "/update-password-strapi",
      {
        method: "POST",
        use: [sessionMiddleware],
        body: z.object({
          currentPassword: z.string(),
          password: z.string(),
          passwordConfirmation: z.string(),
        }),
      },
      async (ctx) => {
        // Get current session to access strapiJWT
        const currentUser = ctx.context.session.user

        if (!currentUser?.strapiJWT) {
          throw new APIError("UNAUTHORIZED", {
            message: "No active session",
          })
        }

        try {
          // Update password in Strapi
          const data = await PrivateStrapiClient.fetchAPI(
            "/auth/change-password",
            undefined,
            {
              body: JSON.stringify({
                currentPassword: ctx.body.currentPassword,
                password: ctx.body.password,
                passwordConfirmation: ctx.body.passwordConfirmation,
              }),
              method: "POST",
            },
            { userJWT: currentUser.strapiJWT }
          )

          // Strapi returns new JWT after password change
          const { jwt, user } = data

          if (!jwt || !user) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Failed to update password",
            })
          }

          // Update session with new JWT
          const updatedUser = {
            ...currentUser,
            strapiJWT: jwt,
            userId: user.id,
            blocked: user.blocked,
          }
          // Update the session cookie with new data
          await setSessionCookie(ctx, {
            user: updatedUser,
            session: ctx.context.session.session,
          })

          return ctx.json({
            user: updatedUser,
            session: ctx.context.session.session,
          })
        } catch (error) {
          throwBetterAuthError(error, "Failed to update password")
        }
      }
    ),
  },
} satisfies BetterAuthPlugin

// Plugin to validate Strapi JWT on every session access
// Uses Better Auth's customSession to intercept and validate
export const strapiSessionPlugin = customSession(
  async ({ user, session }, ctx) => {
    // if no strapiJWT, return as-is (unauthenticated request)
    const strapiJWT = (user as Record<string, unknown>)?.strapiJWT as
      | string
      | undefined
    if (!strapiJWT) {
      return { user, session }
    }

    try {
      const fetchedUser: Result<"plugin::users-permissions.user"> =
        await PrivateStrapiClient.fetchAPI("/users/me", undefined, undefined, {
          userJWT: strapiJWT,
        })

      if (fetchedUser?.blocked) {
        // use is blocked in Strapi, reject session
        throw new APIError("FORBIDDEN", {
          message: "User account is blocked",
        })
      }

      // update user fields with fresh Strapi data
      // Map Strapi's "local" provider to "credentials" for consistency
      // For OAuth users, Strapi should return provider (e.g., "github", "google")
      // If Strapi doesn't return provider, fall back to existing user.provider from session
      const strapiProvider = fetchedUser.provider
      const provider =
        strapiProvider === "local"
          ? "credentials"
          : (strapiProvider ?? (user as Record<string, unknown>).provider)

      const updatedUser = {
        ...user,
        name: fetchedUser.username ?? user.name,
        blocked: fetchedUser.blocked ?? false,
        provider: provider ?? "credentials",
      }

      return { user: updatedUser, session }
    } catch {
      // invalid/expired Strapi JWT -> clear Better Auth session cookie
      deleteSessionCookie(ctx)

      if (session?.token) {
        // optional but recommended: also revoke server-side session if you have it
        await ctx.context.internalAdapter.deleteSession(session.token)
      }

      return { user: null, session: null }
      // return throwBetterAuthError(error, "Strapi JWT validation failed")
    }
  }
)

// Plugin to sync OAuth with Strapi
// After Better Auth OAuth succeeds, this endpoint syncs the account with Strapi
export const strapiOAuthPlugin = {
  id: "strapi-oauth",
  endpoints: {
    syncOAuthWithStrapi: createAuthEndpoint(
      "/sync-oauth-strapi",
      {
        method: "POST",
        body: z.object({
          accessToken: z.string(),
          provider: z.string().default("github"),
        }),
      },
      async (ctx) => {
        try {
          const { accessToken, provider } = ctx.body

          // Call Strapi's OAuth callback endpoint
          const strapiData = await PrivateStrapiClient.fetchAPI(
            `/auth/${provider}/callback?access_token=${accessToken}`,
            undefined,
            undefined,
            { omitUserAuthorization: true }
          )

          const { jwt, user: strapiUser } = strapiData

          if (!jwt || !strapiUser) {
            throw new APIError("UNAUTHORIZED", {
              message: "Failed to authenticate with Strapi",
            })
          }

          if (!strapiUser.email) {
            throw new APIError("UNAUTHORIZED", {
              message: "Missing email from Strapi",
            })
          }

          const userToSession = {
            id: strapiUser.id.toString(),
            email: strapiUser.email,
            name: strapiUser.username ?? strapiUser.email,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            strapiJWT: jwt,
            blocked: strapiUser.blocked ?? false,
            provider: provider,
          }

          const session = await ctx.context.internalAdapter.createSession(
            userToSession.id
          )

          await setSessionCookie(ctx, {
            user: userToSession,
            session,
          })

          return ctx.json({ user: userToSession, session })
        } catch (error) {
          throwBetterAuthError(error, "Failed to sync OAuth with Strapi")
        }
      }
    ),
  },
} satisfies BetterAuthPlugin

export const auth = betterAuth({
  baseURL: getEnvVar("APP_PUBLIC_URL"),
  secret: getEnvVar("BETTER_AUTH_SECRET"),

  // Stateless mode
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 30 * 24 * 60 * 60, // 30 days
      strategy: "jwe",
      refreshCache: true,
    },
  },
  account: {
    storeStateStrategy: "cookie",
    storeAccountCookie: true,
  },

  plugins: [strapiAuthPlugin, strapiSessionPlugin, strapiOAuthPlugin],
})

/**
 * Helper to get session server-side from request headers and return typed session
 */
export const getSessionSSR = async (
  headers: ReadonlyHeaders
): Promise<BetterAuthSessionWithStrapi | null> =>
  auth.api.getSession({ headers })

/**
 * Convert Strapi errors to Better Auth APIError
 */
const throwBetterAuthError = (
  strapiError: unknown,
  fallbackMessage: string,
  fallbackStatus = 500
) => {
  if (strapiError instanceof APIError) {
    throw strapiError
  }

  const e = safeJSONParse<{
    status?: number
    message?: string
    name?: string
  }>(
    typeof strapiError === "string"
      ? strapiError
      : ((strapiError as Error)?.message ?? "")
  )

  const message = typeof e?.message === "string" ? e.message : fallbackMessage

  // APIError requires status text, map common HTTP status codes
  const statuses = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "UNPROCESSABLE_ENTITY",
    429: "TOO_MANY_REQUESTS",
  } as const

  const status = typeof e?.status === "number" ? e.status : fallbackStatus
  const statusText =
    statuses[status as keyof typeof statuses] || "INTERNAL_SERVER_ERROR"

  throw new APIError(statusText, {
    message,
    code: typeof e?.name === "string" ? e.name : undefined,
  })
}
