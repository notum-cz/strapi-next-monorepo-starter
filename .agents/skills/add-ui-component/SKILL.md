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

Scaffold a new React component in `apps/ui/src/components/` matching the starter's conventions. shadcn/ui is configured in `apps/ui/components.json` — **new-york** style, **slate** baseColor, RSC enabled, lucide icons, `cn()` from `@/lib/styles`.

## Phase 1 — Pick the category

| Category        | Location                  | When                                                                                         |
| --------------- | ------------------------- | -------------------------------------------------------------------------------------------- |
| `ui/`           | shadcn primitives         | Generic reusable primitives (Button, Input, Dialog, Form). Add via shadcn CLI when possible. |
| `elementary/`   | App building blocks       | App-specific blocks (Container, Breadcrumbs, AppLink, DatePicker).                           |
| `forms/`        | Form fields               | react-hook-form-bound fields. `App*` prefix. Build on shadcn `form` primitives.              |
| `typography/`   | Text components           | Heading, Paragraph, Lead, etc.                                                               |
| `helpers/`      | Wrappers / utility        | Server/client boundary shims like `UseSearchParamsWrapper`.                                  |
| `layouts/`      | Page-level layout         | Shells composing sections (e.g. `StrapiPageView`).                                           |
| `providers/`    | Context / SDK wrappers    | `ClientProviders`, `ServerProviders`, `TrackingScripts`.                                     |
| `page-builder/` | Strapi-connected sections | **Do not add here directly** — use `create-content-component`.                               |

Default: ask the user if unclear. Bias toward `elementary/` for app-specific reusables, `ui/` only for true primitives.

## Phase 2 — Naming

- Filename: `PascalCase.tsx` for elementary/forms/typography/helpers/layouts/providers (matches existing files).
- Filename: `kebab-case.tsx` for `ui/` (shadcn convention — `button.tsx`, `input.tsx`).
- Form fields use `App` prefix (`AppInput`, `AppSelect`, `AppField`).
- One default export OR named export — match the closest sibling's pattern.

## Phase 3 — Decide RSC vs Client

Default to **server component** (no `"use client"`).

Add `"use client"` only if the component needs:

- React hooks (`useState`, `useEffect`, `useContext`, `useRef`)
- Event handlers (`onClick`, `onChange`, …)
- Browser APIs (`window`, `document`, `localStorage`)
- Third-party client-only libraries (Framer Motion `motion`, react-hook-form, etc.)

Form fields are always client. Layout shells are usually server.

## Phase 4 — Scaffold

### shadcn primitive (`ui/`)

Prefer the shadcn CLI when the primitive exists upstream:

```bash
pnpm --filter @repo/ui exec shadcn@latest add <name>
```

When hand-rolling:

```tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/styles"

const componentVariants = cva("inline-flex items-center justify-center", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
    },
    size: {
      default: "h-10 px-4",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
})

export interface ComponentNameProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  )
)
ComponentName.displayName = "ComponentName"

export { ComponentName, componentVariants }
```

### Elementary (`elementary/`)

```tsx
import { cn } from "@/lib/styles"

type Props = {
  children: React.ReactNode
  className?: string
}

export function ComponentName({ children, className }: Props) {
  return <div className={cn("base-classes", className)}>{children}</div>
}
```

Ref: `apps/ui/src/components/elementary/Container.tsx`, `Breadcrumbs.tsx`, `DatePicker.tsx`.

### Form field (`forms/`)

`App` prefix, builds on `@/components/ui/form` primitives, uses `useFormContext` from `react-hook-form`.

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

type Props = {
  name: string
  label: string
}

export function AppFieldName({ name, label }: Props) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>{/* field input */}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

### Provider / layout / helper

Match the closest existing sibling. No fixed template — function component, props typed, `cn()` for classes if any.

## Phase 5 — Conventions (apply to all categories)

- **`cn()` always.** Import from `@/lib/styles` (the aliased path per `components.json`).
- **Path alias `@/`** maps to `apps/ui/src/`. Never use deep relative imports across categories.
- **Design tokens, not raw colors.** Use `text-primary`, `bg-secondary`, `border-input` — defined as CSS variables. No hex codes.
- **Tailwind v4.** No `tailwind.config.ts` — config is CSS-first in `apps/ui/src/styles/globals.css`.
- **Lucide icons.** Configured via `components.json` (`"iconLibrary": "lucide"`).
- **Responsive.** Mobile-first. `sm:`, `md:`, `lg:` prefixes for breakpoints.
- **Wrap full-bleed sections** in `<Container>` from `@/components/elementary/Container`.

## Phase 6 — Wire-up

- Import the component where it's consumed using the `@/` alias.
- No barrel files — import directly (`import { Foo } from "@/components/elementary/Foo"`).
- If the component is page-builder-bound, **stop** and switch to `create-content-component` instead.

## Phase 7 — Verify

1. `pnpm --filter @repo/ui lint` — no eslint errors.
2. `pnpm --filter @repo/ui exec tsc --noEmit` — no type errors.
3. `pnpm --filter @repo/ui dev` → render the consumer page → confirm visual output.
4. If a test makes sense (pure logic, utility hook), add a `*.test.ts` next to it — use `write-tests` skill.

## Checklist

- [ ] Category chosen, file in correct dir
- [ ] Naming matches category convention (kebab for `ui/`, Pascal elsewhere; `App` prefix for forms)
- [ ] `"use client"` present only if needed
- [ ] `cn()` used for class merging
- [ ] Props typed (no `any`)
- [ ] Design tokens used (no raw hex colors)
- [ ] `pnpm --filter @repo/ui lint && tsc --noEmit` clean
- [ ] Consumer renders OK in dev

## Notes

- **No Storybook in this starter.** Don't scaffold `.stories.tsx`. Visual review happens in the running app or Playwright visual tests.
- **No `forwardRef` for non-primitive components.** Only `ui/` primitives that need ref forwarding (for Radix / shadcn composition).
- **Page-builder sections live elsewhere.** Components rendered from Strapi dynamic zones are stack-coupled and use a different scaffold — switch to `create-content-component`.
- **shadcn upgrades.** When updating a shadcn primitive, re-run the CLI rather than hand-editing — keeps diffs reviewable against upstream.
