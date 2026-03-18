# Requirements: Documentation Overhaul

**Defined:** 2026-03-17
**Core Value:** Every part of the monorepo has clear, navigable documentation with real code examples so that a developer can understand any subsystem without reading source code.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Sidebar & Structure

- [x] **STRUC-01**: Docs reorganized into folder-based sections (Getting Started, Architecture, Frontend, Backend, Packages, Infrastructure, Guides) with `_category_.json` files
- [x] **STRUC-02**: Every doc has `sidebar_position` and `sidebar_label` frontmatter for proper ordering
- [x] **STRUC-03**: Existing 8 docs migrated into new folder structure with corrected cross-links

### Getting Started

- [x] **START-01**: Getting Started guide covers prerequisites, clone, install, env setup, first run, and verification
- [x] **START-02**: Project structure page shows visual tree with description of each app and package

### Architecture

- [x] **ARCH-01**: Architecture overview expanded with Mermaid diagrams, data flow, and component boundaries
- [x] **ARCH-02**: Rendering modes doc explains ISR, SSR, CSR, `force-static` vs `force-dynamic`, `revalidate`, and the `dynamicRewrite` pattern
- [x] **ARCH-03**: SSR/CSR composition patterns doc covers server vs client components, `"use client"` boundaries, data fetching patterns
- [x] **ARCH-04**: Communication between layers doc shows how Next.js talks to Strapi with request flow diagrams

### Frontend

- [x] **FRONT-01**: Middleware pipeline doc covers all 5 stages, execution order, configuration, and how to modify
- [ ] **FRONT-02**: Proxy system doc explains public/private/asset proxies, endpoint allowlist, and token selection
- [x] **FRONT-03**: i18n system doc covers dual next-intl + Strapi i18n approach, locale routing, and translations
- [x] **FRONT-04**: Error handling patterns doc explains `AppError`, `logNonBlockingError`, error boundaries, and non-throwing fetch

### Backend

- [x] **BACK-01**: Content model reference documents all Strapi content types, their relationships, and field descriptions
- [x] **BACK-02**: Internal jobs system doc covers job lifecycle, handlers, admin extension, and error handling
- [x] **BACK-03**: Preview/Draft mode doc explains Strapi preview config, Next.js draft mode, the cookie workaround, and `StrapiPreviewListener`

### Packages

- [ ] **PKG-01**: Shared packages page covers design system, shared-data, strapi-types, and tooling configs in one doc with sections

### Infrastructure

- [x] **INFRA-01**: Environment variables reference in table format per app with required/optional, purpose, and examples
- [ ] **INFRA-02**: Deployment guide covers Docker setup for both apps, standalone output, CI/CD pipeline, and GitHub Actions
- [x] **INFRA-03**: Commands reference improved with workflow grouping, explanations, and troubleshooting tips
- [ ] **INFRA-04**: Testing & QA guide covers Vitest, Playwright E2E/visual/SEO/accessibility/perf suites

### How-To Guides

- [ ] **GUIDE-01**: How to add a page builder component (Strapi schema + populate config + React component + registry entry)
- [ ] **GUIDE-02**: How to add a new content type (API directory + endpoints + fetcher + types)
- [ ] **GUIDE-03**: How to add a new locale (next-intl config + Strapi i18n + translation files)
- [ ] **GUIDE-04**: How to add a new auth page (route + auth guard + components)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Polish & Extras

- **POLISH-01**: Known limitations and workarounds page (from CONCERNS.md analysis)
- **POLISH-02**: Troubleshooting section (common errors and fixes)
- **POLISH-03**: Systematic cross-linking audit across all docs
- **POLISH-04**: New versioned docs snapshot after all content complete

## Out of Scope

| Feature | Reason |
|---------|--------|
| Exhaustive API reference for every exported function | Conceptual + patterns depth, not library-style API docs |
| Video tutorials or interactive walkthroughs | Text and code examples only — videos are not maintainable |
| Individual pages per tooling config package | One shared packages page with sections is sufficient |
| Strapi admin UI step-by-step screenshots | Admin UI changes between versions; document concepts, link to Strapi docs |
| Modifying application source code | Documentation only, no refactoring |
| Contributing guide in Docusaurus | Already exists as CONTRIBUTING.md in repo root |
| Duplicating Strapi/Next.js official docs | Link to upstream, document only project-specific patterns |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STRUC-01 | Phase 1 | Complete |
| STRUC-02 | Phase 1 | Complete |
| STRUC-03 | Phase 1 | Complete |
| START-01 | Phase 2 | Complete |
| START-02 | Phase 2 | Complete |
| ARCH-01 | Phase 2 | Complete |
| ARCH-02 | Phase 3 | Complete |
| ARCH-03 | Phase 3 | Complete |
| ARCH-04 | Phase 3 | Complete |
| FRONT-01 | Phase 4 | Complete |
| FRONT-02 | Phase 4 | Pending |
| FRONT-03 | Phase 4 | Complete |
| FRONT-04 | Phase 4 | Complete |
| BACK-01 | Phase 4 | Complete |
| BACK-02 | Phase 4 | Complete |
| BACK-03 | Phase 4 | Complete |
| PKG-01 | Phase 5 | Pending |
| INFRA-01 | Phase 2 | Complete |
| INFRA-02 | Phase 5 | Pending |
| INFRA-03 | Phase 2 | Complete |
| INFRA-04 | Phase 5 | Pending |
| GUIDE-01 | Phase 6 | Pending |
| GUIDE-02 | Phase 6 | Pending |
| GUIDE-03 | Phase 6 | Pending |
| GUIDE-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after roadmap creation*
