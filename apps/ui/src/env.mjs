import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  emptyStringAsUndefined: true,

  /*
   * Server-side environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   *
   * These are marked as optional to allow Docker builds to succeed without
   * baking variables into the image. Runtime validation in the code is necessary
   * to ensure required variables are present. Making them mandatory here would
   * require them to be present at build time, which is not always desired or possible (see README).
   */
  server: {
    APP_PUBLIC_URL: z.string().url().optional(),
    DEBUG_STATIC_PARAMS_GENERATION: optionalZodBoolean(),
    SHOW_NON_BLOCKING_ERRORS: optionalZodBoolean(),
    STRAPI_URL: z.string().url().optional(),
    STRAPI_REST_READONLY_API_KEY: z.string().optional(),
    STRAPI_REST_CUSTOM_API_KEY: z.string().optional(),
    STRAPI_PREVIEW_SECRET: z.string().optional(),

    NEXT_OUTPUT: z.string().optional(),
    WEBPACK_CACHE_TYPE: z.enum(["filesystem", "memory"]).optional(),

    NEXTAUTH_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().optional(),

    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING: z.string().optional(),

    RECAPTCHA_SECRET_KEY: z.string().optional(),
  },

  /*
   * Environment variables available on the client (and server).
   * You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   *
   * Note: These are baked into the client bundle at build time.
   * If you need different values per environment with a single Docker image,
   * consider runtime injection instead (through `window.__ENV__` or similar hack).
   */
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
    NEXT_PUBLIC_PREVENT_UNUSED_FUNCTIONS_ERROR_LOGS: optionalZodBoolean(),
  },

  shared: {
    // NODE_ENV makes app behave as if in production mode (optimized builds, no dev-only behavior, etc.)
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
    // server
    APP_PUBLIC_URL: process.env.APP_PUBLIC_URL,
    DEBUG_STATIC_PARAMS_GENERATION: process.env.DEBUG_STATIC_PARAMS_GENERATION,
    SHOW_NON_BLOCKING_ERRORS: process.env.SHOW_NON_BLOCKING_ERRORS,
    STRAPI_URL: process.env.STRAPI_URL,
    STRAPI_REST_READONLY_API_KEY: process.env.STRAPI_REST_READONLY_API_KEY,
    STRAPI_REST_CUSTOM_API_KEY: process.env.STRAPI_REST_CUSTOM_API_KEY,
    STRAPI_PREVIEW_SECRET: process.env.STRAPI_PREVIEW_SECRET,

    NEXT_OUTPUT: process.env.NEXT_OUTPUT,
    WEBPACK_CACHE_TYPE: process.env.WEBPACK_CACHE_TYPE,

    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING:
      process.env.SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING,

    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,

    // client
    // TODO: @dominik-juriga - find out if these are specific per environment
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_PREVENT_UNUSED_FUNCTIONS_ERROR_LOGS:
      process.env.NEXT_PUBLIC_PREVENT_UNUSED_FUNCTIONS_ERROR_LOGS,

    // shared
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.APP_ENV,
  },
})

// Helpers

function optionalZodBoolean() {
  return z
    .string()
    .toLowerCase()
    .transform((x) => x === "true")
    .pipe(z.boolean())
    .optional()
}
