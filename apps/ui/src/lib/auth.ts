// apps/ui/src/lib/auth.ts
import { env } from "@/env.mjs"
import { betterAuth } from "better-auth"
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api"
import { setSessionCookie } from "better-auth/cookies"

import type { BetterAuthPlugin } from "better-auth"

import { PrivateStrapiClient } from "@/lib/strapi-api"

// Plugin for custom sign-in and registration endpoints
export const strapiAuthPlugin = {
  id: "strapi-auth",
  endpoints: {
    signInWithStrapi: createAuthEndpoint(
      "/sign-in-strapi",
      {
        method: "POST",
      },
      async (ctx) => {
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
          throw new Error("Invalid credentials")
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
          userId: user.id,
          blocked: user.blocked,
        }

        // IMPORTANT: generate a real Better Auth session (has token, timestamps, etc.)
        const session = await ctx.context.internalAdapter.createSession(
          userToSession.id
        )

        // IMPORTANT: actually set the cookie(s)
        await setSessionCookie(ctx, { user: userToSession, session })

        return ctx.json({ user: userToSession, session })
      }
    ),

    registerWithStrapi: createAuthEndpoint(
      "/register-strapi",
      {
        method: "POST",
      },
      async (ctx) => {
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
          throw new Error("Registration failed")
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
          userId: user.id,
          blocked: user.blocked,
        }

        const session = await ctx.context.internalAdapter.createSession(
          userToSession.id
        )

        await setSessionCookie(ctx, { user: userToSession, session })

        return ctx.json({ user: userToSession, session })
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
        use: [sessionMiddleware], // Require session
      },
      async (ctx) => {
        // Get current session to access strapiJWT
        const currentUser = ctx.context.session.user

        if (!currentUser?.strapiJWT) {
          throw new Error("No active session")
        }

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
          throw new Error("Failed to update password")
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
      }
    ),
  },
} satisfies BetterAuthPlugin

export const auth = betterAuth({
  baseURL: env.APP_PUBLIC_URL,
  secret: env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",

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

  plugins: [strapiAuthPlugin, updatePasswordPlugin],
})
