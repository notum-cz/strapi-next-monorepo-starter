# Roadmap: Documentation Overhaul

## Overview

Transform the Docusaurus documentation site from 8 flat, alphabetically-sorted docs into a structured, comprehensive documentation set covering every subsystem in the monorepo. The work flows from structural foundation (folder hierarchy and doc migration) through onboarding content, architectural deep-dives, subsystem references, and finally task-oriented how-to guides. Each phase delivers a verifiable improvement to the documentation site.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Sidebar Structure and Doc Migration** - Create folder hierarchy, category files, and migrate existing 8 docs into new structure
- [x] **Phase 2: Getting Started and Foundation** - Onboarding guide, project structure, improved architecture overview, env vars reference, improved commands reference *(completed 2026-03-18)*
- [x] **Phase 3: Architecture Deep-Dives** - Rendering modes, SSR/CSR composition patterns, and communication between layers docs *(completed 2026-03-18)*
- [x] **Phase 4: Frontend and Backend Subsystems** - Middleware, proxy, i18n, error handling, content model, internal jobs, and preview/draft mode docs (completed 2026-03-18)
- [ ] **Phase 5: Packages and Infrastructure** - Shared packages overview, deployment guide, and testing/QA guide
- [ ] **Phase 6: How-To Guides** - Step-by-step task recipes for adding components, content types, locales, and auth pages

## Phase Details

### Phase 1: Sidebar Structure and Doc Migration
**Goal**: Docs site has a navigable folder-based sidebar and all existing content is preserved in its new location
**Depends on**: Nothing (first phase)
**Requirements**: STRUC-01, STRUC-02, STRUC-03
**Success Criteria** (what must be TRUE):
  1. Docusaurus sidebar shows 7 collapsible sections (Getting Started, Architecture, Backend, Frontend, Packages, Infrastructure, Guides) with correct labels and ordering
  2. All 8 existing docs are accessible at their new paths with working cross-links between them
  3. Every doc file in the site has `sidebar_position` and `sidebar_label` frontmatter
  4. `pnpm --filter @repo/docs build` completes with zero broken link warnings from the migration
**Plans:** 2/2 plans complete

Plans:
- [x] 01-01-PLAN.md — Remove version 3.1.1, harden config, install Mermaid, create 7 section folders with _category_.json
- [x] 01-02-PLAN.md — Migrate 8 docs into folders with frontmatter, fix cross-links, update homepage redirect

### Phase 2: Getting Started and Foundation
**Goal**: A new developer can go from zero to running the project and understand its structure by reading the docs
**Depends on**: Phase 1
**Requirements**: START-01, START-02, ARCH-01, INFRA-01, INFRA-03
**Success Criteria** (what must be TRUE):
  1. A developer can follow the Getting Started guide from clone through first successful run without consulting any other source
  2. The project structure page shows a visual tree that maps every app and package to its purpose
  3. The architecture overview includes Mermaid/ASCII diagrams showing data flow and component boundaries
  4. A developer can look up any environment variable in a table and know which app needs it, whether it is required, and what it controls
  5. The commands reference groups commands by workflow (dev, build, test, lint, deploy) with explanations of when to use each
**Plans:** 3 plans

Plans:
- [ ] 02-01-PLAN.md — Getting Started guide: 5-page onboarding from prerequisites through creating content
- [ ] 02-02-PLAN.md — Architecture overview with 4 Mermaid diagrams and project structure page
- [ ] 02-03-PLAN.md — Environment variables reference and commands reference rewrite

### Phase 3: Architecture Deep-Dives
**Goal**: A developer understands how rendering, component composition, and cross-layer communication work in this project
**Depends on**: Phase 2
**Requirements**: ARCH-02, ARCH-03, ARCH-04
**Success Criteria** (what must be TRUE):
  1. A developer can determine which rendering mode (ISR, SSR, CSR) applies to a given page and why, including the `force-static` vs `force-dynamic` pattern and `dynamicRewrite` middleware trick
  2. A developer knows when to use server components vs client components and where `"use client"` boundaries belong in this project
  3. A developer can trace a request from browser to Strapi and back, understanding which path it takes (SSR direct call, CSR via proxy, auth-injected) based on context
**Plans:** 1 plan

Plans:
- [ ] 03-01-PLAN.md — Rendering & Composition deep-dive and Communication Between Layers deep-dive (2 docs)

### Phase 4: Frontend and Backend Subsystems
**Goal**: Every undocumented subsystem that developers encounter in daily work has a reference doc
**Depends on**: Phase 3
**Requirements**: FRONT-01, FRONT-03, FRONT-04, BACK-01, BACK-02, BACK-03
**Success Criteria** (what must be TRUE):
  1. A developer can identify all 5 middleware stages, their execution order, each stage's purpose, and how to modify the pipeline
  2. A developer understands both i18n systems (next-intl for UI strings, Strapi i18n for content), how locale routing works, and how translations are managed
  3. A developer knows the project's error handling patterns: `AppError`, `logNonBlockingError`, error boundaries in page builder, and the non-throwing fetch convention
  4. A developer can look up any Strapi content type (page, blog, author, navbar, footer, redirect, subscriber, internal-job) and understand its fields, relationships, and purpose
**Plans:** 3/3 plans complete

Plans:
- [ ] 04-01-PLAN.md — Create template/ sidebar section, renumber positions, write middleware pipeline and error handling docs
- [ ] 04-02-PLAN.md — Write internal jobs system reference doc
- [ ] 04-03-PLAN.md — Write content model, i18n system, and preview/draft mode docs in template/ section

### Phase 5: Packages and Infrastructure
**Goal**: Shared packages are documented, and developers can deploy and test the project using the docs
**Depends on**: Phase 4
**Requirements**: PKG-01, INFRA-02, INFRA-04
**Success Criteria** (what must be TRUE):
  1. A developer can find documentation for every shared package (design-system, shared-data, strapi-types, eslint-config, prettier-config, typescript-config, semantic-release-config) with its purpose, exports, and how to extend it
  2. A developer can deploy both apps using Docker by following the deployment guide, including standalone output mode, CI/CD pipeline configuration, and GitHub Actions workflows
  3. A developer can run every test suite (Vitest unit, Playwright E2E, visual regression, SEO, accessibility, performance) and knows how to add new tests to each suite
**Plans:** 2 plans

Plans:
- [ ] 05-01-PLAN.md — Workspace packages reference doc with tiered depth (full sections for 3 app packages, summary table for tooling configs)
- [ ] 05-02-PLAN.md — Deployment guide (Docker + CI/CD) and Testing & QA guide (all 7 test suites)

### Phase 6: How-To Guides
**Goal**: Developers can perform the four most common extension tasks by following step-by-step guides
**Depends on**: Phase 4 (guides cross-reference subsystem docs)
**Requirements**: GUIDE-01, GUIDE-02, GUIDE-03, GUIDE-04
**Success Criteria** (what must be TRUE):
  1. A developer can add a new page builder component end-to-end (Strapi schema, populate config, React component, registry entry) by following the guide
  2. A developer can add a new content type end-to-end (API directory, endpoints, fetcher, types) by following the guide
  3. A developer can add a new locale (next-intl config, Strapi i18n, translation files) by following the guide
  4. A developer can add a new auth page (route, auth guard, components) by following the guide
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Sidebar Structure and Doc Migration | 2/2 | Complete    | 2026-03-18 |
| 2. Getting Started and Foundation | 3/3 | Complete    | 2026-03-18 |
| 3. Architecture Deep-Dives | 1/1 | Complete    | 2026-03-18 |
| 4. Frontend and Backend Subsystems | 3/3 | Complete   | 2026-03-18 |
| 5. Packages and Infrastructure | 0/2 | Not started | - |
| 6. How-To Guides | 0/2 | Not started | - |
