# Design System Checklist

Use this checklist when creating a task for initial design-system setup or a larger redesign. Not every item is needed for every project, but each one should be considered explicitly.

## Project Scope

- [ ] Confirm access to Figma, Strapi admin, repository, deployments, and any existing website or CMS.
- [ ] Decide the source of truth for the design system: Figma, current website, CMS, or a documented combination.
- [ ] Review the current website or Figma prototype for layout, spacing, typography, component, and CMS inconsistencies.
- [ ] Document decisions in one shared place so global decisions are not spread across Slack, Figma comments, and separate notes.
- [ ] Identify risks or unclear design decisions and review them with the tech lead before implementation.

## Tokens And Global Styles

- [ ] Define project color tokens in `packages/design-system/src/theme.css`.
- [ ] Decide whether the project supports dark mode or should force/reuse light-mode values.
- [ ] Confirm OKLCH, hex, RGB, or another color format with the designer and keep it consistent.
- [ ] Define container widths, breakpoints, max widths, spacing, paddings, shadows, and animation tokens.
- [ ] Use scalable token names such as `--radius-sm`, `--radius-md`, and `--radius-lg`.
- [ ] Keep shared design tokens in `theme.css`, and app-specific global styles in `apps/ui/src/styles/globals.css`.
- [ ] Confirm `globals.css` imports `@repo/design-system/theme.css` and `@repo/design-system/custom-styles.css`.
- [ ] Rebuild `@repo/design-system` when generated Strapi or editor outputs need to be updated.
- [ ] Treat exported design-system tokens, typography classes, and editor config outputs as shared utilities.

## Fonts And Typography

- [ ] Import all required font weights and styles in `apps/ui/src/lib/fonts.ts`.
- [ ] For file-based fonts, define the font variable in `packages/design-system/src/theme.css` and export it through the design-system build output.
- [ ] Attach font variables in `apps/ui/src/app/[locale]/layout.tsx`.
- [ ] Collect all typography variants before component implementation starts.
- [ ] Define `.typo-*` classes in `packages/design-system/src/custom-styles.css`.
- [ ] Map typography variants in `apps/ui/src/components/typography/config.ts`.
- [ ] Confirm `defaultStyles` are correct for `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, and `p`.
- [ ] Update `apps/strapi/src/admin/ckeditor/headings.ts` when CKEditor should expose changed or new typography variants.
- [ ] Verify semantic heading tags can use different visual variants when needed.

## Rich Text Editors

- [ ] Decide whether the project uses CKEditor, TipTap, or both intentionally.
- [ ] If only one editor is needed, remove the unused editor path for the project.
- [ ] Define allowed heading levels, text colors, font weights, alignment options, links, lists, images, tables, and embeds.
- [ ] For CKEditor, confirm Strapi admin preview should match frontend rendering as closely as possible.
- [ ] For TipTap, define clear presets so editors do not get unsupported formatting freedom.
- [ ] Update `packages/design-system/src/custom-styles.css` so rich text output, editor previews, and frontend typography stay aligned.
- [ ] Confirm frontend renderers are correct for the selected editor components.

## CMS Modeling

- [ ] Identify global content that belongs in Strapi single types, such as navbar, footer, cookie banner, newsletter, legal note, or social links.
- [ ] Decide whether layout variants need single types, collection types, or page-builder composition.
- [ ] Identify page-builder sections editors need to compose manually.
- [ ] Define shared section configuration, such as spacing, background, container, or decorative options, before sections start duplicating the same fields.
- [ ] Keep Strapi fields focused on real content and editor-facing configuration.
- [ ] Avoid exposing purely technical layout implementation details to editors.
- [ ] Align Figma names, Strapi labels, component names, variant names, and frontend props.
- [ ] Add clear field labels and descriptions in Strapi when editor choices could be confusing.
- [ ] Add sensible default values, field descriptions, and limited enum options where editors need guidance.

## Frontend Components

- [ ] Check existing shared components, utilities, hooks, and packages before adding new ones.
- [ ] Use `apps/ui/src/components/ui` primitives as the base for atomic UI.
- [ ] Prefer bounded variants over many booleans or open-ended props.
- [ ] Keep one prop responsible for one concept.
- [ ] Decide whether a visual pattern belongs in a page-builder component, atomic component, utility, or shared token.
- [ ] Ensure component spacing follows the shared spacing system instead of ad hoc margins and paddings.
- [ ] Define component states such as hover, focus-visible, active, disabled, loading, error, empty, and dark mode where relevant.
- [ ] Decide how icons, SVGs, symbols, and decorative assets are sourced, themed, reused, and exposed to Strapi.
- [ ] Avoid unnecessary `useEffect`; prefer server data fetching, derived state, or event-driven logic when possible.

## Accessibility And Content

- [ ] Verify text colors meet contrast requirements.
- [ ] Verify heading hierarchy is semantic even when visual variants differ.
- [ ] Confirm keyboard and focus states for interactive components.
- [ ] Define image alt text expectations for CMS-managed images.
- [ ] Check long translated content, especially languages such as German.
- [ ] Clarify whether RTL languages can be in scope.
- [ ] Confirm motion and animation behavior respects reduced-motion needs when relevant.
- [ ] Verify all components are available without JavaScript (animations, data, images).
- [ ] Make sure to avoid any layout shifting use lazy loaders if necessary.
