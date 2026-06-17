---
sidebar_position: 1
slug: /design-system
---

# Design System

The design system in this repository is shared between Figma/design, the Next.js frontend, Strapi CMS, and rich text editor previews. Set it up before page-builder work spreads across the project.

Clarify the source of truth first: Figma, the current website, Strapi content, or a documented combination. Align naming across design, code, and CMS early so the same concept is not named differently in every layer.

Shared visual values belong mainly in `packages/design-system/src/theme.css` and `packages/design-system/src/custom-styles.css`. These files affect both the frontend and Strapi editor integrations. See the [`@repo/design-system` package reference](/docs/reference/packages/design-system) for package-level context.

Define colors, fonts, spacing, containers, typography, and section-level layout once. Treat tokens, typography classes, rich text styles, and editor config outputs as shared contracts.

For page-builder sections, avoid adding spacing, background, container, and decorative behavior separately in every component. Use a shared section configuration or wrapper pattern, and keep local styling for real design exceptions.

CMS fields should be editor-friendly: clear labels, descriptions, limited variant options, sensible defaults, and consistent naming. Do not expose implementation details such as utility classes or token names as editor choices.

Choose the rich text editor early. CKEditor is better for closer WYSIWYG parity in Strapi admin, while TipTap is better for structured content with stricter presets.

Components should have clear variants and defined states. The main goal is consistency: design-system rules should be reused from shared places, not copied locally into every section.

## Detailed instructions

- [How to start](/docs/design-system/how-to-start)
- [Tokens And Global Styles](/docs/design-system/tokens-and-global-styles)
- [Typography](/docs/design-system/typography)
- [Rich Text Editors](/docs/design-system/rich-text-editors)
- [CMS And Components](/docs/design-system/cms-and-components)
