---
name: add-ui-component
description: >
  Use when adding a generic UI primitive, elementary block, or form
  field in `apps/ui` — e.g. "new ui component", "add component",
  "create react component", "new shadcn component", "add form field".
  Not for Strapi page-builder sections; use `create-content-component`.
argument-hint: "[ComponentName]"
paths:
  - apps/ui/src/components/elementary/**
  - apps/ui/src/components/forms/**
  - apps/ui/src/components/typography/**
  - apps/ui/src/components/helpers/**
  - apps/ui/src/components/layouts/**
  - apps/ui/src/components/providers/**
  - apps/ui/src/components/ui/**
---

# Add a UI Component

Scaffold a React component in `apps/ui/src/components/` to the starter's conventions. shadcn/ui is configured in `apps/ui/components.json` (new-york, slate, RSC, lucide, `cn()` from `@/lib/styles`). Background: `apps/docs/docs/ui/project-structure.md`, `apps/docs/docs/design-system/overview.md`.

## Phase 1 — Pick the category

| Category        | When                                                           | File name        |
| --------------- | -------------------------------------------------------------- | ---------------- |
| `ui/`           | shadcn primitives (Button, Input, Dialog) — prefer the CLI     | `kebab-case.tsx` |
| `elementary/`   | app-specific reusable blocks (Container, Breadcrumbs, AppLink) | `PascalCase.tsx` |
| `forms/`        | react-hook-form fields, `App*` prefix, built on `ui/form`      | `PascalCase.tsx` |
| `typography/`   | Heading, Paragraph, Lead                                       | `PascalCase.tsx` |
| `helpers/`      | server/client boundary shims                                   | `PascalCase.tsx` |
| `layouts/`      | page shells composing sections                                 | `PascalCase.tsx` |
| `providers/`    | context / SDK wrappers                                         | `PascalCase.tsx` |
| `page-builder/` | Strapi sections — **stop, use `create-content-component`**     | —                |

Default to `elementary/` for app reusables, `ui/` only for true primitives. Ask if unclear. Match the closest sibling's export style.

## Phase 2 — Server vs client

Default to a **server component**. Add `"use client"` only for hooks, event handlers, browser APIs, or client-only libraries (react-hook-form, Framer Motion). Form fields are always client; layout shells usually server.

## Phase 3 — Scaffold

**`ui/` primitive** — prefer the CLI:

```bash
pnpm --filter @repo/ui exec shadcn@latest add <name>
```

Post-install fixup (review generated files):

1. `cn()` import must be `@/lib/styles`, not the upstream default `@/lib/utils` — the most common breakage on upgrades.
2. Radix: both the unified `radix-ui` and scoped `@radix-ui/react-*` packages coexist here — match the sibling, don't force-convert.
3. Tokens: CSS vars live in `apps/ui/src/styles/globals.css` + `packages/design-system/src/theme.css`; prefer them over shadcn defaults. No `tailwind.config.js` — never create one.
4. Keep `"use client"` on interactive primitives.
5. If the file already exists in `components/ui/`, diff and merge — don't overwrite.

Hand-rolling a `ui/` primitive: follow an existing one in `apps/ui/src/components/ui/` (`forwardRef` + `cva` variants + `cn()`).

**`elementary/`**:

```tsx
import { cn } from "@/lib/styles"

export function ComponentName({
  children,
  className,
}: {
  readonly children: React.ReactNode
  readonly className?: string
}) {
  return <div className={cn("base-classes", className)}>{children}</div>
}
```

Ref: `Container.tsx`, `Breadcrumbs.tsx`.

**`forms/` field** — `App` prefix, `useFormContext`, built on `@/components/ui/form`:

```tsx
"use client"

import { useFormContext } from "react-hook-form"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function AppFieldName({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>{/* input */}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

**Provider / layout / helper** — no fixed template; match the closest sibling.

## Phase 4 — Conventions

- `cn()` from `@/lib/styles` for all class merging; `@/` alias = `apps/ui/src/` (no deep relative imports, no barrel files).
- Design tokens only (`text-primary`, `bg-secondary`, `border-input`) — no hex. Tailwind v4 (CSS-first config). Lucide icons. Mobile-first (`sm:`/`md:`/`lg:`).
- `forwardRef` only for `ui/` primitives that need it (Radix composition) — not elsewhere.
- Wrap full-bleed sections in `<Container>` from `@/components/elementary/Container`.

## Phase 5 — Showcase (elementary / atomic only)

The starter has no Storybook — the in-app `/dev/showcase` gallery is its lightweight equivalent (see `apps/docs/docs/ui/built-in-pages/showcase.md`). When the component is a reusable elementary/atomic primitive, register it there:

1. Add a section wrapper at `apps/ui/src/app/[locale]/dev/showcase/components/sections/<Name>Section.tsx` rendering the component's variants/states.
2. Add an entry in `apps/ui/src/app/[locale]/dev/showcase/showcaseItems.tsx` with `kind: "atomic"`, an `id`, `label`, and `description`.

(Page-builder sections appear in the same showcase with `kind: "component"` — handled by `create-content-component`.)

## Phase 6 — Verify

1. `pnpm --filter @repo/ui lint`
2. `pnpm --filter @repo/ui exec tsc --noEmit`
3. `pnpm --filter @repo/ui dev` → render the consumer (or `/dev/showcase`) → confirm visual output.
4. Pure logic or a utility hook? Add a `*.test.ts` next to it — use `write-tests`.

## Notes

- **Page-builder sections live elsewhere** — components rendered from Strapi dynamic zones use a different scaffold; switch to `create-content-component`.
- **shadcn upgrades** — re-run the CLI rather than hand-editing, to keep diffs reviewable against upstream. Official refs: [docs](https://ui.shadcn.com/docs), [components](https://ui.shadcn.com/docs/components), [Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4), [LLM docs](https://ui.shadcn.com/llms.txt).
- **React / Next.js standards** — apply the vendored `vercel-react-best-practices`, `next-best-practices`, and `frontend-design` skills (in `.agents/skills/`) for performance, RSC boundaries, and visual design.
