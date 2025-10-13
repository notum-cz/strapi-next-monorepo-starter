import { Result } from "@repo/strapi"
import { getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next"
import type { NextAuthOptions } from "next-auth"

import { PrivateStrapiClient } from "@/lib/strapi-api"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 2592000, // 30 days - synced with strapi
  },
  providers: [
    CredentialsProvider({
      name: "StrapiCredentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        return PrivateStrapiClient.fetchAPI(
          `/auth/local`,
          undefined,
          {
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
            method: "POST",
          },
          { omitUserAuthorization: true }
        )
          .then((data) => {
            const { jwt, user } = data
            if (jwt == null || user == null) {
              return null
            }

            return {
              name: user.username,
              email: user.email,
              // strapi user id is a number, but next-auth expects a string
              id: user.id.toString(),
              userId: user.id,
              blocked: user.blocked,
              strapiJWT: jwt,
            }
          })
          .catch((error) => {
            throw new Error(error.message)
          })
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, account, session }) => {
      if (trigger === "update" && session?.username) {
        // change username update
        token.name = session.username
      }

      if (trigger === "update" && session?.strapiJWT) {
        // change password update
        token.strapiJWT = session.strapiJWT
      }

      if (account) {
        // initial login

        if (account.access_token != null) {
          // OAuth login - connect the account
          try {
            const data = await PrivateStrapiClient.fetchAPI(
              `/auth/${account.provider}/callback?access_token=${account.access_token}`,
              undefined
            )
            const { jwt, user } = data

            if (jwt == null) {
              throw new Error("No JWT provided by Strapi API")
            }

            // add only necessary data to the token
            token.strapiJWT = jwt
            token.userId = user?.id
            token.blocked = user?.blocked
          } catch (error: any) {
            token.error = "oauth_error"

            if (error?.message?.includes("Email is already taken")) {
              token.error = "different_provider"
            }
          }
        }

        if (account.provider === "credentials") {
          // credentials login
          // add only necessary data to the token
          // make sure structure is the same as in OAuth login
          token.strapiJWT = user.strapiJWT
          token.userId = user.userId
          token.blocked = user.blocked
        }
      }

      // do not attach the whole user data to this final token object
      // the token object is encrypted into JWT cookie string which is then sent in the requests
      // very long tokens can cause problems (cookie size limit, performance, kill the server)
      return token
    },
    session: async ({ token, session }) => {
      if (token?.strapiJWT != null && token?.error == null) {
        // check if token is valid and user data is still up-to-date
        // this is optional
        // this block checks validity of the token against strapi
        // the check happens on every get session call (many times)
        // it can be removed to improve performance but weird things can happen
        // (user is logged in within NextAuth and UI but not in Strapi API)
        try {
          const fetchedUser: Result<"plugin::users-permissions.user"> =
            await PrivateStrapiClient.fetchAPI(
              "/users/me",
              undefined,
              undefined,
              { userJWT: token.strapiJWT }
            )

          // API token is valid - update/reload user data or add more data
          token.name = fetchedUser.username
          token.blocked = fetchedUser.blocked ?? false
        } catch (error: any) {
          // API token is invalid - send error to client and user is logged out
          // console.error("Strapi JWT token is invalid: ", error.message)
          token.error = "invalid_strapi_token"
        }
      }

      if (token) {
        // expose following data to the client (/api/auth/session response)
        // don't expose sensitive data
        // we can add more data to "session" object if needed (user roles, avatar, etc.)
        // data passed from here are not part of the JWT token and cookie
        session.error = token.error
        session.strapiJWT = token.strapiJWT
        session.user.userId = token.userId
        session.user.blocked = token.blocked
      }

      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
}

// Use it in server contexts
export function getAuth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions)
}
