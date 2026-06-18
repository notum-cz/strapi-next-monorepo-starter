---
sidebar_position: 6
---

# Smart Population

[`@notum-cz/strapi-plugin-smart-populate`](https://github.com/notum-cz/strapi-plugin-smart-populate) expands `"smart"` populate tokens into native Strapi populate objects.

Use it for content that contains nested components, dynamic zones, media fields, or relations where hand-written populate trees would be repetitive. The plugin reads Strapi schemas at bootstrap and builds the default population shape from them.

## Frontend Usage

Pass `"smart"` for fields that should use schema-generated population:

In this example, the page fetch loads components in the `content` dynamic zone and populates all of their children. It also loads the `seo` component and populates its nested media/components.

```typescript
import { PublicStrapiClient } from "@/lib/strapi-api"

const page = await PublicStrapiClient.fetchOneByFullPath(
  "api::page.page",
  fullPath,
  {
    locale,
    status: "published",
    populate: { seo: "smart", content: "smart" },
  }
)
```

Effectively, `"smart"` gives the common nested SEO population out of the box. Without it, the same request would need explicit call parameters like:

```typescript
const page = await PublicStrapiClient.fetchOneByFullPath(
  "api::page.page",
  fullPath,
  {
    locale,
    status: "published",
    populate: {
      seo: {
        populate: {
          metaImage: true,
          twitter: { populate: { images: true } },
          og: { populate: { image: true } },
        },
      },
      content: "smart",
    },
  }
)
```

Manual populate objects can still be used next to `"smart"` when an endpoint only needs a small custom shape.

## Strapi Configuration

Plugin registration lives in `apps/strapi/config/plugins.ts`:

```typescript
import { smartPopulateConfig } from "./plugins/smart-populate"

export default () => {
  return {
    "smart-populate": smartPopulateConfig(),
  }
}
```

This usually is enough for most content.

For extended customization, project-specific overrides live in `apps/strapi/config/plugins/smart-populate.ts`:

```typescript
import type { PopulateOverrideEntries } from "@notum-cz/strapi-plugin-smart-populate/types"
import type { Modules, UID } from "@strapi/strapi"

type ComponentPopulateMap = {
  [TComponentUID in UID.Component]: Required<
    Modules.Documents.Params.Pick<TComponentUID, "populate:object">
  >["populate"]
}

const populateOverrides = [
  {
    componentUid: "utilities.link",
    mergeWithGeneratedPopulate: true,
    overridePopulate: {
      page: {
        fields: ["fullPath"],
      },
    },
  },
] satisfies PopulateOverrideEntries<ComponentPopulateMap>

export function smartPopulateConfig() {
  return {
    enabled: true,
    config: {
      populateOverrides,
    },
  }
}
```

Use `populateOverrides` only when generated component population needs relation-specific fields or depth. See the plugin README for [populate override details](https://github.com/notum-cz/strapi-plugin-smart-populate#populate-overrides).
