# Next.js Cache Revalidation + Optional CDN Purge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Strapi-driven Next.js cache revalidation feature (plus an optional, plug-and-play CDN purge feature) from `yale/website-and-portal` into this starter, adapted to the starter's leaner conventions.

**Architecture:** On Strapi write, a Document Service middleware (and the hierarchy job runner) calls the `api::revalidate.revalidate` service, which POSTs to the UI `/api/strapi-revalidate` route to run `revalidatePath`/`revalidateTag`. Operators force CDN eviction via an admin "CDN cache" widget → Strapi `/api/revalidate/cdn-purge` → UI `/api/cdn-purge` → a resolved CDN provider. CDN providers are gated like the Entra SSO example: `resolveCdnProvider()` returns `null` (inert) until env is set; Azure Front Door is the bundled example provider.

**Tech Stack:** Strapi 5.46, Next.js 16.2.6, TypeScript, Vitest 4.1.5, Zod 4, `@repo/shared-data`.

**Source repo (read-only reference):** `/Users/tocosastalo/dev/notum/yale/website-and-portal` — referred to below as `$SRC`.
**This repo:** `/Users/tocosastalo/dev/notum/notum/notum-dev-templates` — referred to as `$DST`.

**Key adaptations vs. source (the source is a heavier fork):**

- The source imports `logger`/`logError`/`withSpan` from an OTel-backed `@repo/logging` package that does **not** exist here. We add thin local shims (`strapi.log` / `console`, `withSpan` = run-the-fn) so ported files keep their imports unchanged.
- The source imports `validateAdminToken` from a shared util; here it lives inline in the internal-job controller. We extract it to a shared util.
- The destination's `internal-job` `runAll` has no path-aggregation hook (Yale's does). We make the two hierarchy job handlers return their touched path(s) and aggregate in `runAll`.
- `REVALIDATE_COLLECTIONS` is trimmed to this starter's real content types: `page`, `redirect`, `navbar`, `footer`. No Greenhouse/application/team/committee/cookie-banner/not-found types.
- `zod` must be added to `apps/strapi/package.json` (not currently a dep).

**Commit convention:** Conventional Commits. End each commit body with the Co-Authored-By trailer used in this repo.

---

## Phase 0 — Shared utilities (prerequisites)

### Task 1: Add `zod` to Strapi and create the Strapi logging shim

**Files:**

- Modify: `apps/strapi/package.json` (dependencies)
- Create: `apps/strapi/src/utils/logging.ts`

- [ ] **Step 1: Add the `zod` dependency**

In `apps/strapi/package.json`, add to `"dependencies"` (alphabetical placement near other deps), matching the UI's pin:

```json
"zod": "4.4.3"
```

- [ ] **Step 2: Install**

Run from `$DST`: `pnpm install`
Expected: lockfile updates, `apps/strapi/node_modules/zod` exists.

- [ ] **Step 3: Create the logging shim**

Create `apps/strapi/src/utils/logging.ts`:

```ts
/**
 * Minimal logging helpers for custom Strapi server code. Delegates to the
 * global `strapi.log` (Pino) when available and degrades to no-ops in unit
 * tests that do not stub `strapi`. `withSpan` is a transparent wrapper kept
 * for call-site compatibility; this starter does not ship OpenTelemetry.
 */
type LogContext = Record<string, unknown>

const strapiLog = ():
  | Record<string, (...args: unknown[]) => void>
  | undefined =>
  (
    globalThis as {
      strapi?: { log?: Record<string, (...a: unknown[]) => void> }
    }
  ).strapi?.log

export const logger = {
  debug: (message: string, context?: LogContext) =>
    strapiLog()?.debug?.(message, context),
  info: (message: string, context?: LogContext) =>
    strapiLog()?.info?.(message, context),
  warn: (message: string, context?: LogContext) =>
    strapiLog()?.warn?.(message, context),
  error: (message: string, context?: LogContext) =>
    strapiLog()?.error?.(message, context),
}

/**
 * Logs an error with normalized name/message fields. Use in catch blocks.
 */
export const logError = (
  error: unknown,
  message: string,
  context?: LogContext
) => {
  const normalized =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { message: String(error) }

  strapiLog()?.error?.(message, { ...context, error: normalized })
}

/**
 * Runs `fn` directly. Present for call-site compatibility with the source
 * project's tracing helper; spans are a no-op in this starter.
 */
export const withSpan = <T>(
  _name: string,
  fn: () => Promise<T> | T,
  _attributes?: LogContext
): Promise<T> | T => fn()
```

- [ ] **Step 4: Typecheck**

Run from `$DST`: `pnpm -F @repo/strapi exec tsc --noEmit`
Expected: PASS (no errors from the new file).

- [ ] **Step 5: Commit**

```bash
git add apps/strapi/package.json pnpm-lock.yaml apps/strapi/src/utils/logging.ts
git commit -m "feat(strapi): add zod dep and logging helper shim for revalidation"
```

---

### Task 2: Extract the shared `validate-admin-token` util

**Files:**

- Create: `apps/strapi/src/utils/validate-admin-token.ts`

- [ ] **Step 1: Create the util** (verbatim from `$SRC/apps/strapi/src/utils/validate-admin-token.ts`)

Create `apps/strapi/src/utils/validate-admin-token.ts`:

```ts
import type { Core } from "@strapi/strapi"
import jwt from "jsonwebtoken"

type ValidationResult =
  | { valid: true; userId: string }
  | { valid: false; error: string }

type HeadersLike = Record<string, string | string[] | undefined>

export const validateAdminToken = (
  strapi: Core.Strapi,
  headers: HeadersLike
): ValidationResult => {
  const authHeader = headers.authorization
  const authHeaderValue = Array.isArray(authHeader) ? authHeader[0] : authHeader

  if (!authHeaderValue) {
    return { valid: false, error: "No token provided" }
  }

  const [scheme, token] = authHeaderValue.split(" ")

  if (scheme !== "Bearer" || !token) {
    return { valid: false, error: "Invalid authorization header" }
  }

  let decoded: { userId?: string }

  try {
    decoded = jwt.verify(token, strapi.config.get("admin.auth.secret")) as {
      userId?: string
    }
  } catch {
    return { valid: false, error: "Invalid token" }
  }

  if (!decoded?.userId) {
    return { valid: false, error: "Invalid token" }
  }

  return { valid: true, userId: decoded.userId }
}
```

- [ ] **Step 2: Typecheck**

Run from `$DST`: `pnpm -F @repo/strapi exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/strapi/src/utils/validate-admin-token.ts
git commit -m "feat(strapi): add shared validate-admin-token util"
```

---

### Task 3: Add `logger`/`logError`/`withSpan` to the UI logging module

**Files:**

- Modify: `apps/ui/src/lib/logging.ts`

- [ ] **Step 1: Append the helpers**

Add to the end of `apps/ui/src/lib/logging.ts` (keep the existing `logNonBlockingError`):

```ts
type LogContext = Record<string, unknown>

/**
 * Lightweight structured logger for UI server code (route handlers, lib).
 * Mirrors the helper surface the revalidation/CDN code expects.
 */
export const logger = {
  debug: (message: string, context?: LogContext) =>
    console.debug(message, context),
  info: (message: string, context?: LogContext) =>
    console.info(message, context),
  warn: (message: string, context?: LogContext) =>
    console.warn(message, context),
  error: (message: string, context?: LogContext) =>
    console.error(message, context),
}

/**
 * Logs an error with normalized fields. Use in catch blocks.
 */
export const logError = (
  error: unknown,
  message: string,
  context?: LogContext
) => {
  const normalized =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { message: String(error) }

  console.error(message, { ...context, error: normalized })
}

/**
 * Runs `fn` directly. Present for call-site compatibility with the source
 * project's tracing helper; spans are a no-op in this starter.
 */
export const withSpan = <T>(
  _name: string,
  fn: () => Promise<T> | T,
  _attributes?: LogContext
): Promise<T> | T => fn()
```

- [ ] **Step 2: Typecheck**

Run from `$DST`: `pnpm -F @repo/ui exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/ui/src/lib/logging.ts
git commit -m "feat(ui): add logger/logError/withSpan helpers to logging module"
```

---

## Phase 1 — Strapi core revalidation API

> These four service/controller/route files are CDN/Yale-agnostic and port **verbatim** from `$SRC/apps/strapi/src/api/revalidate/`. Their imports (`../utils/logging`, `../../../utils/logging`, `../../../utils/validate-admin-token`, `@repo/shared-data`) all resolve after Phase 0. No content-type is needed — Strapi registers `src/api/<name>/{services,controllers,routes}` regardless.

### Task 4: Port the revalidate service files

**Files:**

- Create: `apps/strapi/src/api/revalidate/services/helpers.ts`
- Create: `apps/strapi/src/api/revalidate/services/next-cache.ts`
- Create: `apps/strapi/src/api/revalidate/services/cdn-cache.ts`
- Create: `apps/strapi/src/api/revalidate/services/revalidate.ts`

- [ ] **Step 1: Copy the four service files verbatim**

```bash
mkdir -p apps/strapi/src/api/revalidate/services
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/strapi/src/api/revalidate/services/helpers.ts   apps/strapi/src/api/revalidate/services/helpers.ts
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/strapi/src/api/revalidate/services/next-cache.ts apps/strapi/src/api/revalidate/services/next-cache.ts
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/strapi/src/api/revalidate/services/cdn-cache.ts  apps/strapi/src/api/revalidate/services/cdn-cache.ts
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/strapi/src/api/revalidate/services/revalidate.ts apps/strapi/src/api/revalidate/services/revalidate.ts
```

- [ ] **Step 2: Verify no Yale-only imports leaked**

Run: `grep -rn "greenhouse\|@repo/logging\|prospect\|application-" apps/strapi/src/api/revalidate/services/`
Expected: no matches. (Imports should only be `./helpers`, `./next-cache`, `../../../utils/logging`, `@repo/shared-data`, `@strapi/strapi`.)

- [ ] **Step 3: Typecheck**

Run from `$DST`: `pnpm -F @repo/strapi exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/strapi/src/api/revalidate/services
git commit -m "feat(strapi): add revalidate service (next-cache, cdn-cache, helpers)"
```

---

### Task 5: Port the revalidate controller + routes

**Files:**

- Create: `apps/strapi/src/api/revalidate/controllers/revalidate.ts`
- Create: `apps/strapi/src/api/revalidate/routes/revalidate.ts`

- [ ] **Step 1: Copy verbatim**

```bash
mkdir -p apps/strapi/src/api/revalidate/controllers apps/strapi/src/api/revalidate/routes
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/strapi/src/api/revalidate/controllers/revalidate.ts apps/strapi/src/api/revalidate/controllers/revalidate.ts
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/strapi/src/api/revalidate/routes/revalidate.ts       apps/strapi/src/api/revalidate/routes/revalidate.ts
```

The controller imports `../../../utils/validate-admin-token` (Task 2) and `../services/cdn-cache` (Task 4); both resolve. It uses the global `strapi` (typed by Strapi) — no import needed, matching the internal-job controller pattern.

- [ ] **Step 2: Typecheck**

Run from `$DST`: `pnpm -F @repo/strapi exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/strapi/src/api/revalidate/controllers apps/strapi/src/api/revalidate/routes
git commit -m "feat(strapi): add revalidate controller and routes"
```

---

## Phase 2 — Strapi document middleware

### Task 6: Port + trim the auto-revalidate document middleware and register it

**Files:**

- Create: `apps/strapi/src/documentMiddlewares/revalidate.ts`
- Modify: `apps/strapi/src/index.ts`

- [ ] **Step 1: Copy the middleware**

```bash
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/strapi/src/documentMiddlewares/revalidate.ts apps/strapi/src/documentMiddlewares/revalidate.ts
```

- [ ] **Step 2: Trim `REVALIDATE_COLLECTIONS` to this starter's content types**

In `apps/strapi/src/documentMiddlewares/revalidate.ts`, replace the entire `REVALIDATE_COLLECTIONS` array with:

```ts
const REVALIDATE_COLLECTIONS: RevalidateCollectionConfig[] = [
  {
    uid: "api::page.page",
    mode: "path-revalidate",
    pathField: "fullPath",
  },
  { uid: "api::navbar.navbar", mode: "tag-revalidate" },
  { uid: "api::footer.footer", mode: "tag-revalidate" },
  {
    uid: "api::redirect.redirect",
    mode: "path-revalidate",
    pathField: "source",
  },
  // Add your own collections here, e.g.:
  // { uid: "api::blog-article.blog-article", mode: "path-revalidate", pathField: "fullPath" },
  // { uid: "api::announcement.announcement", mode: "tag-revalidate" },
]
```

- [ ] **Step 3: Register the middleware in bootstrap**

In `apps/strapi/src/index.ts`, add the import next to the existing `registerPopulatePageMiddleware` import:

```ts
import { registerAutoRevalidateMiddleware } from "./documentMiddlewares/revalidate"
```

And in the `bootstrap({ strapi })` body, after `registerPopulatePageMiddleware({ strapi })`, add:

```ts
registerAutoRevalidateMiddleware({ strapi })
```

- [ ] **Step 4: Typecheck**

Run from `$DST`: `pnpm -F @repo/strapi exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/strapi/src/documentMiddlewares/revalidate.ts apps/strapi/src/index.ts
git commit -m "feat(strapi): auto-revalidate document middleware for page/redirect/navbar/footer"
```

---

### Task 7: Port the Strapi revalidate + cdn-cache unit tests

**Files:**

- Create: `apps/strapi/tests/revalidate.test.ts`
- Create: `apps/strapi/tests/cdn-cache.test.ts`

- [ ] **Step 1: Copy both test files**

```bash
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/strapi/tests/revalidate.test.ts apps/strapi/tests/revalidate.test.ts
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/strapi/tests/cdn-cache.test.ts  apps/strapi/tests/cdn-cache.test.ts
```

These tests stub `strapi.log` and the global `fetch`, which is exactly what the Phase 0 logging shim reads — no edits needed. `revalidate.test.ts` exercises both the service and the middleware (`buildMiddleware`) and uses only `api::page.page`, `api::navbar.navbar`, `api::committee.committee`, `api::redirect.redirect` UIDs. The middleware does not validate the UID against `REVALIDATE_COLLECTIONS` for the `api::committee.committee` case **only inside the service** (it builds the tag directly), so the service test passes without `committee` being in the trimmed config.

> Note: `revalidate.test.ts` has a case `"sends only the matching collection tag for non-page entities"` using `api::committee.committee` directly against the **service** (not the middleware), so the trimmed `REVALIDATE_COLLECTIONS` does not affect it. Leave the test UID as-is.

- [ ] **Step 2: Run the tests**

Run from `$DST`: `pnpm -F @repo/strapi exec vitest run tests/revalidate.test.ts tests/cdn-cache.test.ts`
Expected: PASS — all `revalidate service`, `auto revalidate document middleware`, and `purgeCDNCache` cases green.

- [ ] **Step 3: Commit**

```bash
git add apps/strapi/tests/revalidate.test.ts apps/strapi/tests/cdn-cache.test.ts
git commit -m "test(strapi): add revalidate service, middleware, and cdn-cache tests"
```

---

## Phase 3 — internal-job batch revalidation

> The hierarchy job runner recalculates page `fullPath`s and creates redirects writing `updatedBy: null`, which the document middleware deliberately skips. So we revalidate from the job runner instead. The destination's `runAll` has no aggregation hook, so we make the two handlers return their touched path(s) and aggregate in `runAll`.

### Task 8: Make hierarchy handlers return touched paths

**Files:**

- Modify: `apps/strapi/src/utils/hierarchy/index.ts`

- [ ] **Step 1: Return the touched fullPath from `processRecalculateFullPathJob`**

In `apps/strapi/src/utils/hierarchy/index.ts`, the function currently returns nothing. Add an explicit return type and return the touched path/locale when the path actually changed.

Change the signature line:

```ts
export const processRecalculateFullPathJob = async (
  job: Data.ContentType<"api::internal-job.internal-job">
): Promise<{ fullPath: string; locale: string } | undefined> => {
```

Inside the `if (newFullPath !== oldFullPath) { ... }` block, after the children-enqueue loop completes (still inside the `if`), the function continues to the redirect logic. To return the touched path, add a local accumulator: declare `let touched: { fullPath: string; locale: string } | undefined` near the top (after `const newFullPath = ...`), set `touched = { fullPath: newFullPath, locale: targetLocale }` inside the `if (newFullPath !== oldFullPath)` block, and `return touched` at the very end of the function (replacing the implicit end). For the early returns at the guard clauses (`jobType !== "RECALCULATE_FULLPATH"` and `!document`), change `return` to `return undefined`.

Concretely:

- Line `if (jobType !== "RECALCULATE_FULLPATH") { return }` → `return undefined`
- Line `if (!document) { return }` → `return undefined`
- After `const newFullPath = normalizePageFullPath([...])` add: `let touched: { fullPath: string; locale: string } | undefined`
- Inside `if (newFullPath !== oldFullPath) {` (first line of the block) add: `touched = { fullPath: newFullPath, locale: targetLocale }`
- At the end of the function body add: `return touched`

- [ ] **Step 2: Return the source from `processCreateRedirectJob`**

Change the signature:

```ts
export const processCreateRedirectJob = async (
  job: Data.ContentType<"api::internal-job.internal-job">
): Promise<{ source: string } | undefined> => {
```

Change the guard `return`s (`jobType !== "CREATE_REDIRECT"`, `!payload`) to `return undefined`. After the `strapi.documents("api::redirect.redirect").create({ ... })` call, add:

```ts
return { source: payload.oldPath }
```

- [ ] **Step 3: Typecheck**

Run from `$DST`: `pnpm -F @repo/strapi exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/strapi/src/utils/hierarchy/index.ts
git commit -m "feat(strapi): hierarchy job handlers return touched paths for revalidation"
```

---

### Task 9: Aggregate touched paths in `runAll` and revalidate

**Files:**

- Modify: `apps/strapi/src/api/internal-job/services/internal-job.ts`
- Test: `apps/strapi/tests/internal-job-revalidate.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/strapi/tests/internal-job-revalidate.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest"

import serviceFactory from "../src/api/internal-job/services/internal-job"

// Stub the hierarchy handlers so runAll's aggregation is what we test.
const { recalcMock, redirectMock } = vi.hoisted(() => ({
  recalcMock: vi.fn(),
  redirectMock: vi.fn(),
}))

vi.mock("../src/utils/hierarchy", () => ({
  processRecalculateFullPathJob: recalcMock,
  processCreateRedirectJob: redirectMock,
}))

const buildService = (runMock: ReturnType<typeof vi.fn>) => {
  const jobs = [
    { documentId: "j1", id: 1, jobType: "RECALCULATE_FULLPATH" },
    { documentId: "j2", id: 2, jobType: "RECALCULATE_FULLPATH" },
  ]
  let index = 0

  const strapiMock = {
    documents: vi.fn(() => ({
      findFirst: vi.fn(async () => jobs[index] ?? null),
      delete: vi.fn(async () => {
        index += 1
      }),
      update: vi.fn(),
    })),
    service: vi.fn(() => ({ run: runMock })),
    log: { info: vi.fn(), error: vi.fn() },
  }

  vi.stubGlobal("strapi", strapiMock as never)

  // factories.createCoreService passes ({ strapi }); call the factory body.
  const factory = serviceFactory as unknown as (args: {
    strapi: unknown
  }) => Record<string, (...a: unknown[]) => Promise<unknown>>

  return factory({ strapi: strapiMock })
}

describe("internal-job runAll revalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it("revalidates aggregated fullpaths after a RECALCULATE_FULLPATH batch", async () => {
    recalcMock
      .mockResolvedValueOnce({ fullPath: "/parent", locale: "en" })
      .mockResolvedValueOnce({ fullPath: "/parent/child", locale: "en" })
    const runMock = vi.fn().mockResolvedValue({})

    const service = buildService(runMock)
    await service.runAll("RECALCULATE_FULLPATH")

    expect(runMock).toHaveBeenCalledWith({
      uid: "api::page.page",
      locale: "en",
      fullPaths: ["/parent", "/parent/child"],
    })
  })
})
```

> `factories.createCoreService` returns a function `({ strapi }) => methods`. The test calls that factory directly with a mock `strapi`. If the default export is not directly callable in this Strapi version, adapt by invoking `serviceFactory().` — verify against the actual export shape in Step 2.

- [ ] **Step 2: Run it to confirm failure**

Run from `$DST`: `pnpm -F @repo/strapi exec vitest run tests/internal-job-revalidate.test.ts`
Expected: FAIL — `run` is not called with aggregated paths (current `runAll` ignores handler return values).

- [ ] **Step 3: Implement aggregation in `runAll`**

In `apps/strapi/src/api/internal-job/services/internal-job.ts`, rewrite the `runAll` method to collect handler return values and revalidate per batch. Replace the existing `runAll` body with:

```ts
    async runAll(
      jobType: Data.ContentType<"api::internal-job.internal-job">["jobType"]
    ) {
      const handlers = this.getJobHandlers()
      const successfulJobs: string[] = []
      const failedJobs: string[] = []

      // Aggregate touched paths so the frontend cache is revalidated once per
      // batch. Hierarchy jobs write `updatedBy: null`, which the auto-revalidate
      // document middleware skips, so we revalidate here instead.
      const fullPathsByLocale = new Map<string, Set<string>>()
      const redirectSources = new Set<string>()

      let job = await this.getNextJob(jobType)

      while (job != null) {
        try {
          const result = await handlers[jobType](job)
          await this.removeJob(job.documentId)

          successfulJobs.push(job.documentId)

          if (result && typeof result === "object") {
            const fullPath = (result as { fullPath?: unknown }).fullPath
            const locale = (result as { locale?: unknown }).locale
            const source = (result as { source?: unknown }).source

            if (typeof fullPath === "string" && typeof locale === "string") {
              const set = fullPathsByLocale.get(locale) ?? new Set<string>()
              set.add(fullPath)
              fullPathsByLocale.set(locale, set)
            }

            if (typeof source === "string") {
              redirectSources.add(source)
            }
          }

          strapi.log.info(`Job ${jobType} (${job.id}) completed`)
        } catch (error) {
          await this.updateJobStatus(job.documentId, "failed", error.message)
          failedJobs.push(job.documentId)

          strapi.log.error(
            `Job ${jobType} (${job.id}) failed: ${error.message}`
          )
        }

        job = await this.getNextJob(jobType)
      }

      const revalidateService = strapi.service("api::revalidate.revalidate")

      try {
        for (const [locale, paths] of fullPathsByLocale) {
          if (paths.size === 0) {
            continue
          }

          await revalidateService.run({
            uid: "api::page.page",
            locale,
            fullPaths: [...paths],
          })
        }

        if (redirectSources.size > 0) {
          await revalidateService.run({
            uid: "api::redirect.redirect",
            fullPaths: [...redirectSources],
          })
        }
      } catch (error) {
        strapi.log.error(
          `Revalidation after ${jobType} batch failed: ${(error as Error).message}`
        )
      }

      return {
        successfulJobs,
        failedJobs,
      }
    },
```

- [ ] **Step 4: Run the test**

Run from `$DST`: `pnpm -F @repo/strapi exec vitest run tests/internal-job-revalidate.test.ts`
Expected: PASS. If the factory-invocation note in Step 1 applies, adjust the test's factory call and re-run.

- [ ] **Step 5: Typecheck + full strapi test run**

Run: `pnpm -F @repo/strapi exec tsc --noEmit && pnpm -F @repo/strapi test`
Expected: PASS (existing `app.test.ts` + new tests).

- [ ] **Step 6: Commit**

```bash
git add apps/strapi/src/api/internal-job/services/internal-job.ts apps/strapi/tests/internal-job-revalidate.test.ts
git commit -m "feat(strapi): revalidate aggregated paths after hierarchy job batches"
```

---

## Phase 4 — Strapi admin UI

### Task 10: Port the DataRevalidate edit-view button

**Files:**

- Create: `apps/strapi/src/admin/extensions/DataRevalidate/index.tsx`
- Create: `apps/strapi/src/admin/extensions/DataRevalidate/DataRevalidateButton.tsx`
- Modify: `apps/strapi/src/admin/app.tsx`

- [ ] **Step 1: Copy the extension verbatim**

```bash
mkdir -p apps/strapi/src/admin/extensions/DataRevalidate
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/strapi/src/admin/extensions/DataRevalidate/index.tsx              apps/strapi/src/admin/extensions/DataRevalidate/index.tsx
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/strapi/src/admin/extensions/DataRevalidate/DataRevalidateButton.tsx apps/strapi/src/admin/extensions/DataRevalidate/DataRevalidateButton.tsx
```

The button already targets only `api::page.page`, `api::navbar.navbar`, `api::footer.footer` — all present in this starter. No edits needed.

- [ ] **Step 2: Register the inject in `app.tsx`**

In `apps/strapi/src/admin/app.tsx`, add the import near the other extension imports:

```ts
import DataRevalidate from "./extensions/DataRevalidate"
```

In `bootstrap(app)`, after the existing `injectComponent("listView", "actions", …)` call, add:

```ts
app.getPlugin("content-manager").injectComponent("editView", "right-links", {
  name: "DataRevalidate",
  Component: DataRevalidate,
})
```

- [ ] **Step 3: Typecheck**

Run from `$DST`: `pnpm -F @repo/strapi exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/strapi/src/admin/extensions/DataRevalidate apps/strapi/src/admin/app.tsx
git commit -m "feat(strapi): add Revalidate cache button to edit view"
```

---

### Task 11: Port + genericize the CDN cache widget

**Files:**

- Create: `apps/strapi/src/admin/widgets/CdnCacheWidget/index.tsx`
- Modify: `apps/strapi/src/admin/app.tsx`

- [ ] **Step 1: Create the widget (genericized from `FrontDoorCacheWidget`)**

Create `apps/strapi/src/admin/widgets/CdnCacheWidget/index.tsx` with the source widget's logic but provider-neutral wording. Use this full content:

```tsx
import {
  Box,
  Button,
  Field,
  Flex,
  Radio,
  Textarea,
  Typography,
} from "@strapi/design-system"
import { Cloud } from "@strapi/icons"
import { getFetchClient, useNotification } from "@strapi/strapi/admin"
import { useState } from "react"

type PurgeMode = "all" | "specific"

const WILDCARD_PATH = "/*"

const DEFAULT_ERROR_MESSAGE =
  "Failed to submit purge. Check Strapi logs for details and try again."

/**
 * `getFetchClient` throws a `FetchError` whose `message` is set from the upstream
 * response's `error.message` field. The Strapi controller emits the standard
 * envelope (`{ error: { message } }`) on purge failure, so the widget can show
 * the actual upstream reason instead of a generic message.
 */
function extractPurgeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    if (
      error.message === "Server Error" ||
      error.message === "Unknown Server Error"
    ) {
      return DEFAULT_ERROR_MESSAGE
    }

    return error.message
  }

  return DEFAULT_ERROR_MESSAGE
}

function CdnCacheWidget() {
  const [mode, setMode] = useState<PurgeMode>("specific")
  const [pathsInput, setPathsInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { post } = getFetchClient()
  const { toggleNotification } = useNotification()

  const submit = async () => {
    if (isLoading) {
      return
    }

    const paths =
      mode === "all"
        ? [WILDCARD_PATH]
        : pathsInput
            .split("\n")
            .map((path) => path.trim())
            .filter((path) => path.length > 0)

    if (paths.length === 0) {
      toggleNotification({
        type: "warning",
        message: "Enter at least one path before submitting.",
      })

      return
    }

    if (mode === "all") {
      const confirmed = window.confirm(
        "Purge the entire site from the CDN? This forces every cached page to refetch from origin and should only be used for incidents."
      )

      if (!confirmed) {
        return
      }
    }

    setIsLoading(true)

    try {
      await post("/api/revalidate/cdn-purge", { paths })
      toggleNotification({
        type: "success",
        message:
          "Purge submitted. CDN propagation can take several minutes globally.",
      })

      if (mode === "specific") {
        setPathsInput("")
      }
    } catch (error) {
      console.error("CDN purge failed:", error)
      toggleNotification({
        type: "danger",
        message: extractPurgeErrorMessage(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box padding={4}>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Typography variant="omega">
          Submit specific paths or the entire site to the configured CDN for
          cache eviction. Use this for hot fixes, takedowns, or any change that
          must be live before the page&apos;s normal cache window refreshes.
        </Typography>

        <Typography variant="pi" textColor="neutral600">
          Requires a configured CDN provider. CDN purges can take several
          minutes to propagate globally.
        </Typography>

        <Field.Root>
          <Field.Label>Scope</Field.Label>
          <Radio.Group
            value={mode}
            onValueChange={(value: string) => setMode(value as PurgeMode)}
          >
            <Flex direction="column" alignItems="flex-start" gap={2}>
              <Flex tag="label" gap={2} alignItems="center">
                <Radio.Item value="specific" />
                <Typography>Specific paths</Typography>
              </Flex>
              <Flex tag="label" gap={2} alignItems="center">
                <Radio.Item value="all" />
                <Typography>Entire site ({WILDCARD_PATH})</Typography>
              </Flex>
            </Flex>
          </Radio.Group>
        </Field.Root>

        {mode === "specific" && (
          <Field.Root>
            <Field.Label>Paths to purge</Field.Label>
            <Field.Hint>
              One path per line. Use a leading slash. Wildcards are allowed:{" "}
              <code>/blog/*</code>.
            </Field.Hint>
            <Textarea
              value={pathsInput}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setPathsInput(event.target.value)
              }
              placeholder={"/about\n/blog/*\n/contact"}
              rows={5}
              aria-label="Paths to purge"
            />
          </Field.Root>
        )}

        <Flex justifyContent="flex-end">
          <Button
            variant="danger-light"
            onClick={submit}
            loading={isLoading}
            disabled={isLoading}
            startIcon={<Cloud />}
          >
            Purge CDN cache
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

export default CdnCacheWidget
```

- [ ] **Step 2: Register the widget in `app.tsx`**

In `apps/strapi/src/admin/app.tsx` `bootstrap(app)`, add:

```ts
app.widgets.register({
  icon: Cloud,
  title: {
    id: "cdn-cache.widget.title",
    defaultMessage: "CDN cache",
  },
  component: async () => {
    const component = await import("./widgets/CdnCacheWidget")
    return component.default
  },
  id: "cdn-cache",
  pluginId: "content-manager",
})
```

Add the icon import at the top of `app.tsx`:

```ts
import { Cloud } from "@strapi/icons"
```

> Verify the exact `app.widgets.register` argument shape against Strapi 5.46's admin types during Step 3; if `pluginId` is rejected, omit it. The `component` loader may return the module or the default export depending on version — adjust to whichever typechecks.

- [ ] **Step 3: Typecheck**

Run from `$DST`: `pnpm -F @repo/strapi exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/strapi/src/admin/widgets/CdnCacheWidget apps/strapi/src/admin/app.tsx
git commit -m "feat(strapi): add CDN cache purge homepage widget"
```

---

## Phase 5 — Strapi env

### Task 12: Document the revalidation secret in Strapi env

**Files:**

- Modify: `apps/strapi/.env.example`

- [ ] **Step 1: Add the secret**

Append to `apps/strapi/.env.example` (under a clear comment; `CLIENT_URL` already exists in this file — confirm and reuse it):

```bash
# Shared secret authenticating cache revalidation + CDN purge requests sent
# from Strapi to the Next.js UI. Must match STRAPI_REVALIDATE_SECRET in apps/ui.
STRAPI_REVALIDATE_SECRET=
```

- [ ] **Step 2: Verify `CLIENT_URL` is present**

Run: `grep -n "CLIENT_URL" apps/strapi/.env.example`
Expected: a match. If absent, add `CLIENT_URL=http://localhost:3000` with a comment.

- [ ] **Step 3: Commit**

```bash
git add apps/strapi/.env.example
git commit -m "docs(strapi): document STRAPI_REVALIDATE_SECRET env var"
```

---

## Phase 6 — UI

### Task 13: Port `cache-paths.ts` + its test

**Files:**

- Create: `apps/ui/src/lib/cache-paths.ts`
- Create: `apps/ui/src/lib/cache-paths.test.ts`

- [ ] **Step 1: Copy both files verbatim**

```bash
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/ui/src/lib/cache-paths.ts      apps/ui/src/lib/cache-paths.ts
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/ui/src/lib/cache-paths.test.ts apps/ui/src/lib/cache-paths.test.ts
```

`cache-paths.ts` imports `@repo/shared-data` (`normalizePageFullPath`, present) and `@/lib/navigation` (`routing.defaultLocale`, present, = `"en"`). The test mocks `@/lib/navigation`.

- [ ] **Step 2: Run the test**

Run from `$DST`: `pnpm -F @repo/ui exec vitest run src/lib/cache-paths.test.ts`
Expected: PASS — all five variant-expansion cases green.

- [ ] **Step 3: Commit**

```bash
git add apps/ui/src/lib/cache-paths.ts apps/ui/src/lib/cache-paths.test.ts
git commit -m "feat(ui): add cache-paths default-locale variant helper"
```

---

### Task 14: Build the CDN provider registry (Azure Front Door = example provider)

**Files:**

- Create: `apps/ui/src/lib/cdn/types.ts`
- Create: `apps/ui/src/lib/cdn/providers/azure-front-door.ts`
- Create: `apps/ui/src/lib/cdn/index.ts`
- Test: `apps/ui/src/lib/cdn/index.test.ts`

- [ ] **Step 1: Create the provider interface**

Create `apps/ui/src/lib/cdn/types.ts`:

```ts
/**
 * Result of a CDN purge attempt. `ok: false` carries a human-readable
 * `reason` that Strapi surfaces to the editor in the purge widget.
 */
export type CdnPurgeOutcome = {
  ok: boolean
  reason?: string
}

/**
 * A pluggable CDN purge provider. Implement one of these per CDN and register
 * it in `resolveCdnProvider()`. Azure Front Door ships as the example provider.
 */
export type CdnPurgeProvider = {
  name: string
  purge: (paths: string[]) => Promise<CdnPurgeOutcome>
}
```

- [ ] **Step 2: Create the Azure Front Door provider (ported from `front-door.ts`)**

Create `apps/ui/src/lib/cdn/providers/azure-front-door.ts`. Port `$SRC/apps/ui/src/lib/front-door.ts`, wrapping it as an env-gated factory that returns `null` when its `AZURE_*` vars are unset (the Entra-SSO pattern). Full content:

```ts
/**
 * Azure Front Door CDN purge provider — the bundled example of a pluggable
 * CDN provider. Auth uses the Container App's user-assigned managed identity
 * (IMDS token endpoint), so no secrets are stored in the app.
 *
 * Returns `null` from the factory when any required AZURE_* env var is unset,
 * so the feature is inert until configured — mirroring the optional Microsoft
 * Entra SSO provider in apps/strapi/config/auth-providers.ts.
 */
import { getEnvVar } from "@/lib/env-vars"
import { logError, logger, withSpan } from "@/lib/logging"

import type { CdnPurgeOutcome, CdnPurgeProvider } from "../types"

const ARM_RESOURCE = "https://management.azure.com/"
const ARM_API_VERSION = "2024-02-01"
const UI_ENDPOINT_NAME = "ui"

interface ImdsTokenResponse {
  access_token: string
  expires_on: string
  resource: string
  token_type: string
}

let cachedToken: { value: string; expiresAt: number } | null = null

async function getArmToken(clientId: string): Promise<string | null> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value
  }

  const imdsEndpoint = getEnvVar("IDENTITY_ENDPOINT")
  const imdsHeader = getEnvVar("IDENTITY_HEADER")
  if (!imdsEndpoint || !imdsHeader) {
    logger.error("CDN purge skipped because managed identity is missing")

    return null
  }

  const url = new URL(imdsEndpoint)
  url.searchParams.set("api-version", "2019-08-01")
  url.searchParams.set("resource", ARM_RESOURCE)
  url.searchParams.set("client_id", clientId)

  const res = await fetch(url.toString(), {
    headers: { "X-IDENTITY-HEADER": imdsHeader },
  })

  if (!res.ok) {
    const body = await res.text()
    logger.error("CDN IMDS token request failed", { status: res.status, body })

    return null
  }

  const data = (await res.json()) as ImdsTokenResponse
  const expiresAtMs = Number(data.expires_on) * 1000 - 60_000
  cachedToken = { value: data.access_token, expiresAt: expiresAtMs }

  return data.access_token
}

type AzureConfig = {
  subscriptionId: string
  resourceGroup: string
  profileName: string
  miClientId: string
}

async function purgeAzureFrontDoor(
  contentPaths: string[],
  config: AzureConfig
): Promise<CdnPurgeOutcome> {
  return withSpan(
    "cdn.azure-front-door.purge",
    async () => {
      if (contentPaths.length === 0) {
        return { ok: false, reason: "No paths to purge." }
      }

      try {
        const token = await getArmToken(config.miClientId)
        if (!token) {
          return {
            ok: false,
            reason: "Could not obtain managed identity token for the CDN.",
          }
        }

        const purgeUrl =
          `https://management.azure.com/subscriptions/${config.subscriptionId}` +
          `/resourceGroups/${config.resourceGroup}` +
          `/providers/Microsoft.Cdn/profiles/${config.profileName}` +
          `/afdEndpoints/${UI_ENDPOINT_NAME}/purge` +
          `?api-version=${ARM_API_VERSION}`

        const res = await fetch(purgeUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ contentPaths }),
        })

        // AFD purge is async; 202 Accepted is the success response.
        if (res.status !== 202 && !res.ok) {
          const body = await res.text()
          logger.error("CDN purge failed", {
            status: res.status,
            body,
            contentPaths,
          })

          return {
            ok: false,
            reason: `Azure Front Door rejected the purge with status ${res.status}.`,
          }
        }

        logger.info("CDN purge submitted", { contentPaths })

        return { ok: true }
      } catch (err) {
        logError(err, "CDN purge error", { contentPaths })

        return {
          ok: false,
          reason:
            err instanceof Error && err.message
              ? `CDN purge threw: ${err.message}`
              : "CDN purge threw an unknown error.",
        }
      }
    },
    { "cdn.contentPathCount": contentPaths.length }
  )
}

/**
 * Returns an Azure Front Door purge provider, or `null` when any required
 * AZURE_* env var is unset (local/dev or non-Azure deployments).
 */
export function azureFrontDoorProvider(): CdnPurgeProvider | null {
  const subscriptionId = getEnvVar("AZURE_SUBSCRIPTION_ID")
  const resourceGroup = getEnvVar("AZURE_RESOURCE_GROUP")
  const profileName = getEnvVar("AZURE_FRONT_DOOR_PROFILE")
  const miClientId = getEnvVar("AZURE_MI_CLIENT_ID")

  if (!subscriptionId || !resourceGroup || !profileName || !miClientId) {
    return null
  }

  const config: AzureConfig = {
    subscriptionId,
    resourceGroup,
    profileName,
    miClientId,
  }

  return {
    name: "azure-front-door",
    purge: (paths) => purgeAzureFrontDoor(paths, config),
  }
}
```

- [ ] **Step 3: Create the resolver + convenience purge fn**

Create `apps/ui/src/lib/cdn/index.ts`:

```ts
import { logger } from "@/lib/logging"

import { azureFrontDoorProvider } from "./providers/azure-front-door"
import type { CdnPurgeOutcome, CdnPurgeProvider } from "./types"

export type { CdnPurgeOutcome, CdnPurgeProvider } from "./types"

/**
 * Resolves the active CDN purge provider, or `null` when none is configured.
 * Add new providers to this list; the first configured one wins. A provider
 * returns `null` from its factory until its env vars are set, so the CDN purge
 * feature stays inert by default — like the optional Entra SSO provider.
 */
export function resolveCdnProvider(): CdnPurgeProvider | null {
  const providers = [azureFrontDoorProvider()]

  return (
    providers.find((provider): provider is CdnPurgeProvider =>
      Boolean(provider)
    ) ?? null
  )
}

/**
 * Purges the given paths via the configured CDN provider. Returns an
 * informative outcome when no provider is configured (the purge route turns
 * this into a 502 with the reason so editors understand why nothing happened).
 */
export async function purgeCdnCache(paths: string[]): Promise<CdnPurgeOutcome> {
  const provider = resolveCdnProvider()

  if (!provider) {
    logger.info("CDN purge skipped because no provider is configured")

    return {
      ok: false,
      reason: "No CDN provider is configured for this environment.",
    }
  }

  return provider.purge(paths)
}
```

- [ ] **Step 4: Write the resolver test**

Create `apps/ui/src/lib/cdn/index.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest"

const { getEnvVarMock } = vi.hoisted(() => ({ getEnvVarMock: vi.fn() }))

vi.mock("@/lib/env-vars", () => ({ getEnvVar: getEnvVarMock }))

import { purgeCdnCache, resolveCdnProvider } from "./index"

describe("CDN provider registry", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns null when no AZURE_* vars are set", () => {
    getEnvVarMock.mockReturnValue(undefined)

    expect(resolveCdnProvider()).toBeNull()
  })

  it("purgeCdnCache reports an informative reason when unconfigured", async () => {
    getEnvVarMock.mockReturnValue(undefined)

    await expect(purgeCdnCache(["/about"])).resolves.toEqual({
      ok: false,
      reason: "No CDN provider is configured for this environment.",
    })
  })

  it("resolves the Azure provider when all AZURE_* vars are set", () => {
    getEnvVarMock.mockImplementation((key: string) =>
      key.startsWith("AZURE_") ? "value" : undefined
    )

    const provider = resolveCdnProvider()

    expect(provider?.name).toBe("azure-front-door")
  })
})
```

- [ ] **Step 5: Run the test**

Run from `$DST`: `pnpm -F @repo/ui exec vitest run src/lib/cdn/index.test.ts`
Expected: PASS.

- [ ] **Step 6: Typecheck + commit**

Run: `pnpm -F @repo/ui exec tsc --noEmit`
Expected: PASS.

```bash
git add apps/ui/src/lib/cdn
git commit -m "feat(ui): add pluggable CDN purge provider registry (Azure Front Door example)"
```

---

### Task 15: Port the `strapi-revalidate` route + test

**Files:**

- Create: `apps/ui/src/app/api/strapi-revalidate/route.ts`
- Create: `apps/ui/src/app/api/strapi-revalidate/route.test.ts`

- [ ] **Step 1: Copy both files verbatim**

```bash
mkdir -p apps/ui/src/app/api/strapi-revalidate
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/ui/src/app/api/strapi-revalidate/route.ts      apps/ui/src/app/api/strapi-revalidate/route.ts
cp /Users/tocosastalo/dev/notum/yale/website-and-portal/apps/ui/src/app/api/strapi-revalidate/route.test.ts apps/ui/src/app/api/strapi-revalidate/route.test.ts
```

The route imports `@repo/strapi-types` (present), `next/cache`, `zod` (present), `@/lib/cache-paths` (Task 13), `@/lib/env-vars`, `@/lib/logging` (Task 3). The test mocks `@/lib/env-vars`, `@/lib/navigation`, and `next/cache` — `@/lib/logging` runs for real (no-op console), so it must exist (Task 3).

- [ ] **Step 2: Run the test**

Run from `$DST`: `pnpm -F @repo/ui exec vitest run src/app/api/strapi-revalidate/route.test.ts`
Expected: PASS — 503/400/401/200/400 cases green, including the 4 `revalidatePath` variants and 2 `revalidateTag(_, "max")` calls.

- [ ] **Step 3: Commit**

```bash
git add apps/ui/src/app/api/strapi-revalidate
git commit -m "feat(ui): add /api/strapi-revalidate on-demand revalidation route"
```

---

### Task 16: Port the `cdn-purge` route (wired to the provider registry) + test

**Files:**

- Create: `apps/ui/src/app/api/cdn-purge/route.ts`
- Create: `apps/ui/src/app/api/cdn-purge/route.test.ts`

- [ ] **Step 1: Create the route wired to `@/lib/cdn`**

Create `apps/ui/src/app/api/cdn-purge/route.ts` (same as the source, but importing the provider registry instead of `@/lib/front-door`):

```ts
import { z } from "zod"

import { addDefaultLocalePathVariants } from "@/lib/cache-paths"
import { purgeCdnCache } from "@/lib/cdn"
import { getEnvVar } from "@/lib/env-vars"
import { logger, withSpan } from "@/lib/logging"

/**
 * CDN purge executor called by Strapi's CDN cache widget. Strapi stores
 * canonical paths, while CDNs cache concrete URL paths; expand default-locale
 * variants right before the purge call.
 */
export async function POST(request: Request) {
  return withSpan("cdn-purge.request", async () => {
    const revalidateSecret = getEnvVar("STRAPI_REVALIDATE_SECRET")
    if (!revalidateSecret) {
      return Response.json(
        { message: "Missing revalidation configuration." },
        { status: 503 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return Response.json({ message: "Invalid JSON body." }, { status: 400 })
    }

    const parsedBody = cdnPurgeRequestSchema.safeParse(body)
    if (!parsedBody.success) {
      return Response.json(
        { message: parsedBody.error.issues[0]?.message ?? "Invalid payload." },
        { status: 400 }
      )
    }

    const payload = parsedBody.data

    if (payload.secret !== revalidateSecret) {
      logger.warn("CDN purge rejected invalid token")

      return Response.json({ message: "Invalid token." }, { status: 401 })
    }

    const pathsToPurge = new Set<string>()
    addDefaultLocalePathVariants(pathsToPurge, payload.paths)

    logger.info("Purging CDN paths", { paths: [...pathsToPurge] })

    const outcome = await purgeCdnCache([...pathsToPurge])

    const responseBody = {
      purged: outcome.ok,
      paths: [...pathsToPurge],
      at: new Date().toISOString(),
      ...(outcome.reason ? { message: outcome.reason } : {}),
    }

    if (!outcome.ok) {
      return Response.json(responseBody, { status: 502 })
    }

    return Response.json(responseBody)
  })
}

const cdnPurgeRequestSchema = z.object({
  secret: z.string(),
  paths: z
    .array(z.string())
    .transform((paths) =>
      paths.map((path) => path.trim()).filter((path) => path.length > 0)
    )
    .refine((paths) => paths.length > 0, {
      message: "Provide at least one path.",
    }),
})
```

- [ ] **Step 2: Create the test (mocks `@/lib/cdn`)**

Create `apps/ui/src/app/api/cdn-purge/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest"

const { getEnvVarMock, purgeCdnCacheMock } = vi.hoisted(() => ({
  getEnvVarMock: vi.fn(),
  purgeCdnCacheMock: vi.fn(),
}))

vi.mock("@/lib/env-vars", () => ({
  getEnvVar: getEnvVarMock,
}))

vi.mock("@/lib/cdn", () => ({
  purgeCdnCache: purgeCdnCacheMock,
}))

vi.mock("@/lib/navigation", () => ({
  routing: {
    defaultLocale: "en",
  },
}))

import { POST } from "./route"

describe("POST /api/cdn-purge", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getEnvVarMock.mockReturnValue("test-secret")
    purgeCdnCacheMock.mockResolvedValue({ ok: true })
  })

  it("expands default-locale variants before purging", async () => {
    const response = await POST(
      new Request("http://localhost/api/cdn-purge", {
        method: "POST",
        body: JSON.stringify({ secret: "test-secret", paths: ["/about"] }),
      })
    )

    expect(response.status).toBe(200)
    expect(purgeCdnCacheMock).toHaveBeenCalledWith(["/en/about", "/about"])
    await expect(response.json()).resolves.toMatchObject({
      purged: true,
      paths: ["/en/about", "/about"],
      at: expect.any(String),
    })
  })

  it("rejects invalid secrets", async () => {
    const response = await POST(
      new Request("http://localhost/api/cdn-purge", {
        method: "POST",
        body: JSON.stringify({ secret: "wrong-secret", paths: ["/about"] }),
      })
    )

    expect(response.status).toBe(401)
    expect(purgeCdnCacheMock).not.toHaveBeenCalled()
  })

  it("returns 502 with the reason when the purge is not submitted", async () => {
    purgeCdnCacheMock.mockResolvedValue({
      ok: false,
      reason: "No CDN provider is configured for this environment.",
    })

    const response = await POST(
      new Request("http://localhost/api/cdn-purge", {
        method: "POST",
        body: JSON.stringify({ secret: "test-secret", paths: ["/about"] }),
      })
    )

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toMatchObject({
      purged: false,
      paths: ["/en/about", "/about"],
      message: "No CDN provider is configured for this environment.",
    })
  })
})
```

- [ ] **Step 3: Run the test**

Run from `$DST`: `pnpm -F @repo/ui exec vitest run src/app/api/cdn-purge/route.test.ts`
Expected: PASS.

- [ ] **Step 4: Typecheck + commit**

Run: `pnpm -F @repo/ui exec tsc --noEmit`
Expected: PASS.

```bash
git add apps/ui/src/app/api/cdn-purge
git commit -m "feat(ui): add /api/cdn-purge route backed by the CDN provider registry"
```

---

### Task 17: Add cache tags + revalidate intervals to content fetchers

**Files:**

- Modify: `apps/ui/src/lib/strapi-api/content/server.ts`

- [ ] **Step 1: Tag `fetchNavbar`**

In `apps/ui/src/lib/strapi-api/content/server.ts`, find `fetchNavbar` and set its fetch `next` options to revalidate every 10 minutes with the navbar tag. The function currently calls the public client; add/replace the `next` block so it reads:

```ts
        next: {
          revalidate: 600, // 10 minutes; tag-revalidated on Strapi publish
          tags: ["strapi:api::navbar.navbar"],
        },
```

(Match the existing call's argument position — the `next` object goes inside the `requestInit` argument passed to the client fetch method, mirroring how `fetchPage` passes `requestInit.next`.)

- [ ] **Step 2: Tag `fetchFooter`**

In `fetchFooter`, set:

```ts
        next: {
          revalidate: 600, // 10 minutes; tag-revalidated on Strapi publish
          tags: ["strapi:api::footer.footer"],
        },
```

- [ ] **Step 3: Align `fetchPage` revalidate window to 120s**

In `fetchPage`, ensure the `next.revalidate` default is `120` (matching the page route window), i.e. the `next` block reads:

```ts
        next: {
          ...requestInit?.next,
          revalidate: requestInit?.next?.revalidate ?? 120,
        },
```

> `fetchPage` is path-revalidated (no tag) — the document middleware calls `revalidatePath(fullPath)`. Do not add a tag here.

- [ ] **Step 4: Typecheck**

Run from `$DST`: `pnpm -F @repo/ui exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Run the UI test suite (no regressions)**

Run from `$DST`: `pnpm -F @repo/ui test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/ui/src/lib/strapi-api/content/server.ts
git commit -m "feat(ui): tag navbar/footer fetches and align page revalidate window"
```

---

### Task 18: Declare the revalidation + CDN env vars in the UI

**Files:**

- Modify: `apps/ui/src/env.mjs`
- Modify: `apps/ui/.env.local.example`

- [ ] **Step 1: Add to the `server` schema in `env.mjs`**

In `apps/ui/src/env.mjs`, inside `createEnv({ server: { … } })`, add (optional-first, so builds work without them):

```js
    STRAPI_REVALIDATE_SECRET: z.string().optional(),
    AZURE_SUBSCRIPTION_ID: z.string().optional(),
    AZURE_RESOURCE_GROUP: z.string().optional(),
    AZURE_FRONT_DOOR_PROFILE: z.string().optional(),
    AZURE_MI_CLIENT_ID: z.string().optional(),
    IDENTITY_ENDPOINT: z.string().optional(),
    IDENTITY_HEADER: z.string().optional(),
```

- [ ] **Step 2: Add them to `runtimeEnv` in `env.mjs`**

In the same file's `runtimeEnv` block, add:

```js
    STRAPI_REVALIDATE_SECRET: process.env.STRAPI_REVALIDATE_SECRET,
    AZURE_SUBSCRIPTION_ID: process.env.AZURE_SUBSCRIPTION_ID,
    AZURE_RESOURCE_GROUP: process.env.AZURE_RESOURCE_GROUP,
    AZURE_FRONT_DOOR_PROFILE: process.env.AZURE_FRONT_DOOR_PROFILE,
    AZURE_MI_CLIENT_ID: process.env.AZURE_MI_CLIENT_ID,
    IDENTITY_ENDPOINT: process.env.IDENTITY_ENDPOINT,
    IDENTITY_HEADER: process.env.IDENTITY_HEADER,
```

- [ ] **Step 3: Document in `.env.local.example`**

Append to `apps/ui/.env.local.example`:

```bash
# Shared secret authenticating cache revalidation + CDN purge requests from
# Strapi. Must match STRAPI_REVALIDATE_SECRET in apps/strapi.
STRAPI_REVALIDATE_SECRET=

# Optional — Azure Front Door CDN purge provider (the bundled example).
# Leave unset to keep the CDN purge feature inert. See
# docs/reference/integrations/cdn-purge.
# AZURE_SUBSCRIPTION_ID=
# AZURE_RESOURCE_GROUP=
# AZURE_FRONT_DOOR_PROFILE=
# AZURE_MI_CLIENT_ID=
# IDENTITY_ENDPOINT and IDENTITY_HEADER are injected by the Azure Container App runtime.
```

- [ ] **Step 4: Typecheck (env import resolves)**

Run from `$DST`: `pnpm -F @repo/ui exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/ui/src/env.mjs apps/ui/.env.local.example
git commit -m "feat(ui): declare revalidation + optional CDN env vars"
```

---

## Phase 7 — Docs

### Task 19: New Reference doc — cache revalidation (Strapi + UI)

**Files:**

- Create: `apps/docs/docs/reference/cache-revalidation.md`

- [ ] **Step 1: Write the canonical reference doc**

Create `apps/docs/docs/reference/cache-revalidation.md`. Base the prose on `$SRC/docs/frontend-cache-revalidation.md`, but de-Yale it: remove Greenhouse/jobs rows, use this starter's routes/types, and reference the `:::info` optional CDN doc. Required frontmatter and structure:

```md
---
sidebar_position: 4
---

# Cache Revalidation

How Strapi content updates become visible on the Next.js frontend without a rebuild, and how operators force a CDN purge when needed.

## How it works

Each public route has an ISR `revalidate` window combined with `stale-while-revalidate`, so visitors always get a cached page immediately while it regenerates in the background.

On publish/update/delete, a Strapi **Document Service middleware** (`apps/strapi/src/documentMiddlewares/revalidate.ts`) calls the `api::revalidate.revalidate` service, which POSTs to the UI route `apps/ui/src/app/api/strapi-revalidate/route.ts`. That route runs `revalidatePath` (page/redirect paths) and `revalidateTag(tag, "max")` (shared content like navbar/footer), marking the matching cache entries stale so the next request re-renders with fresh Strapi data.

## What gets revalidated

| Content type             | Mode                              | Trigger                  |
| ------------------------ | --------------------------------- | ------------------------ |
| `api::page.page`         | path (`fullPath`)                 | publish/unpublish/delete |
| `api::redirect.redirect` | path (`source`)                   | publish/unpublish/delete |
| `api::navbar.navbar`     | tag (`strapi:api::navbar.navbar`) | update/publish           |
| `api::footer.footer`     | tag (`strapi:api::footer.footer`) | update/publish           |

Add your own content types in `REVALIDATE_COLLECTIONS` in the document middleware, and tag the corresponding fetch in `apps/ui/src/lib/strapi-api/content/server.ts`.

## Revalidate windows

| Fetch                        | Interval | Notes                                                            |
| ---------------------------- | -------- | ---------------------------------------------------------------- |
| `fetchPage`                  | 120s     | Aligned with the public page route. Path-revalidated on publish. |
| `fetchNavbar`, `fetchFooter` | 600s     | Tag-revalidated on publish; TTL is the backstop.                 |

## Bulk hierarchy changes

Moving a page recalculates child `fullPath`s through the `internal-job` queue, which writes with `updatedBy: null`. The document middleware skips those writes to avoid duplicate calls, so the **job runner** (`runAll` in `apps/strapi/src/api/internal-job/services/internal-job.ts`) revalidates the aggregated touched paths once per batch instead.

## Manual revalidation

Editors can force-revalidate a single entry from the **Revalidate cache** button in the page/navbar/footer edit view (visible with `?showRevalidateCache=true`).

## CDN purge (optional)

Revalidation marks Next.js cache stale; it does not purge an upstream CDN. For incident-time CDN eviction, see [CDN purge](./integrations/cdn-purge.md).

## Configuration

Set `STRAPI_REVALIDATE_SECRET` (identical in `apps/strapi` and `apps/ui`) and `CLIENT_URL` (Strapi → UI base URL). See [Strapi environment variables](../strapi/environment-variables.md) and [UI environment variables](../ui/environment-variables.md).
```

> Adjust `sidebar_position` if it collides with an existing top-level reference page; pick the next free slot in `apps/docs/docs/reference/`.

- [ ] **Step 2: Build docs to validate links/frontmatter**

Run from `$DST`: `pnpm -F @repo/docs build`
Expected: build succeeds; no broken-link warnings for this page.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/docs/reference/cache-revalidation.md
git commit -m "docs: add cache revalidation reference page"
```

---

### Task 20: New Reference doc — optional CDN purge

**Files:**

- Create: `apps/docs/docs/reference/integrations/cdn-purge.md`

- [ ] **Step 1: Write the optional-feature doc** (mirror `auth/strapi-admin/microsoft-sso.md` structure)

Create `apps/docs/docs/reference/integrations/cdn-purge.md`:

```md
---
sidebar_position: 3
---

# CDN Purge (optional)

:::info Scope
Optional, opt-in feature. Cache revalidation works without it — see [Cache Revalidation](../cache-revalidation.md). CDN purge only matters when a CDN sits in front of the Next.js app and you need incident-time eviction faster than the route's TTL.
:::

CDN purge is a pluggable provider, like the optional [Microsoft SSO](../../auth/strapi-admin/microsoft-sso.md) provider. The provider is **inert until configured**: `resolveCdnProvider()` (`apps/ui/src/lib/cdn/index.ts`) returns `null` when no provider's env vars are set, and the **CDN cache** widget on the Strapi homepage reports that no provider is configured.

## Architecture

- Operator uses the **CDN cache** widget → `POST /api/revalidate/cdn-purge` (Strapi controller, admin-token validated)
- Strapi `cdn-cache` service → `POST /api/cdn-purge` (UI route)
- UI route → `purgeCdnCache()` → the resolved `CdnPurgeProvider`

## Adding a provider

Implement a `CdnPurgeProvider` (`apps/ui/src/lib/cdn/types.ts`) in `apps/ui/src/lib/cdn/providers/`, returning `null` from its factory until its env vars are set, then add it to the list in `resolveCdnProvider()`. The first configured provider wins.

## Bundled example: Azure Front Door

`apps/ui/src/lib/cdn/providers/azure-front-door.ts` purges an Azure Front Door endpoint using the Container App's managed identity (IMDS token). It activates only when all of these are set:

| Variable                               | Purpose                                          |
| -------------------------------------- | ------------------------------------------------ |
| `AZURE_SUBSCRIPTION_ID`                | Azure subscription                               |
| `AZURE_RESOURCE_GROUP`                 | Resource group containing the Front Door profile |
| `AZURE_FRONT_DOOR_PROFILE`             | Front Door profile name                          |
| `AZURE_MI_CLIENT_ID`                   | User-assigned managed identity client id         |
| `IDENTITY_ENDPOINT`, `IDENTITY_HEADER` | Injected by the Azure Container App runtime      |

When unset (local dev, non-Azure deploys), the provider is `null` and purge calls return an informative "No CDN provider is configured" outcome.
```

> Set `sidebar_position` to the next free slot in `apps/docs/docs/reference/integrations/` (currently `recaptcha.md` and `sentry.md` exist).

- [ ] **Step 2: Build docs**

Run from `$DST`: `pnpm -F @repo/docs build`
Expected: succeeds, no broken links for this page.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/docs/reference/integrations/cdn-purge.md
git commit -m "docs: add optional CDN purge integration page"
```

---

### Task 21: Revise the UI Caching doc + cross-links

**Files:**

- Modify: `apps/docs/docs/ui/caching.md`
- Modify: a Strapi-section doc for the cross-link (`apps/docs/docs/strapi/environment-variables.md` or the most relevant strapi page)

- [ ] **Step 1: Add an on-demand revalidation section to `ui/caching.md`**

In `apps/docs/docs/ui/caching.md`, after the "Default Strapi Request Cache" / "Full Route Cache And ISR" sections, add:

```md
## On-Demand Revalidation

Beyond TTL-based ISR, Strapi publishes invalidate cached content immediately via the revalidation pipeline: page/redirect paths through `revalidatePath`, and shared content (navbar, footer) through `revalidateTag`. Fetchers in `apps/ui/src/lib/strapi-api/content/server.ts` tag shared content with `strapi:api::<uid>` so a publish can target it precisely.

See [Cache Revalidation](../reference/cache-revalidation.md) for the full Strapi → UI flow, and [CDN Purge](../reference/integrations/cdn-purge.md) for optional CDN eviction.
```

If the existing doc states defaults that the tagging changed (e.g. navbar/footer revalidate values), update those lines to match: navbar/footer 600s with tags, page 120s.

- [ ] **Step 2: Add a cross-link from the Strapi section**

In the most relevant Strapi doc (e.g. `apps/docs/docs/strapi/environment-variables.md`, near `STRAPI_REVALIDATE_SECRET`/`CLIENT_URL`, or `apps/docs/docs/strapi/strapi-schemas.md`), add a one-line pointer:

```md
> Strapi publishes trigger frontend cache revalidation. See [Cache Revalidation](../reference/cache-revalidation.md).
```

- [ ] **Step 3: Build docs**

Run from `$DST`: `pnpm -F @repo/docs build`
Expected: succeeds, no broken links.

- [ ] **Step 4: Commit**

```bash
git add apps/docs/docs/ui/caching.md apps/docs/docs/strapi/
git commit -m "docs: revise UI caching doc and cross-link revalidation reference"
```

---

## Phase 8 — Final verification

### Task 22: Full repo verification

- [ ] **Step 1: Typecheck both apps**

Run from `$DST`: `pnpm -F @repo/strapi exec tsc --noEmit && pnpm -F @repo/ui exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 2: Run all unit tests**

Run from `$DST`: `pnpm -F @repo/strapi test && pnpm -F @repo/ui test`
Expected: PASS — including the new revalidate/cdn-cache/internal-job tests (strapi) and cache-paths/cdn/strapi-revalidate/cdn-purge tests (ui).

- [ ] **Step 3: Lint**

Run from `$DST`: `pnpm lint`
Expected: PASS (fix any import-order / unused-var issues the ported files introduce).

- [ ] **Step 4: Build docs**

Run from `$DST`: `pnpm -F @repo/docs build`
Expected: PASS, no broken links.

- [ ] **Step 5: Manual smoke (optional, requires running stack)**

Start Strapi + UI with `STRAPI_REVALIDATE_SECRET` and `CLIENT_URL` set. Publish a `page`, watch the UI logs for "Invalidated Strapi-driven Next.js cache", and confirm the page reflects the change. With `AZURE_*` unset, the **CDN cache** widget should report "No CDN provider is configured for this environment."

- [ ] **Step 6: Final commit (if any lint fixes)**

```bash
git add -A
git commit -m "chore: lint fixes for cache revalidation feature"
```

---

## Self-review notes (for the implementer)

- **Logging:** ported files import `logger`/`logError`/`withSpan` from `../utils/logging` (strapi) or `@/lib/logging` (ui). Both are created in Phase 0. Tests rely on the strapi shim reading the **global** `strapi.log` (stubbed in tests) and on the ui shim being a real no-op console module (UI tests do not mock `@/lib/logging`).
- **`revalidateTag(tag, "max")`** is valid on Next.js 16.2.6 (both repos pin it).
- **No content-type** is needed for the `revalidate` API; Strapi registers services/controllers/routes from the folder structure.
- **CDN inert-by-default:** `resolveCdnProvider()` returns `null` until `AZURE_*` is set, exactly mirroring the Entra SSO optional-provider pattern.
- **Greenhouse / Yale types** are excluded everywhere (`REVALIDATE_COLLECTIONS`, content fetchers, tests).

```

```
