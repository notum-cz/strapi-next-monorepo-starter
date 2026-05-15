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
  - apps/strapi/src/populateDynamicZone/**
---

# Create a Page-Builder Content Component

Add a new page-builder section to both Strapi (component schema + populate rules + dynamic-zone entry) and the Next.js frontend (React component + mapping), ending with type regeneration.

## Routing — which skill do you actually want?

- **This skill (`create-content-component`)** — Strapi-driven page section rendered through the page builder's dynamic zone.
- **`add-content-type`** — needs its own DB table + REST endpoint (Article, Product, etc.).
- **`add-ui-component`** — generic React UI (Button, Container) not driven by Strapi data.

If unsure, ask the user before scaffolding.

## Inputs

- **Name** — kebab-case, lowercase (e.g. `pricing-table`). Reject Pascal/camelCase.
- **Category** — lowercase, no spaces. Existing under `apps/strapi/src/components/`: `elements`, `forms`, `layout`, `sections`, `seo-utilities`, `shared`, `utilities`. Create the dir before the schema if new.
- **Attributes** — fields the component needs.
- **Rich text?** — CKEditor is the editorial default in this starter (see `examples.md`).

## Duplication check

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
| Populate file      | `apps/strapi/src/populateDynamicZone/<category>/<name>.ts`                              |

## Procedure

Follow `workflow.md` for the full step-by-step. The high-level sequence:

1. **Strapi schema** — create `apps/strapi/src/components/<category>/<name>.json` (see `examples.md` for attribute patterns).
2. **Register in Page dynamic zone** — append the new UID to `attributes.content.components` in `apps/strapi/src/api/page/content-types/page/schema.json`.
3. **Populate rule** — drop a file under `apps/strapi/src/populateDynamicZone/<category>/<name>.ts` (auto-registered by filesystem scan).
4. **React component** — `apps/ui/src/components/page-builder/components/<category>/Strapi<PascalCaseName>.tsx`.
5. **Register in `PageContentComponents`** — `apps/ui/src/components/page-builder/index.tsx`.
6. **Regenerate types** — `pnpm --filter @repo/strapi generate:types`.

Run schema check before opening the PR:

```bash
bash .agents/skills/strapi-schema-check/scripts/check.sh
```

## Common mistakes

- **Renaming or deleting an existing field** instead of adding alongside — Strapi auto-syncs to DB and drops the column. Run schema check first.
- **Editing `populateDynamicZone/index.ts`** — it auto-scans siblings; don't touch it.
- **Using Strapi `richtext` instead of CKEditor** for editorial copy — CKEditor `customField` with `preset: defaultCkEditor` is the starter convention.
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
5. `bash .agents/skills/strapi-schema-check/scripts/check.sh` — additive UID only.

## Checklist

- [ ] Strapi schema created with correct `collectionName`
- [ ] UID registered in Page's `content` dynamic zone
- [ ] Populate file created (only if any field needs population)
- [ ] React component with `Strapi` prefix + named + default exports
- [ ] Mapped in `PageContentComponents`
- [ ] `pnpm --filter @repo/strapi generate:types` ran clean
- [ ] Strapi boots, component renders with real data, `tsc --noEmit` clean
- [ ] `strapi-schema-check` passes

## Notes

- **No regional wrappers.** Single-region starter — skip the per-region wrapper pattern.
- **No Storybook.** Visual review via dev server or Playwright visual tests.
- **Page schema is high-risk.** Any rename/delete on `apps/strapi/src/api/page/content-types/page/schema.json` triggers column drops on boot. Add-only on the dynamic-zone array is safe.

## See also

- `workflow.md` — full per-phase procedure with code blocks
- `examples.md` — attribute patterns, CKEditor, populate-rule shapes
- `add-content-type` — when the new thing should be a top-level API resource
- `add-ui-component` — generic UI primitives
- `strapi-schema-check` — pre-PR schema risk validation
