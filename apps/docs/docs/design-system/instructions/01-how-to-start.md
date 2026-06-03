# How To Start

This guide describes what to clarify before implementing a project design system in this monorepo.

The current repository uses:

- `apps/ui` for the Next.js 16 App Router frontend.
- `apps/strapi` for the Strapi 5 CMS.
- `packages/design-system` for shared Tailwind v4 tokens, CSS, CKEditor styles, and TipTap editor configuration.
- `apps/docs` for this Docusaurus documentation.

The goal at project start is not to make every component infinitely configurable. The goal is to define a small, predictable system that designers, developers, and content editors can all use consistently.

## Initial Access And Context

Before implementation starts, make sure the team has access to all relevant tools:

- Figma or another design source.
- Strapi admin and CMS content model.
- Repository and deployment environments.
- Any existing production website or legacy CMS if the project is a redesign.

If a CMS already exists, review the current structure before changing anything:

- How components are modeled.
- How content is organized.
- Which patterns editors already use.
- Which parts are intentionally flexible and which are accidental complexity.

Align with the client or product owner early:

- Should the current approach be kept?
- Is this project an opportunity to simplify the content model?
- Which source is the source of truth: Figma, the current website, the CMS, or a combination?

This avoids blindly continuing a messy setup, but also avoids overengineering a system the client does not need.

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
- Rollout process for global changes during development.

If multiple sources are used, clearly define what is reused and what changes. For example, if Figma introduces new button styles or typography atoms, those atoms should be applied consistently across the website and explained to the client before implementation spreads.

## Short Design Analysis

Go through the full website or Figma prototype before component work starts. Mark inconsistencies and edge cases, then clarify expected behavior early.

Review:

- Layout consistency: check whether navigation, footer, and page shells are shared across all pages or need variants.
- Page-level structure: decide what belongs in a global layout, page route, reusable section, or CMS single type.
- Predefined building blocks: identify wrappers, background variants, decorative elements, animations, and shared section structure.
- Spacing system: decide whether vertical spacing is handled by a global container, section wrappers, component variants, or a combination.
- Reusability: identify repeated sections that should be modeled once and reused.
- CMS configuration: decide which global elements belong in single types, such as cookie banner, newsletter block, navigation, or footer.
- Additional features: clarify dark mode, animations, reduced motion, and responsive behavior before implementation.
- Naming conventions: align component names, variants, CMS labels, and frontend props with the language used by designers.
- Translations: consider longer languages such as German, and clarify whether RTL languages can be in scope.
- Images: decide formats, sizes, responsive behavior, and whether an image proxy or shared image helper is needed.
- Potential risks: document likely issues and review them with the tech lead before development starts.

## What Not To Do

Avoid over-flexible components. Components that try to cover every possible future case usually become difficult to use, hard to maintain, and visually inconsistent.

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

Prefer clear variants or separate components when the design intent is genuinely different.

## Development Process

Create one shared place for global design-system decisions, for example Notion, Canvas, or a dedicated docs page. The team should use it for decisions that affect multiple parts of the project:

- Token changes.
- Typography changes.
- Global component API changes.
- CMS modeling decisions.
- Client-approved design deviations.
- Accessibility or translation decisions.

Avoid spreading these decisions across Slack, Figma comments, and disconnected notes.

After the initial setup, the person responsible for the design system should run a short workshop with the team. The workshop should explain what changed, where the source files live, and how developers should use the system in new components.

## Checklist

Use the [Project Scope checklist](../checklist.md#project-scope) before starting or reviewing work.
