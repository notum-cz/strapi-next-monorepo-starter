// apps/ui/src/lib/auth.ts
import { env } from "@/env.mjs"
import { Result } from "@repo/strapi-types"
import { betterAuth } from "better-auth"
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api"
import { deleteSessionCookie, setSessionCookie } from "better-auth/cookies"
import { customSession } from "better-auth/plugins"
import { z } from "zod"

import type { BetterAuthPlugin } from "better-auth"

import { PrivateStrapiClient } from "@/lib/strapi-api"

const mapStrapiStatusToApiError = (status?: number) => {
  switch (status) {
    case 400:
      return "BAD_REQUEST"
    case 401:
      return "UNAUTHORIZED"
    case 403:
      return "FORBIDDEN"
    case 404:
      return "NOT_FOUND"
    case 409:
      return "CONFLICT"
    case 422:
      return "UNPROCESSABLE_ENTITY"
    case 429:
      return "TOO_MANY_REQUESTS"
    default:
      return "INTERNAL_SERVER_ERROR"
  }
}

const throwStrapiError = (
  error: unknown,
  fallbackMessage: string,
  fallbackStatus?: number
) => {
  if (error instanceof APIError) {
    throw error
  }
  try {
    const parsed = JSON.parse(
      typeof error === "string" ? error : ((error as Error)?.message ?? "")
    )
    const status =
      typeof parsed?.status === "number" ? parsed.status : undefined
    const message =
      typeof parsed?.message === "string" ? parsed.message : fallbackMessage
    throw new APIError(mapStrapiStatusToApiError(status), {
      message,
      code: typeof parsed?.name === "string" ? parsed.name : undefined,
    })
  } catch {
    const message =
      typeof (error as Error)?.message === "string"
        ? (error as Error).message
        : fallbackMessage
    throw new APIError(mapStrapiStatusToApiError(fallbackStatus), { message })
  }
}

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
            emailVerified: false,
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
        } catch (error: any) {
          throwStrapiError(error, "Authentication failed")
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

          const userToSession = {
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
        } catch (error: any) {
          throwStrapiError(error, "Registration failed")
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
        } catch (error: any) {
          throwStrapiError(error, "Failed to send password reset email")
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
        } catch (error: any) {
          throwStrapiError(error, "Failed to reset password")
        }
      }
    ),
  },
} satisfies BetterAuthPlugin

// Plugin to update password and refresh session
export const updatePasswordPlugin = {
  id: "update-password",
  endpoints: {
    updatePassword: createAuthEndpoint(
      "/update-password",
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
        } catch (error: any) {
          throwStrapiError(error, "Failed to update password")
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
    const strapiJWT = (user as any)?.strapiJWT
    if (!strapiJWT) {
      return { user, session }
    }

    try {
      const fetchedUser: Result<"plugin::users-permissions.user"> =
        await PrivateStrapiClient.fetchAPI("/users/me", undefined, undefined, {
          userJWT: strapiJWT,
        })

      // if blocked -> clear session and throw to log out
      if (fetchedUser?.blocked) {
        deleteSessionCookie(ctx)
      }

      // update user fields with fresh Strapi data
      // Map Strapi's "local" provider to "credentials" for consistency
      // For OAuth users, Strapi should return provider (e.g., "github", "google")
      // If Strapi doesn't return provider, fall back to existing user.provider from session
      const strapiProvider = fetchedUser.provider
      const mappedProvider =
        strapiProvider === "local"
          ? "credentials"
          : (strapiProvider ?? (user as any).provider ?? "credentials")

      const updatedUser = {
        ...user,
        name: fetchedUser.username ?? user.name,
        blocked: fetchedUser.blocked ?? false,
        provider: mappedProvider,
      }

      return { user: updatedUser, session }
    } catch (error) {
      // invalid/expired Strapi JWT -> clear Better Auth session cookie
      console.error("Strapi JWT validation failed:", error)
      deleteSessionCookie(ctx)
      throw error
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
            emailVerified: false,
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

          return ctx.json({
            user: userToSession,
            session,
          })
        } catch (error: any) {
          throwStrapiError(error, "Failed to sync OAuth with Strapi")
        }
      }
    ),
  },
} satisfies BetterAuthPlugin

export const auth = betterAuth({
  baseURL: env.APP_PUBLIC_URL,
  secret: env.BETTER_AUTH_SECRET ?? "fallback-secret-for-development-only",

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

  plugins: [
    strapiAuthPlugin,
    updatePasswordPlugin,
    strapiSessionPlugin,
    strapiOAuthPlugin,
  ],
})
