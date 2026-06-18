---
sidebar_position: 5
---

# Typography

Define typography before section components are implemented. The goal is to keep headings, paragraphs, rich text, and CMS editor previews using the same visual language instead of adding one-off text styles during development.

Relevant files in this repository:

- `apps/ui/src/lib/fonts.ts`
- `apps/ui/src/app/[locale]/layout.tsx`
- `apps/ui/src/components/typography/index.tsx`
- `apps/ui/src/components/typography/config.ts`
- `apps/strapi/src/admin/ckeditor/headings.ts`
- `packages/design-system/src/custom-styles.css`
- `packages/design-system/src/theme.css`

:::tip Start With The Design
List the real text variants from Figma or the existing website before adding CSS. Missing this step usually creates duplicate heading classes, mismatched rich text styles, and CMS options editors should not need.
:::

## Variants

Collect the variants the project actually needs:

- Headings and display headings.
- Paragraph sizes.
- Captions and labels.
- Button and navigation text.
- Rich text defaults.
- Mobile-specific adjustments.
- Italic, cursive, or decorative variants.

Name variants by visual intent when possible. Semantic HTML tags still control document structure and accessibility, while the visual variant controls appearance.

```tsx
<Typography tag="h2" variant="heading1">
  Large visual heading with correct page hierarchy
</Typography>
```

Do not assume every `h2` must look the same everywhere. If the design uses the same semantic tag with different visual treatment, create a named variant instead of overriding styles locally.

## Font Imports

Font imports are defined in:

```text
apps/ui/src/lib/fonts.ts
```

Current example:

```ts
import { Roboto } from "next/font/google"

export const fontRoboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"],
  variable: "--font-roboto",
})
```

For local fonts, import every required weight and style explicitly:

```ts
import localFont from "next/font/local"

export const fontMallory = localFont({
  variable: "--font-mallory",
  src: [
    {
      path: "../fonts/Mallory-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Mallory-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
})
```

If the font has a dedicated italic or cursive file, import that file instead of relying only on browser-generated `font-style: italic`.

Register the CSS variable in `packages/design-system/src/theme.css` when the design system should expose it through Tailwind:

```css
@theme static {
  --font-sans: var(--font-roboto), sans-serif;
}
```

:::info Font Variables
Always set the `variable` option in `next/font`. Without it, the font cannot be reused cleanly through CSS variables, Tailwind utilities, or generated editor styles.
:::

## Root Layout

Attach font variables at the root layout level:

```tsx
<body className={cn("min-h-screen font-sans antialiased", fontRoboto.variable)}>
  {children}
</body>
```

In this repository this happens in:

```text
apps/ui/src/app/[locale]/layout.tsx
```

Use both:

- The font variable, for CSS variable access.
- The Tailwind font utility, for default font application.

Adding the font class only inside nested pages or client components can cause visible font changes and layout shifts.

## Shared Styles

Reusable typography classes are defined in:

```text
packages/design-system/src/custom-styles.css
```

Typography styles should be defined per variant with Tailwind utilities. Put font family, font weight, spacing, and related properties directly on the variant when they are part of that variant's visual contract.

Simplified examples:

```css
.typo-h1 {
  @apply mb-2 text-4xl md:text-5xl lg:text-6xl;
}

.typo-p-medium {
  @apply mb-0.5 text-sm;
}
```

Typography variants should also work inside rich text output. That is why the selectors can include CKEditor, TipTap, raw heading tags, and `.typo-*` classes.

When changing selector groups, preserve class names so CKEditor content, TipTap content, frontend rich text, and the Typography component keep matching.

Example structure:

```css
.ck-editor-rich-text-page h1,
.ck-editor-rich-text-page .typo-h1,
.ck-editor-rich-text-blog h1,
.ck-editor-rich-text-blog .typo-h1,
.ck-editor__main .ck-content h1,
.ck-editor__main .ck-content .typo-h1,
.typo-h1 {
  @apply mb-2 text-6xl;
}
```

For broader editor setup, see [Rich Text Editors](/docs/design-system/rich-text-editors).

## Typography Component

Frontend semantic text should use the shared Typography component:

```text
apps/ui/src/components/typography/index.tsx
```

It lets the caller choose:

- The rendered HTML tag.
- The visual typography variant.
- Optional text color and font weight variants.

Available variants are mapped in:

```text
apps/ui/src/components/typography/config.ts
```

Example:

```ts
export const variantStyles = {
  heading1: "typo-h1",
  heading2: "typo-h2",
  heading3: "typo-h3",
  heading4: "typo-h4",
  heading5: "typo-h5",
  heading6: "typo-h6",
  small: "typo-p-small",
  medium: "typo-p-medium",
  large: "typo-p-large",
}
```

Default variants are defined per tag in `defaultStyles`, so components usually do not need to specify a variant explicitly.

:::tip Keep Tags And Variants Separate
Use the `tag` for semantic structure and the `variant` for visual style. This keeps accessibility decisions separate from design decisions.
:::

## CMS Sync

When typography classes are changed or redefined, update Strapi options only when editors should be able to select the variant.

CKEditor typography options live in:

```text
apps/strapi/src/admin/ckeditor/headings.ts
```

The `styleVariants` constant should mirror the frontend variants exposed to content editors:

Simplified structure:

```ts
const styleVariants = [
  { label: "Default", class: "typo-none" },
  { label: "Heading 1", class: "typo-h1" },
  { label: "Heading 2", class: "typo-h2" },
  { label: "Paragraph Small", class: "typo-p-small" },
  { label: "Paragraph Medium", class: "typo-p-medium" },
  { label: "Paragraph Large", class: "typo-p-large" },
] as const
```

## Variant Decisions

Decide which values belong directly in a typography variant and which should stay configurable.

For headings, fixed font family, weight, and color often make sense because heading styles should remain visually consistent.

For rich text, hardcoding these values can reduce flexibility. Rich text content often receives styling from a Strapi component, page-builder wrapper, or theme setting.

Before adding a variant, decide:

- Is the visual style globally reusable?
- Is it tied to a specific section?
- Should editors control color or font weight from the CMS?
- Should the style apply inside rich text?
- Is the HTML tag separate from the visual variant?

Avoid overriding typography with `!important`. Prefer creating a named variant when a new visual style is needed.

:::caution Avoid Local Overrides
If several components need the same text style, add a typography variant. Local Tailwind overrides make frontend components and CMS-rendered content drift apart.
:::

## Change Checklist

When adding or changing a typography variant, update the relevant files together:

- `packages/design-system/src/custom-styles.css` for `.typo-*` styles and rich text selectors.
- `apps/ui/src/components/typography/config.ts` for `variantStyles`, `defaultStyles`, and optional color or weight variants.
- `apps/strapi/src/admin/ckeditor/headings.ts` when CKEditor should expose the variant to editors.
- `packages/design-system/src/theme.css` if the change needs new font, color, or spacing tokens.
