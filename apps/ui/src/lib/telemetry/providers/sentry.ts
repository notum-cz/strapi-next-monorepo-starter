/**
 * Sentry telemetry provider — server + edge initialization for `@sentry/nextjs`.
 *
 * Returns `null` from the factory when `NEXT_PUBLIC_SENTRY_DSN` is unset, so
 * Sentry is inert until configured. Remove this target by deleting this file
 * and its entry in `../index.ts`.
 *
 * Browser (client) Sentry initialization lives in `sentry.client.config.ts`,
 * which the Sentry Next.js SDK loads automatically, and the build-time source
 * map upload is configured via `withSentryConfig` in `next.config.mjs`. Both
 * are also inert without a DSN / auth token.
 */
import * as Sentry from "@sentry/nextjs"

import { getEnvVar } from "@/lib/env-vars"

import type { TelemetryProvider } from "../types"

export function sentryProvider(): TelemetryProvider | null {
  const dsn = getEnvVar("NEXT_PUBLIC_SENTRY_DSN")

  if (!dsn) {
    return null
  }

  return {
    name: "sentry",
    // The server and edge runtimes share the same init; the SDK resolves to the
    // correct (node vs edge) implementation through Next.js bundling.
    initialize: () => {
      Sentry.init({
        dsn,
        // Define how likely traces are sampled. Adjust in production, or use
        // tracesSampler for greater control.
        tracesSampleRate: 0.3,
        debug: false,
      })
    },
  }
}
