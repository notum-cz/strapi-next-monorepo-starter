# Codebase Concerns

**Analysis Date:** 2026-03-17

## Tech Debt

**Draft mode preview cookie workaround:**

- Issue: Next.js `draftMode().enable()` sets a `sameSite=Lax` cookie by default which breaks Strapi's iframe-based preview (cross-origin iframe cannot read the cookie). A manual workaround explicitly re-sets `__prerender_bypass` with `sameSite: "none"` after each enable call.
- Files: `apps/ui/src/app/api/preview/route.ts` (lines 50–65)
- Impact: If Next.js changes its internal cookie key name or the underlying behavior of `draftMode()`, the workaround silently breaks. It depends on the private name `__prerender_bypass`.
- Fix approach: Upstream fix or PPR (Partial Pre-rendering) would eliminate the need. Track Next.js releases.

**Static page rendering forced despite dynamic header usage in root layout:**

- Issue: `apps/ui/src/app/[locale]/[[...rest]]/page.tsx` is set to `export const dynamic = "force-static"`, but `StrapiNavbar` in `layout.tsx` calls `headers()` which is a dynamic API. A code comment explicitly describes this as broken behavior and lists three fix options without implementing any.
- Files: `apps/ui/src/app/[locale]/[[...rest]]/page.tsx` (lines 11–24), `apps/ui/src/app/[locale]/layout.tsx`
- Impact: Auth state in the navbar is always `null` on the statically rendered catch-all route (`[[...rest]]`). Users appear logged-out on page load until hydration.
- Fix approach: Either move session detection fully to a client component with skeleton, adopt PPR, or switch to `"force-dynamic"` (loses ISR caching).

**`safeJSONParse` returns empty object `{}` on parse failure:**

- Issue: `safeJSONParse<T>` catches JSON parse errors and returns `{} as T` — a cast that lies to TypeScript. Callers assume the returned value matches `T`, but on failure they silently receive `{}`.
- Files: `apps/ui/src/lib/general-helpers.ts` (line 28), consumed in `apps/ui/src/lib/auth.ts` and `apps/ui/src/components/elementary/tiptap-editor/index.tsx`
- Impact: Auth error mapping in `throwBetterAuthError` could receive empty object and silently fall back to the fallback message, masking the real error.
- Fix approach: Return `null | T` and require callers to handle the null case, or throw instead of swallowing.

**`removeThisWhenYouNeedMe` scaffold helper left in production code:**

- Issue: A developer utility `removeThisWhenYouNeedMe()` exists in `general-helpers.ts` and is only silenced in non-development environments. It indicates scaffolded functions that have not been confirmed as needed.
- Files: `apps/ui/src/lib/general-helpers.ts` (line 15)
- Impact: False warning noise in development. Potential dead code.
- Fix approach: Each usage should be reviewed, confirmed or removed. Then delete the helper.

**Placeholder cron job left in production config:**

- Issue: `sayHelloJob` in `apps/strapi/config/cron-tasks.ts` is a sample cron task that logs `"A beautiful start to the week!"`. It is wired into the production `server.ts` config and enabled by `CRON_ENABLED=true`.
- Files: `apps/strapi/config/cron-tasks.ts`, `apps/strapi/config/env/production/server.ts`
- Impact: If `CRON_ENABLED` is `true`, this job runs every Monday at 1am. Noisy and useless.
- Fix approach: Remove or replace with a real operational cron task.

**Untyped `Function` type in job handler map:**

- Issue: `getJobHandlers()` in the internal-job service returns `Record<string, Function>`. TypeScript's `Function` type has no call signature safety.
- Files: `apps/strapi/src/api/internal-job/services/internal-job.ts` (line 131)
- Impact: If a handler is called with wrong arguments, TypeScript will not catch it at compile time.
- Fix approach: Type handlers as `(job: Data.ContentType<"api::internal-job.internal-job">) => Promise<void>`.

**Raw `knex` query for hierarchy published-document lookup:**

- Issue: `getOldPublishedDocument` in `apps/strapi/src/utils/hierarchy/helpers.ts` uses `strapi.db.connection` (raw Knex) instead of the Strapi Documents API because Strapi v5 Documents API does not expose the old published value in `beforeCreate` lifecycle. This is documented as a "strapi issue/future" workaround.
- Files: `apps/strapi/src/utils/hierarchy/helpers.ts`
- Impact: The raw Knex query is tied to the internal `pages` table name and column structure. A Strapi upgrade could silently break hierarchy recalculation.
- Fix approach: Monitor Strapi v5 changelog for Documents API improvements. Add a test that catches regressions in hierarchy logic.

**Page builder component map uses `any` type:**

- Issue: `PageContentComponents` in `apps/ui/src/components/page-builder/index.tsx` types the component map values as `React.ComponentType<any>` to accommodate varying prop shapes.
- Files: `apps/ui/src/components/page-builder/index.tsx` (line 21)
- Impact: No type checking for component props passed at render time. Wrong data shape from Strapi passes silently.
- Fix approach: Create a discriminated union of all component prop types, or use a typed render helper.

---

## Known Bugs

**Auth navbar session never available on static pages:**

- Symptoms: On statically-cached pages (`[[...rest]]`), server-side auth session is always `null` because `force-static` silently ignores `headers()` calls. Navbar user state is blank until client-side hydration.
- Files: `apps/ui/src/app/[locale]/[[...rest]]/page.tsx`, `apps/ui/src/app/[locale]/layout.tsx`
- Trigger: Any page served from ISR/static cache.
- Workaround: The dynamic route `[locale]/dynamic/[[...rest]]` exists and does support session-aware rendering.

**reCAPTCHA is defined but never called on contact form:**

- Symptoms: `verifyRecaptcha` in `apps/ui/src/lib/recaptcha.ts` is implemented with server-side token verification, but `useContactForm` in `apps/ui/src/hooks/useAppForm.ts` posts directly to Strapi without calling it. reCAPTCHA token is not passed or verified.
- Files: `apps/ui/src/lib/recaptcha.ts`, `apps/ui/src/hooks/useAppForm.ts`, `apps/ui/src/components/elementary/forms/ContactForm.tsx`
- Trigger: Any contact form submission.
- Workaround: None. RECAPTCHA_SECRET_KEY env var is present but the logic is disconnected.

---

## Security Considerations

**Production database config hardcodes `rejectUnauthorized: false`:**

- Risk: SSL certificate validation is disabled for the PostgreSQL connection in production. This allows man-in-the-middle attacks on the database connection.
- Files: `apps/strapi/config/env/production/database.ts` (line 13)
- Current mitigation: None.
- Recommendations: Set `rejectUnauthorized: true` and provide the CA certificate. If the certificate is self-signed or from a managed cloud provider, provide it via `DATABASE_SSL_CA`.

**Internal job endpoints have Strapi-level auth disabled:**

- Risk: `/api/internal-job/fullpaths/recalculate/all` and `/api/internal-job/redirects/create/all` have `config: { auth: false }`. Authentication is performed manually in the controller by verifying a JWT against `admin.auth.secret`.
- Files: `apps/strapi/src/api/internal-job/controllers/internal-job.ts`, `apps/strapi/src/api/internal-job/routes/internal-job.ts`
- Current mitigation: The controller performs JWT validation manually.
- Recommendations: This is an intentional design (comment explains it), but the custom validation must be kept in sync with Strapi internals. Consider adding a middleware-level approach for clarity.

**Admin panel config endpoint auth bypasses Strapi auth:**

- Risk: `/api/admin-panel-config` has `auth: false`. Authorization is done manually by comparing the request `Authorization` header against `ADMIN_PANEL_CONFIG_API_AUTH_TOKEN`.
- Files: `apps/strapi/src/api/admin-panel-config/controllers/admin-panel-config.ts`, `apps/strapi/src/api/admin-panel-config/routes/admin-panel-config.ts`
- Current mitigation: Token comparison exists. Returns `403` on mismatch.
- Recommendations: Confirm the endpoint does not accidentally expose sensitive data. Currently only returns `APP_BRAND`.

**Image remote patterns allow all HTTPS hostnames:**

- Risk: `next.config.mjs` sets `remotePatterns: [{ protocol: "https", hostname: "*" }]` for image optimization, which allows images from any HTTPS host to be proxied and cached through Next.js.
- Files: `apps/ui/next.config.mjs` (line 42–45)
- Current mitigation: `unoptimized: true` is set, so Next.js image optimization is effectively disabled and images are not actually proxied through Next.js optimization pipeline.
- Recommendations: If `unoptimized` is ever set to `false`, restrict `hostname` to only the Strapi and CDN hostnames.

**Subscriber endpoint has no spam protection:**

- Risk: The subscriber collection type has a default Strapi router (`createCoreRouter`) with no rate limiting or reCAPTCHA. Anyone can POST to `/api/subscribers` through the public proxy and create unlimited entries.
- Files: `apps/strapi/src/api/subscriber/routes/subscriber.ts`, `apps/ui/src/hooks/useAppForm.ts`
- Current mitigation: `isStrapiEndpointAllowed` in `request-auth.ts` gates `POST /api/subscribers`, but there is no throttle.
- Recommendations: Implement reCAPTCHA verification (the code exists at `apps/ui/src/lib/recaptcha.ts` but is disconnected) or add rate limiting at the Strapi level.

**Email HTML in lifecycle hooks is built with raw string concatenation:**

- Risk: Admin invitation and user activation emails in `adminUser.ts` and `user.ts` build HTML by directly interpolating `firstName`, `lastName`, and `email` values from the database event into a template string without sanitization.
- Files: `apps/strapi/src/lifeCycles/adminUser.ts` (line 28), `apps/strapi/src/lifeCycles/user.ts` (line 60–63)
- Current mitigation: These values originate from Strapi admin-created records, so they are assumed trusted.
- Recommendations: Apply HTML escaping or use a proper template engine to prevent injection if user-supplied values ever reach these fields.

**Direct `process.env` access in Strapi bypasses validation layer:**

- Risk: `apps/strapi/src/lifeCycles/user.ts`, `apps/strapi/src/api/admin-panel-config/controllers/admin-panel-config.ts`, and the services file read `process.env.*` directly instead of using the validated `env()` function provided by Strapi config. Missing env vars fail silently (return `undefined`).
- Files: `apps/strapi/src/lifeCycles/user.ts` (line 42), `apps/strapi/src/api/admin-panel-config/controllers/admin-panel-config.ts` (line 5), `apps/strapi/src/api/admin-panel-config/services/admin-panel-config.ts` (line 9)
- Current mitigation: `console.warn` logged if `CLIENT_ACCOUNT_ACTIVATION_URL` is missing.
- Recommendations: Use `strapi.config.env()` or centralize env access with validation.

---

## Performance Bottlenecks

**Dynamic zone populate uses a double-query pattern:**

- Problem: The `registerPopulatePageMiddleware` in `apps/strapi/src/documentMiddlewares/page.ts` prefetches document data once to determine which components are in use, then fetches again via `next()` with the full populate. Every page request incurs two Strapi DB queries.
- Files: `apps/strapi/src/documentMiddlewares/page.ts`, `apps/strapi/src/documentMiddlewares/helpers.ts`
- Cause: The prefetch is unavoidable given Strapi's current polymorphic dynamic zone API (populate must be specified per-component type, but component types are only known from data).
- Improvement path: Cache common populate configs per request batch; monitor Strapi v5 for improvements to the `on` populate syntax.

**`fetchAll` fires all pagination requests concurrently but still N+1 fetches:**

- Problem: `BaseStrapiClient.fetchAll()` issues one request per page in parallel after fetching the first page. For large collections (>100 items), this multiplies API load.
- Files: `apps/ui/src/lib/strapi-api/base.ts` (lines 133–188)
- Cause: Strapi's default `maxLimit` is 100 items per page.
- Improvement path: Increase `maxLimit` in Strapi API config for known collections like pages to reduce page count, or use cursor-based pagination.

**Sitemap generation fetches all pages per locale individually:**

- Problem: `apps/ui/src/app/sitemap.ts` calls `fetchAllPages` per locale in parallel. With many locales, this multiplies Strapi load at build/render time.
- Files: `apps/ui/src/app/sitemap.ts`
- Cause: One API call per locale, sequential within each.
- Improvement path: Batch locales in a single Strapi query using `locale: "all"` if available.

---

## Fragile Areas

**Hierarchy system relies on `beforeCreate` lifecycle for all publish events:**

- Files: `apps/strapi/src/api/page/content-types/page/lifecycles.ts`, `apps/strapi/src/utils/hierarchy/index.ts`
- Why fragile: `handleHierarchyBeforeCreate` is triggered on every `beforeCreate` event, including publish. It distinguishes creation vs. publish via the presence of `documentId` and `updatedBy`. If Strapi changes when these fields are set, the hierarchy silently stops working.
- Safe modification: Always run the Strapi integration tests in `apps/strapi/tests/app.test.ts` after Strapi upgrades. Be cautious editing the `if (!newData.documentId)` and `if (newData.updatedBy == null)` guards.
- Test coverage: The Strapi test suite only validates schema registration, not hierarchy behavior.

**`populateDynamicZone` index reads filesystem at startup:**

- Files: `apps/strapi/src/populateDynamicZone/index.ts`
- Why fragile: The function uses `fs.readdirSync` and `createRequire` to dynamically build the populate config by scanning the filesystem. Adding a populate config in the wrong directory or with the wrong extension silently omits it from the schema.
- Safe modification: Filenames in `apps/strapi/src/populateDynamicZone/` must match the Strapi component UID format `category.name.ts`. Do not add non-component files to those subdirectories.
- Test coverage: None. A misconfigured directory is not caught until a missing populate causes a runtime 400 error.

**Strapi config sync files include `documentId` references:**

- Files: `apps/strapi/config/sync/*.json`
- Why fragile: The config-sync files include hard-coded `documentId` values. If these IDs drift between environments (e.g., local, staging, production) due to independent data bootstrapping, syncing will fail or produce unexpected results.
- Safe modification: Always import/export config through `strapi-plugin-config-sync` commands, not manually edit JSON files.
- Test coverage: None.

**`dynamicRewrite` middleware regex is locale-aware but locale list is static:**

- Files: `apps/ui/src/lib/proxies/dynamicRewrite.ts`
- Why fragile: The middleware builds regex patterns using `routing.locales.join("|")`. If a locale is added to `routing.locales` in `apps/ui/src/lib/navigation.ts`, the middleware auto-updates. However, if locales contain regex-special characters, the pattern is unescaped.
- Safe modification: Locale codes (e.g., `en`, `cs`) are safe. Do not add locale codes containing `.`, `+`, `?`, or other regex-special characters.
- Test coverage: None for the middleware directly.

---

## Scaling Limits

**Strapi public proxy passes all client headers to upstream:**

- Current capacity: Works for low-concurrent use.
- Limit: `Object.fromEntries(clonedRequest.headers)` copies all incoming headers (including `Cookie`, `Host`, `Forwarded`) to the upstream Strapi request. Under high load this increases header payload.
- Scaling path: Allowlist only required headers (`Content-Type`, `Accept`, `Authorization`) when forwarding to Strapi.

**Better Auth runs in stateless/cookie-cache mode (no DB):**

- Current capacity: Works with cookie-based JWE sessions.
- Limit: No server-side session store means sessions cannot be forcibly revoked (e.g., on password change, security incident). Password change does issue a new JWT and re-set the cookie, but old cookies from other sessions remain valid until expiry (30 days).
- Scaling path: Enable `database` strategy in Better Auth to support session revocation.

---

## Dependencies at Risk

**`@notum-cz/strapi-plugin-tiptap-editor` is tracked via yalc locally:**

- Risk: The `.yalc/` directory contains a local copy of `@notum-cz/strapi-plugin-tiptap-editor` in both the monorepo root and `apps/strapi`. This is a development-time override that can diverge from the published npm version `^1.0.1` listed in `package.json`.
- Impact: CI installs the npm package; local development may use an unreleased local build. Differences between the two versions may cause bugs that only appear in production.
- Migration plan: Remove yalc usage once the required functionality is available in the published package. Do not commit `.yalc/` contents.

**`ckeditor5` pinned at specific version alongside a plugin that has its own bundled version:**

- Risk: `apps/strapi/package.json` declares `ckeditor5: 45.2.2` alongside `@_sh/strapi-plugin-ckeditor: ^6.0.2` which likely bundles its own CKEditor. Version mismatches cause duplicate CKEditor instances or symbol conflicts.
- Impact: Admin editor may exhibit visual or functional regressions after updates.
- Migration plan: Check `@_sh/strapi-plugin-ckeditor` peer dependency requirements and ensure the declared `ckeditor5` version matches.

**`strapi-plugin-config-sync` version 2.1.0 may lag Strapi 5 changes:**

- Risk: `strapi-plugin-config-sync@2.1.0` is a community plugin. If Strapi 5 internal data structures change in a minor update, config sync could produce broken export/import files.
- Impact: Config drift between environments, failed deployments.
- Migration plan: Track the plugin's changelog for Strapi 5 compatibility notes.

---

## Missing Critical Features

**reCAPTCHA not connected to form submission:**

- Problem: `verifyRecaptcha` in `apps/ui/src/lib/recaptcha.ts` is defined and the `RECAPTCHA_SECRET_KEY` / `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` env vars are configured, but the contact/newsletter form submission hook (`useContactForm`) never calls it. The public `api/subscribers` endpoint is unprotected from bot submissions.
- Blocks: Reliable spam prevention for the contact form.

**No job retry or dead-letter mechanism for internal jobs:**

- Problem: When an internal job (fullpath recalculation or redirect creation) fails, it is marked `state: "failed"` but never retried automatically. The error is stored in `job.error` but there is no alerting or automated cleanup.
- Files: `apps/strapi/src/api/internal-job/services/internal-job.ts` (lines 94–127)
- Blocks: Orphaned failed jobs accumulate in the `internal_jobs` table. Slug changes that fail leave pages without redirects.

**Email provider has no fallback when both Mailgun and Mailtrap are unconfigured:**

- Problem: `prepareEmailConfig` in `apps/strapi/config/plugins.ts` returns `null` if neither `MAILGUN_API_KEY` nor `MAILTRAP_USER` is set, logging a warning. User activation emails and admin invitation emails will silently fail.
- Files: `apps/strapi/config/plugins.ts` (lines 90–135), `apps/strapi/src/lifeCycles/user.ts`, `apps/strapi/src/lifeCycles/adminUser.ts`
- Blocks: User onboarding in environments without email configured.

---

## Test Coverage Gaps

**Hierarchy logic has no integration tests:**

- What's not tested: `handleHierarchyBeforeCreate`, `processRecalculateFullPathJob`, `processCreateRedirectJob` — the entire page URL hierarchy and automatic redirect creation system.
- Files: `apps/strapi/src/utils/hierarchy/index.ts`, `apps/strapi/src/utils/hierarchy/helpers.ts`
- Risk: Any Strapi version bump or lifecycle change could silently break `fullPath` calculation without failing CI.
- Priority: High

**Preview route has no tests:**

- What's not tested: The `GET /api/preview` handler including secret validation, draft mode enable/disable, cookie-patching workaround, and locale fallback.
- Files: `apps/ui/src/app/api/preview/route.ts`
- Risk: The workaround for the `sameSite` cookie could silently break on Next.js updates.
- Priority: High

**Proxy authentication and endpoint allowlist have no tests:**

- What's not tested: `isStrapiEndpointAllowed` and `createStrapiAuthHeader` in `request-auth.ts`. If the allowlist is modified, there is no automated check that the proxy still blocks unauthorized endpoints.
- Files: `apps/ui/src/lib/strapi-api/request-auth.ts`
- Risk: A misconfigured allowlist could expose private Strapi endpoints publicly.
- Priority: High

**Dynamic populate config filesystem scanner has no tests:**

- What's not tested: `getPopulateDynamicZoneConfig` in `apps/strapi/src/populateDynamicZone/index.ts`. A misconfigured directory or misnamed file silently produces a missing populate config.
- Files: `apps/strapi/src/populateDynamicZone/index.ts`
- Risk: New page builder components with missing populate configs cause silent data fetch failures.
- Priority: Medium

**Middleware proxies (auth guard, basic auth, dynamic rewrite) have no unit tests:**

- What's not tested: `authGuard`, `basicAuth`, `dynamicRewrite`, `httpsRedirect`.
- Files: `apps/ui/src/lib/proxies/`
- Risk: Changes to route matchers or session check logic are not validated before deployment.
- Priority: Medium

**UI app has only one test file (`dates.test.ts`):**

- What's not tested: All components, hooks, server functions, API routes, and lib utilities except date formatting.
- Files: `apps/ui/src/lib/__tests__/dates.test.ts`
- Risk: Broad surface area of business logic (auth flows, proxy routing, form submissions, metadata generation) goes unvalidated in CI.
- Priority: Medium

---

_Concerns audit: 2026-03-17_
