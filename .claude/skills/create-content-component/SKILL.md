---
name: create-content-component
description: >
  Use when adding a new CMS-driven page section that lives in the page
  builder's dynamic zone — e.g. "add page component", "new page
  section", "page builder component", "create content component", "add
  section", "new strapi component". Not for top-level API resources
  (use `add-content-type`) or generic React components (use
  `add-ui-component`).
argument-hint: "[category] [name]"
paths:
  - apps/strapi/src/components/**/*.json
  - apps/ui/src/components/page-builder/**
  - apps/strapi/config/plugins/smart-populate.ts
---

# Create a Page-Builder Content Component

Add a new page-builder section to both Strapi (component schema + dynamic-zone entry) and the Next.js frontend (React component + mapping), ending with type regeneration. Population is automatic via the smart-populate plugin — see `apps/docs/docs/strapi/plugins/smart-populate.md`.

## Routing — which skill do you actually want?

- **This skill (`create-content-component`)** — Strapi-driven page section, built from an explicit attribute spec.
- **`copy-component`** — replicate a section from a reference (description, screenshot, or HTML/code); it derives the spec and delegates here.
- **`add-content-type`** — needs its own DB table + REST endpoint (Article, Product, etc.).
- **`add-ui-component`** — generic React UI (Button, Container) not driven by Strapi data.

If unsure, ask the user before scaffolding.

## Inputs

- **Name** — kebab-case, lowercase (e.g. `pricing-table`). Reject Pascal/camelCase.
- **Category** — lowercase, no spaces. Existing under `apps/strapi/src/components/`: `elements`, `forms`, `layout`, `sections`, `seo-utilities`, `shared`, `utilities`. Create the dir before the schema if new.
- **Attributes** — fields the component needs.
- **Admin icon** — set `info.icon` to a representative name from `references/strapi-icons.txt` (optional but recommended; vary it per component).
- **Rich text?** — two editors are available, CKEditor and TipTap. Reuse a `utilities.*` rich-text component, or declare the matching `customField` — never raw `richtext`. See `examples.md` (Rich text).
- **Relation needing specific fields?** — components are populated automatically by smart-populate; only relations that need extra fields/depth require a `populateOverrides` entry (Procedure step 3).

## Duplication check

Not sure whether a similar section already exists (by purpose, attributes, or a screenshot)? Run `find-component` first — reuse or extend beats duplicating. Quick name check:

```bash
ls apps/strapi/src/components/<category>/<name>.json 2>/dev/null
find apps/ui/src/components/page-builder/components -iname "Strapi*<PascalName>*"
```

If anything matches, ask the user whether to rename or extend.

## Naming reference

Given `category=sections`, `name=testimonials`:

| Artifact           | Value                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------- |
| Strapi UID         | `sections.testimonials`                                                                 |
| Strapi schema file | `apps/strapi/src/components/sections/testimonials.json`                                 |
| `collectionName`   | `components_sections_testimonials` (format: `components_<category>_<name_underscored>`) |
| React component    | `StrapiTestimonials` (prefix `Strapi` + PascalCase)                                     |
| React file         | `apps/ui/src/components/page-builder/components/sections/StrapiTestimonials.tsx`        |

## Procedure

Follow `workflow.md` for the full step-by-step. The high-level sequence:

1. **Strapi schema** — create `apps/strapi/src/components/<category>/<name>.json` (see `examples.md` for attribute patterns).
2. **Register in Page dynamic zone** — append the new UID to `attributes.content.components` in `apps/strapi/src/api/page/content-types/page/schema.json`.
3. **Population (usually nothing to do)** — the page fetch uses `content: "smart"`, so the smart-populate plugin auto-populates the component's nested components/media/relations from its schema. Only add a `populateOverrides` entry in `apps/strapi/config/plugins/smart-populate.ts` if a relation needs specific fields or extra depth.
4. **React component** — `apps/ui/src/components/page-builder/components/<category>/Strapi<PascalCaseName>.tsx`.
5. **Register in `PageContentComponents`** — `apps/ui/src/components/page-builder/index.tsx`.
6. **Regenerate types** — `pnpm --filter @repo/strapi generate:types`.

Run schema check before opening the PR:

```bash
bash .claude/skills/strapi-schema-check/scripts/check.sh
```

## Common mistakes

- **Renaming or deleting an existing field** instead of adding alongside — Strapi auto-syncs to DB and drops the column. Run schema check first.
- **Hand-writing a populate tree** — smart-populate (`content: "smart"`) handles nested components automatically; don't add manual `populate` objects unless a relation needs specific fields, and then only via `populateOverrides`.
- **Using raw `richtext`** — use a rich-text `customField` (CKEditor or TipTap), or reuse a `utilities.*` rich-text component; see `examples.md` (Rich text).
- **Pascal/camelCase component names** — Strapi UIDs must be kebab-case.
- **Skipping type regeneration** — `Data.Component<"<category>.<name>">` won't resolve.
- **Forgetting `import "server-only"`** — every shipped page-builder section has it; without it, a future client import silently turns the section into a client component.
- **Typing props as `{ readonly component: ... }` only** — codebase convention is `PageBuilderComponentProps & { component: Data.Component<...> }`; the extra props are page-level context other sections rely on.
- **Picking the wrong category for a repeatable child component** — `shared/` is for repeatable "row" components shared across sections (`shared.figure`, `shared.image-with-title-and-description`); `utilities/` is for primitives reused everywhere (`utilities.link`, `utilities.basic-image`, `utilities.ck-editor-content`). Match the closest existing pattern; don't invent a new category.
- **Hardcoding UI copy** — strings like "/month", "Most popular", "Choose plan" go in `apps/ui/locales/`. Strapi-driven copy comes from the schema; static UI labels come from i18n.
- **Gold-plating the schema** — only add fields the task actually asks for. Optional extras (CTA buttons, "highlighted" toggles, billing-period switches) inflate the schema and the migration risk surface; add them in a follow-up if needed.
- **Repeatable scalars** — Strapi has no "repeatable string" type. A list of bullet strings needs either a child component with a single `text` field (reuse `utilities.text` if it fits) or, if richer per-row state is needed, a small new component.

## Verify

1. `pnpm --filter @repo/strapi dev` — boots clean (no schema error on new component).
2. Admin → Pages → add the new component to a dynamic zone → publish.
3. `pnpm --filter @repo/ui dev` — render → confirm data flows through.
4. `pnpm --filter @repo/ui exec tsc --noEmit` — clean.
5. `bash .claude/skills/strapi-schema-check/scripts/check.sh` — additive UID only.

## Checklist

- [ ] Strapi schema created with correct `collectionName`
- [ ] UID registered in Page's `content` dynamic zone
- [ ] `populateOverrides` entry added only if a relation needs specific fields (most components need none)
- [ ] React component with `Strapi` prefix + named + default exports
- [ ] Mapped in `PageContentComponents`
- [ ] `pnpm --filter @repo/strapi generate:types` ran clean
- [ ] Strapi boots, component renders with real data, `tsc --noEmit` clean
- [ ] `strapi-schema-check` passes

## Notes

- **No regional wrappers.** Single-region starter — skip the per-region wrapper pattern.
- **No Storybook.** Visual review via dev server or Playwright visual tests.
- **Page schema is high-risk.** Any rename/delete on `apps/strapi/src/api/page/content-types/page/schema.json` triggers column drops on boot. Add-only on the dynamic-zone array is safe.

### Mocking & Showcase

After you add a Strapi component and its frontend React implementation, add a mocked wrapper so the component is visible in the dev Showcase.

The workflow is simplified: mocked files should export a single default component and should not use `ManualSection` / `ManualItem` wrappers — the Showcase reads `showcaseItems.tsx` and renders the component directly.

1. Create a mocked file
   - Path: `apps/ui/src/app/[locale]/dev/showcase/components/strapiComponents/MockedStrapi{PascalName}.tsx`
   - Export default `MockedStrapi{PascalName}` which renders the production `Strapi{PascalName}` with a `data` object typed as `Data.Component<"{category}.{name}">`.

   Example:

```tsx
import type { Data } from "@repo/strapi-types"
import StrapiMyComponent from "@/components/page-builder/components/sections/StrapiMyComponent"

const data = {
  id: 1,
  __component: "sections.my-component",
  /* attributes */
} as unknown as Data.Component<"sections.my-component">

export default function MockedStrapiMyComponent() {
  return <StrapiMyComponent component={data} />
}
```

2. Register in `showcaseItems.tsx`
   - Import the mocked file:

     `import MockedStrapiMyComponent from "@/app/[locale]/dev/showcase/components/strapiComponents/MockedStrapiMyComponent"`

   - Add an entry to the `showcaseItems` array with `kind: "component"`, `component: MockedStrapiMyComponent`, `id`, `label` and `description`.

3. Attribute tips
   - Rich-text mock values match how the field is stored: an **HTML string** for CKEditor fields, **ProseMirror JSON** for TipTap fields (see `examples.md`).
   - For images/icons reuse `mockImage` / `mockIcon` from the dev showcase helpers.
   - Keep mock objects minimal but representative.

See `apps/docs/docs/ui/built-in-pages/showcase.md` for full examples and conventions.

## See also

- `workflow.md` — full per-phase procedure with code blocks
- `examples.md` — attribute patterns, rich-text editors (CKEditor + TipTap), override shapes
- `references/strapi-icons.txt` — valid `info.icon` names for the admin builder
- `add-content-type` — when the new thing should be a top-level API resource
- `add-ui-component` — generic UI primitives
- `vercel-react-best-practices` / `next-best-practices` / `frontend-design` — vendored React/Next.js + design standards for the component's frontend (in `.agents/skills/`)
- `strapi-schema-check` — pre-PR schema risk validation
- `apps/docs/docs/page-builder/introduction.md` — architecture overview, naming conventions, component props
- `apps/docs/docs/strapi/plugins/smart-populate.md` — automatic population + `populateOverrides`
