---
name: find-component
description: >
  Use when checking whether a page-builder component already exists
  before building one — e.g. "find component", "does a component exist
  for", "is there a component that", "match this screenshot", "identify
  this section", "reuse existing component", "what renders this". Searches
  existing Strapi page-builder components by description or by a UI
  screenshot, then recommends reuse or `create-content-component`.
argument-hint: "[description | image-path]"
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# Find an Existing Component

Search the page-builder component library before building a new one. Two inputs: a **text description** of what you need, or a **screenshot** of the UI. Returns ranked matches with how to reuse them — or a recommendation to build one with `create-content-component`.

Read-only: this skill inspects and recommends; it never edits files.

## Where it looks

Build the inventory first, then match against it:

- **Strapi schemas** — `apps/strapi/src/components/**/*.json`. The UID is `<category>.<name>`; read each `displayName` + attribute keys/types. Source of truth for what a component contains.
- **React renderers** — `apps/ui/src/components/page-builder/components/**/Strapi*.tsx`.
- **Renderable set** — `PageContentComponents` in `apps/ui/src/components/page-builder/index.tsx` (UIDs actually wired into pages).
- **Showcase** — `apps/ui/src/app/[locale]/dev/showcase/showcaseItems.tsx` + the `Mocked*` previews (labels, descriptions, and a rendered example of each section). `/dev/showcase` shows them visually.

## Mode A — by description

1. Extract the intent + key fields from the request (e.g. "title + image + repeatable feature rows", "Q&A accordion", "row of partner logos", "numbered metrics").
2. Match against schema `displayName`s, attribute sets, and showcase descriptions. Rank by purpose + attribute overlap.

## Mode B — by screenshot / image

1. Read the image and describe the visual pattern: overall layout, repetition (cards / rows / columns), media, CTAs, accordion / carousel / tabs, logo strip, stat counters, etc.
2. Map the pattern to candidate UIDs **from the real inventory** (don't invent names). Typical cues: accordion of questions → `sections.faq`; strip of logos → `sections.animated-logo-row`; headline + buttons → `sections.heading-with-cta-button` / `sections.cta-banner`; numbered metrics → `sections.statistics`; sliding cards → `sections.carousel`; media + copy + CTA → `sections.image-with-cta-button`; feature/value rows → `sections.features-list`; large intro → `sections.hero`.
3. Confirm each candidate by reading its schema + its `Mocked*` showcase example. Optionally open `/dev/showcase` to compare the rendered mock against the screenshot.

## Output

Rank the top 0–3 candidates. For each:

- UID + `displayName`
- schema path, React path, whether it's in `PageContentComponents` (renderable), and whether it has a showcase entry
- attributes it supports **vs. what was asked** — call out gaps
- verdict: **reuse as-is** · **reuse + extend** (adding fields is a schema change → run `strapi-schema-check` first) · **not a fit**

If nothing fits, say so plainly and hand off to `create-content-component`, naming the closest category to start from. If only a sub-part matches (e.g. a repeatable row), point at the relevant `shared.*` / `utilities.*` child component to reuse instead of duplicating it.

## See also

- `create-content-component` — build a new section when there's no match.
- `copy-component` — replicate a section from a description/screenshot/code (runs this skill as its reuse-check).
- `add-ui-component` — generic (non page-builder) UI primitives.
- `apps/docs/docs/page-builder/introduction.md`, `apps/docs/docs/ui/built-in-pages/showcase.md`.
