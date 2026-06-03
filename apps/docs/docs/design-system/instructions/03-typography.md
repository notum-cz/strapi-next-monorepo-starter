# Typography

Typography should be defined before section components are implemented. The goal is to avoid adding one-off heading and paragraph styles during development.

Relevant files in this repository:

- `apps/ui/src/lib/fonts.ts`
- `apps/ui/src/app/[locale]/layout.tsx`
- `apps/ui/src/components/typography/index.tsx`
- `apps/ui/src/components/typography/config.ts`
- `apps/strapi/src/admin/ckeditor/headings.ts`
- `packages/design-system/src/custom-styles.css`
- `packages/design-system/src/theme.css`

## Collect Variants First

Before implementation, collect all typography variants used in Figma or the existing website:

- Headings.
- Paragraphs.
- Captions.
- Labels.
- Buttons.
- Rich text styles.
- Navigation items.
- Mobile variants.
- Italic or cursive variants.

Define the complete typography system upfront when possible. Adding variants ad hoc during development makes rich text, CMS content, and component styling drift apart.

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

If the font has a dedicated italic or cursive file, import that file instead of relying only on `font-style: italic`.

## Font Variables

The `variable` value is important:

```ts
variable: "--font-roboto"
```

Without it, the font cannot be reused cleanly inside CSS variables, Tailwind utilities, or typography variants.

Register the CSS variable in `packages/design-system/src/theme.css` when the design system should expose it through Tailwind:

```css
@theme static {
  --font-sans: var(--font-roboto), sans-serif;
}
```

For file-based fonts, always define the font variable in `packages/design-system/src/theme.css` and export it through the design-system build output. The font is then available from one shared source for both the frontend and Strapi integrations such as CKEditor. Do not redefine the same font separately in the frontend and Strapi, because the editor preview and frontend rendering can drift apart.

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

This is important for Next.js App Router rendering because the server-rendered HTML and hydrated client output should use the same font setup. Adding the font class only inside nested pages or client components can cause visible font changes and layout shifts.

Use both:

- The font variable, for CSS variable access.
- The Tailwind font utility, for default font application.

## Typography Styles

Reusable typography classes are defined in:

```text
packages/design-system/src/custom-styles.css
```

Typography styles should be defined per variant with Tailwind utilities. Put font family, font weight, spacing, and related properties directly on the variant when they are part of that variant's visual contract.

Current simplified examples:

```css
.typo-h1 {
  @apply mb-2 text-4xl md:text-5xl lg:text-6xl;
}

.typo-p-medium {
  @apply mb-0.5 text-sm;
}
```

Typography variants should also work inside rich text output. That is why the current selectors include CKEditor, TipTap, raw heading tags, and `.typo-*` classes.

When changing selector groups, preserve class names and selector order so CKEditor content, TipTap content, frontend rich text, and the Typography component keep matching.

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

Projects can add content-context variants such as `page` or `blog` either as new typography classes or as CKEditor wrapper variants. Choose the simpler option for the project and keep it documented.

## Typography Config

Frontend semantic text should use the shared Typography component:

```text
apps/ui/src/components/typography/index.tsx
```

The component is used for semantic text elements:

- `h1`
- `h2`
- `h3`
- `h4`
- `h5`
- `h6`
- `p`

It lets the caller choose:

- The rendered HTML tag.
- The visual typography variant.
- Optional text color and font weight variants.

Available variants are mapped in:

```text
apps/ui/src/components/typography/config.ts
```

This config contains:

- `variantStyles`
- `textColorVariants`
- `fontWeightVariants`
- `defaultStyles`

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

Add a new typography style by updating the CSS class and the config mapping together.

## CKEditor Sync

When typography classes are changed or redefined, the same changes must be reflected in Strapi so editor previews match frontend rendering.

CKEditor typography options are configured in:

```text
apps/strapi/src/admin/ckeditor/headings.ts
```

The `styleVariants` constant must match frontend typography variants from `apps/ui/src/components/typography/config.ts`.

Current structure:

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

This setup ensures:

- Semantic HTML tags behave correctly.
- Custom typography classes are applied consistently.
- CKEditor previews match frontend output.
- Content rendered from Strapi keeps the same visual language as hand-authored frontend components.

For broader editor setup, see [Rich Text Editors](./04-rich-text-editors.md).

## Change Checklist

When adding or changing a typography variant, update the relevant files together:

- `packages/design-system/src/custom-styles.css` for the actual `.typo-*` styles and rich text selectors.
- `apps/ui/src/components/typography/config.ts` for `variantStyles`, `defaultStyles`, and optional color or weight variants.
- `apps/strapi/src/admin/ckeditor/headings.ts` when CKEditor should expose the variant to editors.
- `packages/design-system/src/theme.css` if the change needs new font, color, or spacing tokens.

## Color And Weight Decisions

Decide which values belong directly in a typography variant and which should stay configurable.

For headings, fixed `font-family`, `font-weight`, and color often make sense because heading styles should remain visually consistent.

For rich text, hardcoding these values can reduce flexibility. Rich text content often receives styling from a Strapi component, page-builder wrapper, or theme setting.

Before adding a variant, decide:

- Is the visual style globally reusable?
- Is it tied to a specific section?
- Should editors control color or font weight from the CMS?
- Should the style apply inside rich text?
- Is the HTML tag separate from the visual variant?

Avoid overriding typography with `!important`. Prefer creating a named variant when a new visual style is needed.

## Heading Tags And Visual Variants

Do not assume that every `h2` should look the same on every page. Some designs use the same semantic HTML tag with different visual treatment.

When that happens, name variants by design intent, not only by HTML tag. The semantic tag should support document structure and accessibility, the visual variant should describe appearance.

Example:

```tsx
<Typography tag="h2" variant="heading1">
  Large visual heading with correct page hierarchy
</Typography>
```

## Checklist

Use the [Fonts And Typography checklist](../checklist.md#fonts-and-typography) before starting or reviewing typography work.
