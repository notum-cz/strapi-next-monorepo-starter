---
name: consolidate-patterns
description: 'Use as a checkpoint after building several page-builder components, to remove duplication — e.g. "consolidate patterns", "extract reusable", "dedupe components", "review components for shared patterns". Extracts JSX/Tailwind repeated across 2+ components into shared elementary components. React-only — never touches Strapi schemas.'
argument-hint: "[ComponentA ComponentB …]"
---

# Consolidate Patterns

Review recently built page-builder components, find JSX/Tailwind patterns repeated across 2+ of them, extract each into a shared elementary component, and update the call sites. **React-only — never modify Strapi schemas.**

## Inputs

- Component names or paths, or none.
- `min_occurrences` — a pattern must appear in at least this many components (default `2`).

Resolve names to `apps/ui/src/components/page-builder/components/**/Strapi*.tsx`. If no components are given, fall back to recent git history:

```bash
git log --oneline --diff-filter=A --name-only -20 -- 'apps/ui/src/components/page-builder/components/**/Strapi*.tsx'
```

If still none, report "nothing to review" and stop.

## Steps

1. **Read** each component in full.
2. **Detect repeats** of three kinds: identical JSX structures (same element hierarchy, differing only in content/className), repeated Tailwind class groups on structurally similar elements, and repeated sub-component compositions. For each, record which components contain it, the fragment, the occurrence count, and a proposed component name.
3. **Filter** out anything below `min_occurrences`. If nothing remains, report "no consolidation needed" and stop.
4. **Extract** each remaining pattern into `apps/ui/src/components/elementary/<Name>.tsx`, matching local conventions (see `add-ui-component`): `cn()` from `@/lib/styles`, `readonly`-typed props, a named export, design tokens from `packages/design-system` (no raw hex). Keep the extraction **concrete** — a direct lift of the repeated JSX, not a generalized framework. Update every source component to import and use it; the rendered HTML must be byte-for-byte identical.
5. **Showcase (optional)** — if a dev page fits (under `apps/ui/src/app/[locale]/dev/`), add a usage example. Skip silently if none applies.
6. **Quality gates**:

   ```bash
   pnpm --filter @repo/ui exec tsc --noEmit
   pnpm --filter @repo/ui lint
   ```

   Fix any failures before reporting done.

7. **Report** patterns found (with counts), elementary components created (with paths), call sites updated, and patterns skipped (below threshold).

## Constraints

- Never extract a one-off — a pattern must repeat to justify a shared component.
- Never modify Strapi schemas — this is React refactoring only.
- Rendered output must be identical before and after.
- Don't over-abstract — no speculative props or variants the call sites don't use.
- Leave the commit to the user (don't auto-commit).

## See also

- `add-ui-component` — elementary component conventions and templates.
- `create-content-component` — the skill that builds the page-builder components this one reviews.
- `apps/docs/docs/page-builder/introduction.md` — component architecture.
