/**
 * Shared `dataCollection` baseline for every `Sentry.init` call (browser,
 * server, edge).
 *
 * `@sentry/nextjs` v11 replaced `sendDefaultPii` with `dataCollection`, and
 * leaving it unset now collects cookies, request/response bodies, user info,
 * DB query data and AI inputs/outputs by default. This object keeps the v10
 * default (`sendDefaultPii` off). Loosen individual categories deliberately.
 *
 * @see https://github.com/getsentry/sentry-javascript/blob/develop/MIGRATION.md#senddefaultpii-is-replaced-by-datacollection
 */
import type * as Sentry from "@sentry/nextjs"

type DataCollection = NonNullable<
  NonNullable<Parameters<typeof Sentry.init>[0]>["dataCollection"]
>

const PII_HEADER_DENYLIST = ["forwarded", "-ip", "remote-", "via", "-user"]

export const sentryDataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: { deny: PII_HEADER_DENYLIST },
    response: { deny: PII_HEADER_DENYLIST },
  },
  httpBodies: [],
  urlQueryParams: { deny: PII_HEADER_DENYLIST },
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  graphQL: { document: false, variables: false },
} satisfies DataCollection
