# Page Builder

The page builder enables content editors to compose pages from reusable components in Strapi, which are automatically rendered by the Next.js frontend.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Strapi CMS                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Page (api::page.page)                                               │    │
│  │  └─ content: dynamiczone                                            │    │
│  │       ├─ sections.hero                                              │    │
│  │       ├─ sections.faq                                               │    │
│  │       ├─ forms.contact-form                                         │    │
│  │       └─ ...                                                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                        │
│                          documentMiddlewares/page.ts                        │
│                          (deep population rules)                            │
└────────────────────────────────────│────────────────────────────────────────┘
                                     │ REST API
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Next.js Frontend                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ StrapiPage (page.tsx)                                                │    │
│  │  └─ maps __component UID → React component                          │    │
│  │       ├─ sections.hero      → StrapiHero                            │    │
│  │       ├─ sections.faq       → StrapiFaq                             │    │
│  │       ├─ forms.contact-form → StrapiContactForm                     │    │
│  │       └─ ...                                                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Data flow:**

1. Editor adds components to page's `content` dynamic zone in Strapi admin
2. Page is fetched via REST API with deep population (handled by middleware)
3. `StrapiPage` iterates over `content` array
4. Each item's `__component` UID is matched against `PageContentComponents` registry
5. Matching React component renders with full component data as props

## Component Registry

The mapping between Strapi component UIDs and React components is defined in:

**`apps/ui/src/components/page-builder/index.tsx`**

```typescript
export const PageContentComponents: {
  [K in UID.Component]?: React.ComponentType<any>
} = {
  // Utilities
  "utilities.ck-editor-content": StrapiCkEditorContent,

  // Sections
  "sections.hero": StrapiHero,
  "sections.faq": StrapiFaq,
  "sections.carousel": StrapiCarousel,
  // ...

  // Forms
  "forms.contact-form": StrapiContactForm,
  "forms.newsletter-form": StrapiNewsletterForm,
  // ...
}
```

Components are grouped by category (matching Strapi's component folder structure).

## Naming Conventions

| Element               | Pattern                                    | Example                                                                  |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| Strapi UID            | `category.kebab-case`                      | `sections.hero`                                                          |
| Strapi schema file    | `{name}.json`                              | `apps/strapi/src/components/sections/hero.json`                          |
| Strapi collectionName | `components_{category}_{name_underscored}` | `components_sections_hero`                                               |
| React component       | `Strapi{PascalCase}`                       | `StrapiHero`                                                             |
| React file            | `Strapi{PascalCase}.tsx`                   | `apps/ui/src/components/page-builder/components/sections/StrapiHero.tsx` |

## Props Typing

React components receive their data via a `component` prop, typed using the `Data.Component` utility from `@repo/strapi-types`:

```typescript
import { Data } from "@repo/strapi-types"

export function StrapiHero({
  component,
}: {
  readonly component: Data.Component<"sections.hero">
}) {
  return (
    <section>
      <h1>{component.title}</h1>
      {component.subTitle && <h2>{component.subTitle}</h2>}
      {/* ... */}
    </section>
  )
}
```

The generic parameter is the Strapi component UID (e.g., `"sections.hero"`). This provides full type safety for all attributes defined in the component schema.

**After changing Strapi schemas, regenerate types:**

```bash
cd apps/strapi && pnpm generate:types
```

## Population Rules

Dynamic zone content requires explicit population of nested relations and components. This is handled by a document middleware.

**`apps/strapi/src/documentMiddlewares/page.ts`**

The middleware intercepts `findMany` queries for pages and applies deep population rules via the `on` pattern:

```typescript
const pagePopulateObject = {
  content: {
    on: {
      "sections.hero": {
        populate: {
          links: true,
          image: { populate: { media: true } },
          steps: true,
        },
      },
      "sections.cta": { populate: { link: true } },
      "utilities.ck-editor-content": true, // no nested relations
      "sections.container": {
        populate: {
          content: {
            on: {
              // recursive population for nested dynamic zones
              "sections.hero": {
                /* ... */
              },
            },
          },
        },
      },
      // ...
    },
  },
  seo: {
    populate: {
      metaImage: true,
      twitter: { populate: { images: true } },
      og: { populate: { image: true } },
    },
  },
}
```

**Key patterns:**

- Use `true` for components without nested relations
- Use `{ populate: { fieldName: true } }` for simple nested components
- Use `{ populate: { fieldName: { populate: { media: true } } } }` for media fields
- Containers support recursive `on` patterns for nested dynamic zones

**Triggering the middleware:**

Requests must include `middlewarePopulate` parameter:

```typescript
await PublicStrapiClient.fetchOneByFullPath("api::page.page", fullPath, {
  locale,
  populate: { content: true, seo: true },
  middlewarePopulate: ["content", "seo"], // triggers middleware
  pagination: { page: 1, pageSize: 1 },
})
```

## Page Rendering

The rendering logic lives inline in the `StrapiPage` component:

**`apps/ui/src/app/[locale]/[[...rest]]/page.tsx`**

```typescript
export default function StrapiPage(props: PageProps<"/[locale]/[[...rest]]">) {
  const params = use(props.params)
  const locale = params.locale as Locale

  const fullPath = ROOT_PAGE_PATH + (params.rest ?? []).join("/")
  const response = use(fetchPage(fullPath, locale))
  const data = response?.data

  if (data?.content == null) {
    notFound()
  }

  const { content, ...restPageData } = data

  return (
    <>
      <StrapiStructuredData structuredData={data?.seo?.structuredData} />
      <main>
        {content
          .filter((comp) => comp != null)
          .map((comp) => {
            const Component = PageContentComponents[comp.__component]

            if (Component == null) {
              console.warn(`Unknown component "${comp.__component}"`)
              return <div>Component not implemented</div>
            }

            return (
              <ErrorBoundary key={`${comp.__component}-${comp.id}`}>
                <Component
                  component={comp}
                  pageParams={params}
                  page={restPageData}
                />
              </ErrorBoundary>
            )
          })}
      </main>
    </>
  )
}
```

Each component is wrapped in an `ErrorBoundary` to prevent a single component error from breaking the entire page. Components also receive `pageParams` and `page` props in addition to the `component` data.

## Adding New Components

Use the `create-content-component` skill:

```
/create-content-component
```

Or follow these manual steps:

1. Create Strapi schema: `apps/strapi/src/components/{category}/{name}.json`
2. Register in page dynamic zone: `apps/strapi/src/api/page/content-types/page/schema.json`
3. Add population rules: `apps/strapi/src/documentMiddlewares/page.ts`
4. Create React component: `apps/ui/src/components/page-builder/components/{category}/Strapi{Name}.tsx`
5. Register in `PageContentComponents`: `apps/ui/src/components/page-builder/index.tsx`
6. Generate types: `cd apps/strapi && pnpm generate:types`

## Related Documentation

- [Pages Hierarchy](./pages-hierarchy.md) — URL structure and slug management
- [Strapi API Client](./strapi-api-client.md) — fetching content from Strapi
