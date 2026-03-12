# Strapi Types

The `@repo/strapi-types` package provides auto-generated TypeScript types from Strapi schemas for type-safe content handling across the monorepo.

## Regeneration

After ANY Strapi schema change, regenerate types from the root AGENTS.md instructions.

## Package Structure

```
packages/strapi-types/
├── generated/  →  symlink to apps/strapi/types/generated/
├── index.ts
└── package.json
```

Types are generated in Strapi and symlinked to the package for monorepo-wide imports.

## Key Type Utilities

```typescript
import { Data, FindFirst, FindMany, Result, UID } from "@repo/strapi-types"
```

| Type                      | Purpose                         | Example                                                     |
| ------------------------- | ------------------------------- | ----------------------------------------------------------- |
| `UID.ContentType`         | Union of all content type UIDs  | `"api::page.page"`                                          |
| `UID.Component`           | Union of all component UIDs     | `"sections.hero"`                                           |
| `Data.ContentType<"uid">` | Full content type data          | `Data.ContentType<"api::page.page">`                        |
| `Data.Component<"uid">`   | Full component data             | `Data.Component<"sections.hero">`                           |
| `Result<"uid", params>`   | Response shape after population | `Result<"api::page.page", { populate: { content: true } }>` |
| `FindFirst<uid>`          | Query params for single doc     | `FindFirst<"api::page.page">`                               |
| `FindMany<uid>`           | Query params for multiple docs  | `FindMany<"api::page.page">`                                |

## Usage in Page Builder Components

```typescript
import { Data } from "@repo/strapi-types"

interface StrapiHeroProps {
  readonly component: Data.Component<"sections.hero">
}

export function StrapiHero({ component }: StrapiHeroProps) {
  // component.title, component.subTitle, etc. are fully typed
  return (
    <section>
      <h1>{component.title}</h1>
      {component.subTitle && <p>{component.subTitle}</p>}
    </section>
  )
}
```

## Usage in API Calls

```typescript
import { FindMany, Result, UID } from "@repo/strapi-types"

import { PublicStrapiClient } from "@/lib/strapi-api"

// Type-safe query params
const params: FindMany<"api::page.page"> = {
  locale: "en",
  filters: { slug: { $startsWith: "blog" } },
  populate: { content: true, seo: true },
}

// Type-safe response
const pages: Result<"api::page.page", typeof params>[] =
  await PublicStrapiClient.fetchMany("api::page.page", params)
```

## UID Unions

Use for type-safe component registries:

```typescript
import { UID } from "@repo/strapi-types"

const PageContentComponents: {
  [K in UID.Component]?: React.ComponentType<any>
} = {
  "sections.hero": StrapiHero,
  "sections.faq": StrapiFaq,
}
```

## Handling Dynamic Zones

Dynamic zone items have a `__component` field with the UID:

```typescript
import { Data, UID } from "@repo/strapi-types"

type DynamicZoneItem = Data.Component<UID.Component> & {
  __component: UID.Component
}

function renderComponent(item: DynamicZoneItem) {
  switch (item.__component) {
    case "sections.hero":
      return <StrapiHero component={item as Data.Component<"sections.hero">} />
    case "sections.faq":
      return <StrapiFaq component={item as Data.Component<"sections.faq">} />
    default:
      return null
  }
}
```

## When Types Are Stale

Symptoms of forgetting to regenerate:

- TypeScript errors about missing properties
- Runtime undefined values for fields that exist in Strapi
- IDE autocomplete missing new fields

Always regenerate when:

- Adding/removing content types
- Adding/removing components
- Changing component attributes
- Changing content type attributes
- Modifying relations between types

## Related Documentation

- [Page Builder](./page-builder.md) — Component registry using these types
- [Strapi API Client](./strapi-api-client.md) — API calls with type-safe params
