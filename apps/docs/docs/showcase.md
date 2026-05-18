# Showcase — purpose and workflow

The `/showcase` page in the dev area is a lightweight brand manual and mini-storybook. It serves three audiences:

- Developers: quick visual testbed for Strapi page-builder components and UI primitives.
- Content creators / content fillery: preview of components with example content and guidance on which fields to fill in Strapi.
- Stakeholders / designers: a browsable preview of layouts and variants without needing to open the CMS.

The Showcase is intentionally developer-friendly: it renders mocked versions of Strapi components (so you don't need to be connected to a production Strapi instance) and small example pages for atomic UI primitives.

## What belongs in the Showcase

- Strapi page-builder sections (mocked wrappers named `Mocked*Component`) — one file per real Strapi section found in `apps/ui/src/components/page-builder/components/sections`.
- Atomic sections that demonstrate UI primitives (Inputs, Buttons, Selects, Dialogs, Tooltips, etc.).
- Simple examples for interactive components so developers and content authors can see expected behavior.

## How to add a new component to the Showcase

Follow these steps when you add a new page-builder component in Strapi:

1. Implement the Strapi component schema and frontend React component as usual (see `create-content-component` skill).
2. Add a mocked wrapper in the Showcase folder: `apps/ui/src/app/[locale]/dev/showcase/strapiComponents/Mocked{Name}Component.tsx`.

Minimal mocked wrapper pattern:

- Import `ManualSection` and `ManualItem` from the Showcase helpers.
- Import the frontend `Strapi{Name}` component.
- Create a `data` object shaped as `Data.Component<"{category}.{name}">`.
  - For fields that are rendered with a richtext editor in production (CKEditor), provide HTML strings (e.g. `"<p>Some <strong>HTML</strong></p>"`).
  - For images, use the shared mock image helper exported from `apps/ui/src/app/[locale]/dev/showcase/components/StrapiImage.tsx` (named exports `mockImage`, `mockIcon`, and default).
- Export a default component that renders the `Strapi{Name}` inside `<ManualSection className="flex flex-col gap-6">` and a `<ManualItem>`.

Example responsibilities to include in the mock:

- All supported layout variants (for example: Features List supports default/grid/boxGrid). Render multiple `ManualItem` entries if you want to show variants side-by-side.
- Provide accessible placeholder copy and image data.
- Keep mock data minimal but representative of content authors' inputs.

## Showcase conventions

- `ManualSection` usage: prefer `className="flex flex-col gap-6"` so the title and content area have consistent spacing.
- Props typing: cast the `data` object to `Data.Component<"{category}.{name}">` to keep TypeScript happy.
- Richtext: mock with HTML strings (not plain text) to match CKEditor rendering.
- Images: import `mockImage`/`mockIcon` from the shared `StrapiImage` helper.
- Anchors: After adding the mock file, add its `sectionId` to the `componentsAnchors` list in `apps/ui/src/app/[locale]/dev/showcase/page.tsx` so it appears in the Showcase menu and page.

## Why this helps

- Quickly preview new components without running a live Strapi content instance.
- Keep deterministic example content for design reviews and QA.
- Provide content creators with concrete examples they can copy into the CMS.

## Troubleshooting

- If you see rendering errors, check that mocked data shape matches `Data.Component<"{category}.{name}">` and that nested components use the correct `populate` rules in Strapi.
- If a UI primitive relies on specific Radix structure (e.g., SelectTrigger + SelectContent), mimic that structure in the mock.
