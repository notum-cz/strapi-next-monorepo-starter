# Strapi Types

The project uses `@repo/strapi-types` for type-safe Strapi content in the UI and shared code.

This package combines:

- **Base Strapi types**: `Data`, `Modules`, and `UID` from `@strapi/strapi`.
- **Project extras**: `ID`, `FindMany<T>`, `FindFirst<T>`, `FindOne<T>`, and `Result<T, Params>`.

For package structure, generated files, symlink/copy workflow, and why Strapi fields are often optional, see [`@repo/strapi-types`](../reference/packages/strapi-types.md).

## Import

```typescript
import type { Data, FindMany, Result, UID } from "@repo/strapi-types"
```

## Common Types

| Type                      | Purpose                                      | Example                                   |
| ------------------------- | -------------------------------------------- | ----------------------------------------- |
| `UID.ContentType`         | Union of content type UIDs                   | `"api::page.page"`                        |
| `UID.Component`           | Union of component UIDs                      | `"sections.hero"`                         |
| `Data.ContentType<"uid">` | Content type data                            | `Data.ContentType<"api::page.page">`      |
| `Data.Component<"uid">`   | Component data                               | `Data.Component<"sections.hero">`         |
| `FindMany<"uid">`         | Typed query params for multiple documents    | `FindMany<"api::page.page">`              |
| `Result<"uid", Params>`   | Response shape for selected fields/populates | `Result<"api::page.page", typeof params>` |

## Page Builder Components

```typescript
import type { Data } from "@repo/strapi-types"

interface StrapiHeroProps {
  readonly component: Data.Component<"sections.hero">
}

export function StrapiHero({ component }: StrapiHeroProps) {
  return (
    <section>
      <h1>{component.title}</h1>
      {component.subTitle && <p>{component.subTitle}</p>}
    </section>
  )
}
```

## API Calls

```typescript
import type { FindMany, Result } from "@repo/strapi-types"

import { PublicStrapiClient } from "@/lib/strapi-api"

const params = {
  locale: "en",
  filters: { slug: { $startsWith: "blog" } },
  populate: { content: true, seo: true },
} satisfies FindMany<"api::page.page">

const pages: Result<"api::page.page", typeof params>[] =
  await PublicStrapiClient.fetchMany("api::page.page", params)
```

## Component Registries

Use `UID.Component` when mapping Strapi dynamic-zone components to React components:

```typescript
import type { UID } from "@repo/strapi-types"

const PageContentComponents: {
  [K in UID.Component]?: React.ComponentType<any>
} = {
  "sections.hero": StrapiHero,
  "sections.faq": StrapiFaq,
}
```

## Related Documentation

- [`@repo/strapi-types`](../reference/packages/strapi-types.md) — package details and generated type workflow
- [Page Builder](../page-builder/introduction.md) — component registry using these types
- [Strapi API Client](../ui/strapi-api-client.md) — API calls with typed params
