---
phase: 04-frontend-and-backend-subsystems
plan: 03
subsystem: docs
tags: [docusaurus, content-model, i18n, next-intl, strapi-i18n, preview, draft-mode, mermaid]

# Dependency graph
requires:
  - phase: 04-01
    provides: template/ sidebar section and _category_.json
  - phase: 03-architecture-deep-dives
    provides: page-builder.md and communication.md for cross-linking
provides:
  - template/content-model.md (BACK-01): all 6 content types with fields and localization status
  - template/i18n.md (FRONT-03): dual next-intl + Strapi i18n reference
  - template/preview-draft.md (BACK-03): preview/draft mode with sequence diagram
affects: [06-guides]

# Tech tracking
tech-stack:
  added: []
  patterns: [mermaid sequence diagram for preview flow, dual-system separation table for i18n]

key-files:
  created:
    - apps/docs/docs/template/content-model.md
    - apps/docs/docs/template/i18n.md
    - apps/docs/docs/template/preview-draft.md
  modified: []

key-decisions:
  - "No blog/author content types documented — only the 6 actual schema.json types exist"
  - "next-intl and Strapi i18n clearly separated via side-by-side comparison table"
  - "Cookie workaround documented with warning admonition citing private key dependency"

patterns-established:
  - "Sequence diagram pattern for multi-party flows (Strapi admin → Next.js → page)"
  - "Dual-system table at top of i18n doc to immediately separate the two concerns"

requirements-completed: [BACK-01, FRONT-03, BACK-03]

# Metrics
duration: 9min
completed: 2026-03-18
---

# Phase 4 Plan 3: Template Section Docs Summary

**Three cross-cutting reference docs for the Template section: content model (all 6 Strapi types), dual i18n system (next-intl + Strapi i18n), and preview/draft mode (Strapi handler, Next.js route, cookie workaround, StrapiPreviewListener)**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-18T12:57:21Z
- **Completed:** 2026-03-18T13:06:23Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Wrote `content-model.md` (163 lines) covering all 6 content types grouped by purpose (CMS Content, Navigation, System), key fields with types and notes for each, localization status quick-reference table, components overview with category/count table, and dynamic zone explanation
- Wrote `i18n.md` (218 lines) covering next-intl routing config (`defineRouting`), server config (`getRequestConfig`), type safety (`IntlMessages`), translation file structure with namespace table, Strapi i18n per-content-type status table, translation workflow, and locale routing explanation
- Wrote `preview-draft.md` (215 lines) covering Strapi admin config, Next.js GET handler validation table, cookie workaround with warning admonition, StrapiPreviewListener server+client components with actual code snippets, draft-aware fetching, and environment variables table; includes Mermaid sequence diagram for full preview flow

## Task Commits

Each task was committed atomically:

1. **Task 1: Write content model and i18n docs** - `5e31818` (docs)
2. **Task 2: Write preview/draft mode doc** - `82b83bf` (docs)

## Files Created/Modified

- `apps/docs/docs/template/content-model.md` - Content model reference (163 lines)
- `apps/docs/docs/template/i18n.md` - Dual i18n system reference (218 lines)
- `apps/docs/docs/template/preview-draft.md` - Preview/draft mode reference (215 lines)

## Decisions Made

- Only the 6 actual content types are documented (page, navbar, footer, redirect, subscriber, internal-job). The CONTEXT.md mention of "blog/author" reflects planned types that do not exist in the codebase — per RESEARCH.md pitfall guidance
- Dual-system comparison table placed at the top of `i18n.md` to immediately orient the reader before deep-diving into either system
- Cookie workaround documented with `:::warning` admonition highlighting the `__prerender_bypass` private key dependency and potential future breakage

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- First commit attempt used a custom scope (`04-03`) which violated the project's commitlint `scope-enum` rule. Fixed by using the `docs` scope as established in Phase 2 decisions.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 3 template/ docs in place: content-model.md, i18n.md, preview-draft.md
- Template section now has all planned content (04-01 created the section, 04-03 filled it)
- Phase 4 complete — all 3 plans done
- Build green with zero broken link warnings

## Self-Check: PASSED

All 3 created files verified on disk. Both task commits (5e31818, 82b83bf) present in git log.

---
*Phase: 04-frontend-and-backend-subsystems*
*Completed: 2026-03-18*
