---
sidebar_position: 3
---

# How To Start

This guide describes what to clarify before implementing a project design system in this monorepo.

## Source Of Truth

Start by deciding what drives design-system decisions:

- Figma or another design source.
- Existing production website.
- Existing CMS content model.
- A documented combination of the above.

:::warning Decide this first
Do not start naming tokens, variants, Strapi fields, or component props until the team agrees which source wins when Figma, current content, and existing frontend patterns disagree.
:::

If a CMS already exists, review the current structure before changing anything:

- How components are modeled.
- How content is organized.
- Which patterns editors already use.
- Which parts are intentionally flexible and which are accidental complexity.

Align with the client or product owner early:

- Should the current approach be kept?
- Is this project an opportunity to simplify the content model?
- Which source is the source of truth: Figma, the current website, the CMS, or a combination?

## Define The Scope

Setting up the design system usually includes:

- Typography, fonts, and dedicated typography components.
- Color palette and semantic color tokens.
- Base atomic components, especially Shadcn/ui components in `apps/ui/src/components/ui`.
- Containers, breakpoints, spacing, padding, and shadows.
- Rich text editor rules for CKEditor or TipTap.
- Strapi components and single types for globally reused content.
- Naming conventions across design, frontend code, and CMS labels.
- Accessibility rules.

If multiple sources are used, clearly define what is reused and what changes. For example, if Figma introduces new button styles or typography atoms, those atoms should be applied consistently across the website and explained to the client before implementation spreads.

## Short Design Analysis

Go through the full website or Figma prototype before component work starts. Mark inconsistencies and edge cases, then clarify expected behavior early.

Review:

- **Layout consistency** — check whether navigation, footer, and page shells are shared across all pages or need variants.
- **Page-level structure** — decide what belongs in a global layout, page route, reusable section, or CMS single type.
- **Building blocks** — identify wrappers, background variants, decorative elements, animations, and shared section structure.
- **Spacing system** — decide whether vertical spacing is handled by a global container, section wrappers, component variants, or a combination.
- **Reusability** — identify repeated sections that should be modeled once and reused.
- **CMS configuration** — decide which global elements belong in single types, such as cookie banner, newsletter block, navigation, or footer.
- **Interaction states** — clarify hover, focus, disabled, loading, error, dark mode, reduced motion, and responsive behavior before implementation.
- **Naming conventions** — align component names, variants, CMS labels, and frontend props with the language used by designers.
- **Translations** — consider longer languages such as German, and clarify whether RTL languages can be in scope.
- **Media rules** — decide image formats, sizes, aspect ratios, responsive behavior, and whether shared image helpers are needed.

## What Not To Do

:::warning Avoid "universal" components
Over-flexible components look efficient early, but they usually become hard to use, hard to test, and visually inconsistent. Prefer clear variants or separate components when the design intent is genuinely different.
:::

Common mistakes:

- Adding too many props "just in case".
- Letting one prop do multiple unrelated things.
- Using booleans for visual variants that should be named variants.
- Changing image position and unrelated layout behavior through one prop.
- Defining margins and paddings ad hoc inside every component.
- Mixing several spacing strategies without clear rules.
- Inventing new names for variants that already exist.
- Using `title` in one component and `heading` in another for the same concept without a reason.
- Using different labels in Strapi than the design system uses.

## Document Decisions

Create one shared place for global design-system decisions, for example Figma notes, Notion, Canvas, or a dedicated docs page. Use it for decisions that affect multiple parts of the project:

- Token changes.
- Typography changes.
- Global component API changes.
- CMS modeling decisions.
- Accessibility or translation decisions.

:::tip Keep decisions close to implementation
If a design-system decision affects code, make sure the final decision is reflected in the repository docs or component API. Slack threads and Figma comments are useful during discussion, but they should not be the final source of truth.
:::

Avoid spreading durable decisions across Slack, Figma comments, and disconnected notes.
