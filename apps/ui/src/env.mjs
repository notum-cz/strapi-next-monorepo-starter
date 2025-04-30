import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const optionalZodBoolean = z
  .string()
  .toLowerCase()
  .transform((x) => x === "true")
  .pipe(z.boolean())
  .optional()

export const env = createEnv({
  emptyStringAsUndefined: true,

  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    NEXTAUTH_SECRET: z.string().optional(),
    NEXTAUTH_URL: z.string().url().optional(),
    NEXT_OUTPUT: z.string().optional(),
    APP_PUBLIC_URL: z.string().url(),
    STRAPI_URL: z.string().url(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
  },
  /*
   * Environment variables available on the client (and server).
   * You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_PREVENT_UNUSED_FUNCTIONS_ERROR_LOGS: optionalZodBoolean,
    NEXT_PUBLIC_REVALIDATE: z.number().or(z.literal(false)).optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  },
  shared: {
    // NODE_ENV makes app to behave as it's in production mode (optimized builds, no dev-only behavior, etc.)
    NODE_ENV: z.enum(["development", "production"]).optional(),
    // APP_ENV is used to determine the environment the app is running in. Used to divide deployments.
    APP_ENV: z.enum(["testing", "production"]).optional(),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   * You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_OUTPUT: process.env.NEXT_OUTPUT,
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.APP_ENV,
    APP_PUBLIC_URL: process.env.APP_PUBLIC_URL,
    STRAPI_URL: process.env.STRAPI_URL,
    NEXT_PUBLIC_PREVENT_UNUSED_FUNCTIONS_ERROR_LOGS:
      process.env.NEXT_PUBLIC_PREVENT_UNUSED_FUNCTIONS_ERROR_LOGS,
    NEXT_PUBLIC_REVALIDATE: (() => {
      const revalidate = process.env.NEXT_PUBLIC_REVALIDATE
      const coercedRevalidate =
        revalidate != null
          ? isNaN(Number(revalidate))
            ? false
            : Number(revalidate)
          : undefined

      return coercedRevalidate
    })(),
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  },
})
