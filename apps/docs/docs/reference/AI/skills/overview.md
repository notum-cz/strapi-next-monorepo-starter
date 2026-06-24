---
sidebar_position: 1
slug: /reference/AI/skills
---

# Agent Skills

Skills are reusable agent instructions for common tasks in this repo. They live in `.claude/skills/` (one folder per skill), auto-discovered by Claude Code; a committed `.agents/skills/` symlink exposes the same set to any agent following the [agentskills.io](https://agentskills.io) standard (Codex, Copilot CLI, Gemini).

An agent loads a skill when your request matches its trigger (e.g. "add a locale", "open a PR", "review this branch"), or when you invoke it directly as a slash command (`/make-pr`).

See the [Workflows](#workflows) section below for diagrams of how these chain together for common tasks. Supporting skills such as `frontend-design`, `next-best-practices`, and `vercel-react-best-practices` usually run as rubrics inside UI, component, and review workflows rather than as standalone task starters.

## Catalog

| Skill                                                           | Type              | What it does                                                                               |
| --------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------ |
| [add-content-type](./add-content-type.md)                       | Stack-coupled     | Scaffold a Strapi v5 collection or single type + UI wiring.                                |
| [add-locale](./add-locale.md)                                   | Stack-coupled     | Wire a new locale into Strapi i18n + Next.js routing.                                      |
| [add-ui-component](./add-ui-component.md)                       | Stack-coupled     | Add a Next.js / shadcn UI component under `apps/ui` (includes shadcn CLI + fixup).         |
| [create-content-component](./create-content-component.md)       | Stack-coupled     | Build a page-builder section across Strapi + Next.js.                                      |
| [copy-component](./copy-component.md)                           | Stack-coupled     | Replicate a section from a description, screenshot, or code snippet.                       |
| [find-component](./find-component.md)                           | Stack-coupled     | Find an existing page-builder component by description or screenshot.                      |
| [consolidate-patterns](./consolidate-patterns.md)               | Stack-coupled     | Extract repeated JSX into shared elementary components.                                    |
| [seed-content](./seed-content.md)                               | Stack-coupled     | Seed pages / navbar / footer into local Strapi via MCP.                                    |
| [strapi-schema-check](./strapi-schema-check.md)                 | Stack-coupled     | Flag risky Strapi schema changes that need a migration.                                    |
| [remove-sentry](./remove-sentry.md)                             | Stack-coupled     | Remove Sentry from both apps, keep structured logging.                                     |
| [remove-azure-monitor](./remove-azure-monitor.md)               | Stack-coupled     | Remove the Azure Monitor exporter, keep logging + OTel.                                    |
| [remove-cache-revalidation](./remove-cache-revalidation.md)     | Stack-coupled     | Uninstall the cache revalidation feature (and CDN purge).                                  |
| [remove-cdn-purge](./remove-cdn-purge.md)                       | Stack-coupled     | Uninstall only the optional CDN purge layer.                                               |
| [start-work](./start-work.md)                                   | Stack-agnostic    | Start work on an issue in an isolated worktree + plan.                                     |
| [make-pr](./make-pr.md)                                         | Stack-agnostic    | Commit, push, and open a GitHub PR from the branch.                                        |
| [review-pr](./review-pr.md)                                     | Stack-agnostic    | Review a PR or local branch diff before merge.                                             |
| [resolve-review-suggestions](./resolve-review-suggestions.md)   | Stack-agnostic    | Use authenticated `gh` to implement unresolved GitHub PR review threads.                   |
| [validate-branch-refs](./validate-branch-refs.md)               | Stack-agnostic    | Fix stale references/claims a branch's diff left behind.                                   |
| [write-tests](./write-tests.md)                                 | Stack-agnostic    | Add or extend Vitest / Playwright tests.                                                   |
| [find-skills](./find-skills.md)                                 | Helper / vendored | Discover and install additional agent skills.                                              |
| [frontend-design](./frontend-design.md)                         | Helper / vendored | Apply distinctive, subject-specific frontend design direction.                             |
| [next-best-practices](./next-best-practices.md)                 | Helper / vendored | Apply Next.js App Router, RSC, data, metadata, image, font, script, and bundling guidance. |
| [vercel-react-best-practices](./vercel-react-best-practices.md) | Helper / vendored | Apply Vercel React and Next.js performance rules.                                          |

**Stack-coupled** skills know this starter's file layout and conventions. **Stack-agnostic** skills work on any repo and may move to a shared plugin later. **Helper / vendored** skills are installed into this repo and used as supporting rubrics or ecosystem tools.

## Workflows

How the skills chain together for common tasks. Every implementation path ends the same way — **write tests → review → open the PR**. After reviewers comment on GitHub, `resolve-review-suggestions` handles the feedback loop; it is GitHub-only and requires authenticated `gh`.

### At a glance

The entry points and the shared finish.

```mermaid
flowchart TB
  classDef skill fill:#eef2ff,stroke:#6366f1,color:#1f2937
  classDef tail fill:#ecfeff,stroke:#0891b2,color:#164e63
  classDef helper fill:#f1f5f9,stroke:#94a3b8,color:#0f172a

  subgraph Entry["Start"]
    direction TB
    S["/start-work"]:::skill
  end

  subgraph Build["Build or change"]
    direction TB
    CP["/copy-component<br/><small>description · screenshot · code</small>"]:::skill
    F["/find-component<br/><small>reuse check</small>"]:::skill
    A["/create-content-component<br/><small>build the section</small>"]:::skill
    C["/add-content-type<br/><small>new collection / single type</small>"]:::skill
    H["frontend-design<br/>next-best-practices<br/>vercel-react-best-practices"]:::helper
  end

  subgraph Finish["Finish"]
    direction TB
    T["/write-tests"]:::tail
    R["/review-pr"]:::tail
    P["/make-pr"]:::tail
    RS["/resolve-review-suggestions<br/><small>GitHub review feedback</small>"]:::tail
  end

  S --> CP
  S --> C
  CP --> F
  F -->|"reuse"| T
  F -->|"no match"| A

  A -.-> H
  A --> T
  C --> T
  T --> R
  R --> P
  P -.-> RS
```

### Replicating a component (description, screenshot, or code)

`/copy-component` is the front door when you have a **reference** to reproduce. It derives a field spec from any of three inputs, reuse-checks via `/find-component`, delegates scaffolding to `/create-content-component`, then implements to the reference using the starter's conventions.

```mermaid
flowchart TB
  classDef skill fill:#eef2ff,stroke:#6366f1,color:#1f2937
  classDef manual fill:#f1f5f9,stroke:#94a3b8,color:#0f172a
  classDef decision fill:#fff7ed,stroke:#ea580c,color:#7c2d12
  classDef tail fill:#ecfeff,stroke:#0891b2,color:#164e63

  IN{"reference"}:::decision
  IN -->|"text description"| CP
  IN -->|"screenshot"| CP
  IN -->|"HTML / code snippet"| CP
  CP["/copy-component<br/><small>derive field spec + layout</small>"]:::skill
  CP --> F["/find-component<br/><small>reuse check</small>"]:::skill
  F -->|"match"| REUSE["reuse / extend additively"]:::manual
  F -->|"no fit"| CCC["/create-content-component<br/><small>scaffold schema · zone · React · types</small>"]:::skill
  CCC --> IMPL["implement to the reference<br/><small>Typography · utilities · tokens · locales · a11y</small>"]:::manual
  IMPL -.-> RUBRIC["frontend-design<br/>Next.js + React performance rubrics"]:::manual
  REUSE --> T["/write-tests"]:::tail
  IMPL --> T
  T --> R["/review-pr"]:::tail
  R --> P["/make-pr"]:::tail
```

### Adding a new Strapi component

A page-builder section, built across Strapi and the frontend. The schema check is the safety gate; seeding demo content and extracting shared patterns are optional. Seeding a brand-new component needs a Strapi restart first — components register on boot.

```mermaid
flowchart TB
  classDef skill fill:#eef2ff,stroke:#6366f1,color:#1f2937
  classDef gate fill:#fef9c3,stroke:#ca8a04,color:#713f12
  classDef tail fill:#ecfeff,stroke:#0891b2,color:#164e63
  classDef manual fill:#f1f5f9,stroke:#94a3b8,color:#0f172a

  S["/start-work<br/><small>branch + worktree + plan</small>"]:::skill
  S --> CCC["/create-content-component<br/><small>schema · dynamic zone · React · mapping</small>"]:::skill
  CCC --> SC["/strapi-schema-check<br/><small>additive UID = safe</small>"]:::gate
  CCC -.->|"UI rubric"| V["frontend-design<br/>next-best-practices<br/>vercel-react-best-practices"]:::manual
  SC --> T["/write-tests"]:::tail
  T --> R["/review-pr"]:::tail
  R --> P["/make-pr"]:::tail

  CCC -.->|"optional: data via MCP"| SEED["/seed-content"]:::skill
  CCC -.->|"optional: after several sections"| CP["/consolidate-patterns"]:::skill
```

### Finding an existing component (description or screenshot)

Before building, run `/find-component` with a description of what you need — or a screenshot of the UI. It searches the component schemas, renderers, and the showcase, then ranks matches. A fit means reuse (or reuse + extend, which is a schema change); no fit drops into "Adding a new Strapi component".

```mermaid
flowchart TB
  classDef skill fill:#eef2ff,stroke:#6366f1,color:#1f2937
  classDef manual fill:#f1f5f9,stroke:#94a3b8,color:#0f172a
  classDef decision fill:#fff7ed,stroke:#ea580c,color:#7c2d12
  classDef gate fill:#fef9c3,stroke:#ca8a04,color:#713f12
  classDef tail fill:#ecfeff,stroke:#0891b2,color:#164e63

  S["/start-work"]:::skill
  S --> FIND["/find-component<br/><small>description or screenshot</small>"]:::skill
  FIND --> D{"Match?"}:::decision
  D -->|"reuse as-is"| REUSE["reuse it<br/><small>compose / register in the page</small>"]:::manual
  D -->|"reuse + extend"| EXT["add fields"]:::manual --> SC["/strapi-schema-check"]:::gate
  D -->|"no fit"| CCC["/create-content-component<br/><small>see workflow above</small>"]:::skill
  REUSE --> T["/write-tests"]:::tail
  SC --> T
  CCC --> T
  T --> R["/review-pr"]:::tail
  R --> P["/make-pr"]:::tail
```

### Creating a new content type

A standalone collection or single type with its own API. Wire the UI only if the frontend reads it; the schema check still gates the change.

```mermaid
flowchart TB
  classDef skill fill:#eef2ff,stroke:#6366f1,color:#1f2937
  classDef manual fill:#f1f5f9,stroke:#94a3b8,color:#0f172a
  classDef decision fill:#fff7ed,stroke:#ea580c,color:#7c2d12
  classDef gate fill:#fef9c3,stroke:#ca8a04,color:#713f12
  classDef tail fill:#ecfeff,stroke:#0891b2,color:#164e63

  S["/start-work"]:::skill
  S --> ACT["/add-content-type<br/><small>schema · controller / service / routes · types</small>"]:::skill
  ACT --> D{"UI reads it?"}:::decision
  D -->|"yes"| WIRE["wire API_ENDPOINTS + fetcher<br/><small>+ proxy allow-list if client-side</small>"]:::manual
  D -->|"no"| SC
  WIRE --> SC["/strapi-schema-check"]:::gate
  SC --> T["/write-tests"]:::tail
  T --> R["/review-pr"]:::tail
  R --> P["/make-pr"]:::tail

  ACT -.->|"optional: demo data via MCP"| SEED["/seed-content"]:::skill
```
