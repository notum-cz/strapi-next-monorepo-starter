---
sidebar_position: 4
---

# Components Showcase

Route: `/dev/showcase`

:::warning Non-production only
Built-in `/dev` pages are available only outside production. The shared `/dev` layout returns `notFound()` when `isProduction()` is true; see [Environment Helpers](../environment-variables.md#environment-helpers).
:::

The Showcase is a small in-app component gallery. It is useful when you want to see how page-builder sections and shared UI primitives look without creating real Strapi content for every case.

Think of it as a **lightweight Storybook** that ships with the app:

- Developers can test components with stable mock data.
- Designers and stakeholders can review visual variants in the real UI shell.
- Content editors can see examples of what a component is supposed to become on the page.

## Why It Is Useful

Strapi page-builder components are often hard to review in isolation because they need CMS data. The Showcase removes that friction: each component gets a small mocked example, so visual changes can be checked quickly and repeatedly.

It is especially useful before QA, during design reviews, or when adding a new section to the page builder.

Use the Showcase together with the [Design System docs](/docs/design-system) when reviewing typography, shared tokens, component states, and CMS-facing variants.

## Adding a Component

1. Create a mock component in:

```txt
apps/ui/src/app/[locale]/dev/showcase/components/strapiComponents
```

2. Render the real `Strapi*` component with mock data.
3. Register it in `showcaseItems.tsx`.

Use `Data.Component<"{category}.{name}">` for mocked Strapi component data. For rich text fields, use HTML strings so the mock behaves like CKEditor content.

When adding mocked variants, keep the options aligned with [CMS And Components](/docs/design-system/cms-and-components#variants).

Mock media helpers are available in:

```txt
apps/ui/src/app/[locale]/dev/showcase/components/StrapiMedia.tsx
```

## Related Pages

- [Pages Overview](./pages-overview.md) shows which components are used on each published page.
- [Components Overview](./components-overview.md) shows where each component UID is used.
