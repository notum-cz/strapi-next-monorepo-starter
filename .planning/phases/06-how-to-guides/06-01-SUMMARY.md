---
phase: 06-how-to-guides
plan: 01
subsystem: docs
tags: [docusaurus, i18n, next-intl, authGuard, how-to-guide, locale, auth]

# Dependency graph
requires:
  - phase: 04-subsystems
    provides: i18n reference doc and authentication reference doc for cross-links
provides:
  - "Add a locale" how-to guide with German (de) example
  - "Add an auth page" how-to guide with Dashboard example
affects: [06-how-to-guides]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Numbered H2 steps guide format (## Step N: Title)"
    - "Concrete example names in guides (no generic placeholders)"
    - "Inline cross-links at relevant steps (not collected at end)"

key-files:
  created:
    - apps/docs/docs/guides/add-locale.md
    - apps/docs/docs/guides/add-auth-page.md
  modified: []

key-decisions:
  - "Used docs scope for commitlint (consistent with all prior phases)"
  - "Guide format: H2 numbered steps with no trailing checklist, matching locked decisions from CONTEXT.md"

patterns-established:
  - "Guide format: 1-2 line intro, then ## Step N: Title headings with numbered sub-steps"
  - "Concrete examples throughout: German locale (de), Dashboard auth page"
  - "Admonitions (:::info, :::warning) for key patterns and gotchas"

requirements-completed: [GUIDE-03, GUIDE-04]

# Metrics
duration: 2min
completed: 2026-03-18
---

# Phase 6 Plan 01: Simple How-To Guides Summary

**Two how-to guides for locale addition (German/de) and auth page creation (Dashboard) with inline cross-links to i18n, authentication, and middleware references**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-18T14:07:07Z
- **Completed:** 2026-03-18T14:09:07Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Add-locale guide covering translation file creation, routing config, i18n verification, and Strapi admin setup
- Add-auth-page guide covering route creation with _components/ pattern, authGuard protection, and session reading
- Both guides use concrete examples and copy-pasteable code blocks verified against the actual codebase
- Docusaurus build passes with zero errors after both guides added

## Task Commits

Each task was committed atomically:

1. **Task 1: Write add-locale guide (GUIDE-03)** - `5e206f1` (docs)
2. **Task 2: Write add-auth-page guide (GUIDE-04)** - `93ee5e8` (docs)

## Files Created/Modified
- `apps/docs/docs/guides/add-locale.md` - Step-by-step locale addition guide (sidebar_position: 1)
- `apps/docs/docs/guides/add-auth-page.md` - Step-by-step auth page addition guide (sidebar_position: 2)

## Decisions Made
- Used `docs` scope for commitlint (consistent with all prior documentation phases)
- Guide format follows locked decisions from CONTEXT.md: H2 numbered steps, concrete examples, inline cross-links, no trailing checklist

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Guide format pattern established for Plan 02 (add-content-type and add-page-builder-component guides)
- Cross-link targets verified: ../template/i18n, ../frontend/authentication, ../frontend/middleware all exist

## Self-Check: PASSED

- [x] apps/docs/docs/guides/add-locale.md exists
- [x] apps/docs/docs/guides/add-auth-page.md exists
- [x] 06-01-SUMMARY.md exists
- [x] Commit 5e206f1 exists
- [x] Commit 93ee5e8 exists

---
*Phase: 06-how-to-guides*
*Completed: 2026-03-18*
