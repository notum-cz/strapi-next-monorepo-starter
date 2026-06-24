---
name: copy-component
description: >
  Use to replicate a page-builder section from a reference — a text
  description, a screenshot, or an HTML/code snippet. Triggers: "copy
  component", "replicate component", "recreate this section", "build
  from screenshot", "make a component like this", "convert this
  HTML/JSX into a component", "port this section". Not for generic UI
  primitives (use `add-ui-component`) or API resources (use
  `add-content-type`).
argument-hint: "[description | image-path | code/html snippet or file]"
---

# Copy / Replicate a Component

Turn a **reference** — a text description, a screenshot, or an HTML/code snippet — into a full Strapi + React page-builder section that fits this codebase.

This skill derives a field spec + layout intent from the reference, then **delegates**: reuse-check to `find-component`, scaffolding (schema · dynamic zone · smart-populate · React skeleton · `PageContentComponents` mapping · types · showcase mock) to `create-content-component`. It does not re-implement those flows.

## Routing

- Replicate from a reference → **this skill**.
- Just check whether one already exists → `find-component`.
- Build from an explicit attribute spec (no reference to match) → `create-content-component`.
- New top-level API resource → `add-content-type`.

## Step 1 — Reuse-check first

Run `find-component` with the reference. If it returns a fit, **reuse as-is**, or extend it additively via `create-content-component` (a schema change → run `strapi-schema-check`). Only build new when there's no fit — don't duplicate an existing section.

## Step 2 — Derive a field spec from the input

- **Text description** → intent + named fields.
- **Screenshot / image** → read the image; identify layout, repeats (cards / rows / columns), media, CTAs, headings, and rich-text blocks.
- **HTML / code snippet** → parse the markup or JSX: element/prop → field; `.map()` → repeatable; `?.` / conditionals → optional; conditional class or variant → `enumeration`; `set:html` / `dangerouslySetInnerHTML` / an RTE component → a **rich-text** field, never a plain string.

Map to Strapi types and **reuse existing utilities** instead of inventing equivalents: links → `utilities.link`; images → `utilities.basic-image` (clickable → `utilities.image-with-link`); repeatable bullet text → `utilities.text`; accordion / FAQ → `utilities.accordions`; rich text → a rich-text customField or a `utilities.*` rich-text component. Full type table + rich-text options: the `create-content-component` skill's `examples.md`.

## Step 3 — Scaffold via `create-content-component`

Hand off the category + kebab-case name + attribute spec. That skill owns the Strapi schema, dynamic-zone registration, smart-populate, the React skeleton + mapping, type regen, and the showcase mock. Pick an `info.icon` from `create-content-component/references/strapi-icons.txt`.

## Step 4 — Implement to match the reference

Flesh out the React component to the reference using this codebase's conventions (see `add-ui-component` for the full set):

- **Typography** — `<Typography tag variant>` from `@/components/typography` for all text; never raw `<h1>`–`<h6>` / `<p>`. Variants live in `apps/ui/src/components/typography/config.ts`.
- **Rich text** — render with `StrapiTipTapEditorContent` or `StrapiCkEditorContent` (`@/components/page-builder/components/utilities/`). Formats differ — TipTap stores ProseMirror JSON, CKEditor HTML — match that when mocking/seeding (see `examples.md`).
- **Links / images** — reuse `StrapiLink`, `StrapiBasicImage`, `StrapiImageWithLink` (same utilities dir).
- **Layout** — wrap in `<Container>`; design tokens only, no raw hex or arbitrary Tailwind values. Translate any source CSS/SCSS to Tailwind tokens.
- **Static copy** — visible labels, aria-labels, and fallback text go in `apps/ui/locales/en.json` under `<category>.<name>.*` via `useTranslations`; only CMS-driven text comes from the schema.
- **Accessibility** — aria on interactive/structural elements (accordion: `aria-expanded`/`aria-controls`; images: real `alt`; icon-only buttons: `aria-label`).
- **shadcn** — match interactive patterns to primitives (collapsible → Accordion, tabs → Tabs, modal → Dialog, carousel → Carousel) via `add-ui-component`; install only with user approval.
- Apply the vendored `vercel-react-best-practices` / `next-best-practices` / `frontend-design` standards.
- Component schemas take **no** `pluginOptions.i18n` — they localize through the parent page's localized dynamic zone.

## Step 5 — Verify & optionally seed

`pnpm --filter @repo/strapi generate:types` → `pnpm --filter @repo/ui exec tsc --noEmit` → `pnpm --filter @repo/ui lint`. Run `strapi-schema-check` if you extended an existing schema. Optionally run `seed-content` to populate a demo entry.

## Not handled

Complex animations, form-submission logic, and inline SVGs — extract the structure and report the rest for manual follow-up.

## See also

- `find-component` · `create-content-component` · `add-ui-component` · `seed-content` · `strapi-schema-check`
- the `create-content-component` skill's `examples.md` — attribute + rich-text patterns
- `apps/docs/docs/page-builder/introduction.md`
