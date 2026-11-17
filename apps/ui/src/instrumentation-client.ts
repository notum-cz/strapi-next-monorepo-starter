// This file configures the initialization of Sentry on the client.
// Next.js loads `instrumentation-client.ts` before the app becomes interactive,
// under both Turbopack and webpack (the old root `sentry.client.config.ts` was
// only injected by the Sentry webpack plugin, so Turbopack builds skipped it).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

import { getEnvVar } from "@/lib/env-vars"
import { sentryDataCollection } from "@/lib/telemetry/providers/sentry-data-collection"

Sentry.init({
  dsn: getEnvVar("NEXT_PUBLIC_SENTRY_DSN"),

  // Keep the v10 (`sendDefaultPii` off) data-collection baseline.
  dataCollection: sentryDataCollection,

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration({
      // Additional SDK configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.3,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 0%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})

// Instruments client-side navigations for tracing. No-ops without a DSN.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
