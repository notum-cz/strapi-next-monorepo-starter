# Showcase — purpose and workflow

The `/dev/showcase` page in the dev area is a lightweight brand manual and mini-storybook. It serves three audiences:

- Developers: quick visual testbed for Strapi page-builder components and UI primitives.
- Content creators / content fillers: preview of components with example content and guidance on which fields to fill in Strapi.
- Stakeholders / designers: a browsable preview of layouts and variants without needing to open the CMS.

The Showcase is intentionally developer-friendly: it renders mocked versions of Strapi components (so you don't need to be connected to a production Strapi instance) and small example pages for atomic UI primitives.

## What belongs in the Showcase

- Strapi page-builder sections (mocked wrappers named `Mocked*Component`) — one file per real Strapi section found in `apps/ui/src/components/page-builder/components/sections`.
- Atomic sections that demonstrate UI primitives (Inputs, Buttons, Selects, Dialogs, Tooltips, etc.).
- Simple examples for interactive components so developers and content authors can see expected behavior.

## How to add a new component to the Showcase

Follow these steps when you add a new page-builder component in Strapi:

1. Implement the Strapi component schema and frontend React component as usual (see `create-content-component` skill).
2. Add a mocked component file in the Showcase folder:

```txt
apps/ui/src/app/[locale]/dev/showcase/strapiComponents/Mocked{Name}.tsx
```

### Minimal mocked component pattern (current workflow)

- Import the real frontend `Strapi{Name}` component.
- Create a `data` object shaped as:

```ts
Data.Component<"{category}.{name}">
```

- For fields that are rendered with a richtext editor in production (CKEditor), provide HTML strings.

Example:

```html
<p>Some <strong>HTML</strong></p>
```

- For images, use the shared mock image helper exported from:

```txt
apps/ui/src/app/[locale]/dev/showcase/components/StrapiImage.tsx
```

Named exports:

```ts
mockImage
mockIcon
```

- Export a default React component that renders the `Strapi{Name}` directly with the mock `data`.

No `ManualSection` or `ManualItem` wrappers are required anymore.

### Example mocked component

```tsx
// apps/ui/src/app/[locale]/dev/showcase/strapiComponents/MockedHero.tsx

import StrapiHero from "@/components/page-builder/sections/StrapiHero"

const data: Data.Component<"sections.hero"> = {
  /* minimal mock */
}

export default function MockedHero() {
  return <StrapiHero data={data} />
}
```

## Registration (how the Showcase finds your mock)

1. Open:

```txt
apps/ui/src/app/[locale]/dev/showcase/showcaseItems.tsx
```

2. Import your mocked component.
3. Add an entry to the exported `items` array so the Showcase page picks it up and shows it in the menu.

### Example registration

```tsx
import MockedHero from "./strapiComponents/MockedHero"

export const items = [
  {
    id: "sections.hero",
    title: "Hero",
    category: "Sections",
    component: MockedHero,
  },

  // ...other items
]
```

The Showcase build will render the `component` you register.

This central registration replaces the old `componentsAnchors` list in `page.tsx`.

## Showcase conventions

### Props typing

Cast the `data` object to:

```ts
Data.Component<"{category}.{name}">
```

to keep TypeScript happy.

### Richtext

Mock with HTML strings (not plain text) to match CKEditor rendering.

### Images

Import `mockImage` and `mockIcon` from the shared `StrapiMedia` helper.

### Registration

Instead of adding anchors in `page.tsx`, register the mocked component in:

```txt
showcaseItems.tsx
```

The Showcase reads that registry to build the menu and render entries.

## Why this helps

- Quickly preview new components without running a live Strapi content instance.
- Keep deterministic example content for design reviews and QA.
- Provide content creators with concrete examples they can copy into the CMS.

## Troubleshooting

- If you see rendering errors, check that mocked data shape matches:

```ts
Data.Component<"{category}.{name}">
```

and that nested components use the correct `populate` rules in Strapi.

- If a UI primitive relies on specific Radix structure (for example `SelectTrigger` + `SelectContent`), mimic that structure in the mock.
