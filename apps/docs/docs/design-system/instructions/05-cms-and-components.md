# CMS And Components

The design system should connect Figma, frontend components, and Strapi content modeling. Editors should see names and options that match the real design system.

Use this page when deciding how a visual pattern becomes:

- A frontend component.
- A Strapi component.
- A Strapi single type.
- A page-builder section.
- A shared token or utility.

## Naming Across Design, Code, And CMS

Keep names aligned across all layers:

| Layer               | Example                                |
| ------------------- | -------------------------------------- |
| Figma component     | `Hero / Image Left`                    |
| Strapi component    | `sections.hero`                        |
| React component     | `StrapiHero`                           |
| Variant prop (enum) | `imageLeft` or `imagePosition: "left"` |
| Editor label        | `Image position`                       |

Avoid using different words for the same concept. If the design calls it `heading`, avoid using `title` in one component and `headline` in another without a clear reason.

For page-builder naming conventions, see [Page Builder](../../page-builder/introduction.md).

## What Belongs In Strapi

Put a field in Strapi when editors need to manage it as content or configuration.

Good Strapi candidates:

- Headings and body copy.
- CTA labels and links.
- Images and media.
- Repeated section items.
- Global content such as navbar, footer, cookie banner, or newsletter.
- Clear visual variants that editors are expected to choose.

Avoid putting purely technical styling details in Strapi. Editors should not need to understand implementation-specific layout internals.

## Strapi Editor Experience

CMS modeling is not finished when the schema exists. Editors should understand what each field does and how much freedom they have.

For editor-facing fields, define:

- Clear labels that match Figma and frontend naming.
- Helpful descriptions for fields that are not obvious.
- Sensible default values where the design system has a recommended default.
- Field order that follows the way editors think about content.
- Limited enum values for visual variants instead of open-ended strings.
- Required fields only where missing content would break the component.
- Placeholder text when it helps explain expected content shape.

Avoid exposing implementation details such as internal class names, token names, or layout mechanics. Editors should choose from meaningful options such as `Default`, `Muted` background, or `Large` spacing, not implementation names like `py-24` or `bg-slate-100`.

## Single Types

Use single types for global reusable content or configuration:

- Navbar.
- Footer.
- Cookie banner.
- Site-wide newsletter block.
- Global legal note.
- Social links.

Before creating a single type, check whether the content is truly global or whether pages need independent variants.

If layout elements differ across pages, decide whether the project needs:

- One global layout.
- Multiple layout variants.
- Page-specific section composition.
- A collection type instead of a single type.

## Page Builder Components

Use page-builder components for content sections that editors compose on pages.

Before implementing a new section, decide:

- Is the pattern repeated?
- Does it need CMS editing?
- Are variants clear and finite?
- Does it depend on shared typography, color, spacing, or container tokens?
- Does it require a new Strapi schema?
- Will changing it affect generated Strapi types?

## Shared Section Configuration

If the same section-level configuration appears in multiple sections, define it once as a shared CMS pattern instead of recreating similar fields in every Strapi component.

Shared section configuration usually includes:

- Section spacing configuration, such as top and bottom padding variants.
- Background configuration, such as color, image, gradient, pattern, or dark/light variant.
- Container configuration, such as width, alignment, or whether content should be constrained.
- Decorative configuration, such as corner cuts, dividers, overlays, badges, or animated elements.

For each shared pattern, define only the essentials:

- Where the Strapi schema lives.
- Which frontend wrapper, helper, or renderer applies it.
- Which variants editors can choose.
- Whether it is required for every section or only used where the design needs it.

For example, if most sections need top padding, bottom padding, and background variant controls, model those fields once as shared section configuration. This keeps editor options consistent and prevents section renderers from drifting away from the design system.

## Shadcn And Atomic Components

Base UI primitives live in:

```text
apps/ui/src/components/ui
```

Use these as the starting point for atomic UI:

- Buttons.
- Inputs.
- Selects.
- Dialogs.
- Accordions.
- Tabs.
- Tooltips.
- Form controls.

Project-specific styling should usually be expressed through variants and shared tokens, not by duplicating primitives.

Before adding a new utility, hook, helper, component, or type, check whether an equivalent already exists in `apps/ui` or `packages/*`.

## Component States

Design-system components should define more than the default state. Before a component is considered reusable, confirm the states that apply to it:

- Default.
- Hover.
- Focus and focus-visible.
- Active or selected.
- Disabled.
- Loading.
- Error or invalid.
- Empty state.
- Dark mode, if supported.

This is especially important for buttons, links, forms, tabs, accordions, dialogs, cards, and CMS-driven CTAs.

State styling should use shared tokens and existing component variants where possible. Avoid local one-off state classes that make the same button, input, or card behave differently in each section.

## Icons And Decorative Assets

Decide how icons, symbols, and decorative assets are handled to avoid multiple approaches per section.

Clarify:

- Whether icons come from `lucide-react`, Radix icons, custom SVG files, uploaded CMS media, or another source.
- Whether icons should use `currentColor` so color follows text and theme tokens.
- How dark mode variants are handled for SVGs and images.
- Which decorative assets are hardcoded in frontend components and which are configurable in Strapi.
- How repeated decorations such as dividers, corner cuts, badges, or symbols are named and reused.
- Whether decorative images need alt text or should be hidden from assistive technology.

Prefer a small number of documented icon and decoration patterns. If every section imports or uploads decorative assets differently, visual consistency and accessibility become difficult to maintain.

## Component Flexibility

Prefer explicit, bounded variants over open-ended component APIs.

Good examples:

```ts
type HeroVariant = "default" | "imageLeft" | "imageRight"
type SectionBackground = "default" | "muted" | "brand"
```

Risky examples:

```ts
interface HeroProps {
  imagePosition?: "left" | "right"
  reverse?: boolean
  compact?: boolean
  hasDifferentSpacing?: boolean
}
```

One prop should control one concept. If a prop changes image position, spacing, text alignment, and background at once, it should probably be a named variant instead.

## Accessibility

Clarify accessibility rules before implementation:

- Heading hierarchy should be semantic, even when visual variants differ.
- Text colors must meet contrast requirements.
- Interactive components need keyboard and focus states.
- Rich text should not allow inaccessible color combinations.
- Images need meaningful alt text rules.
- Motion should respect reduced-motion preferences when relevant.
- Component variants should work with long translated content.

Accessibility is easier to preserve when tokens, typography variants, and CMS options are intentionally limited.

## Checklist

Use the [CMS Modeling checklist](../checklist.md#cms-modeling) and [Frontend Components checklist](../checklist.md#frontend-components) before starting or reviewing CMS component work.
