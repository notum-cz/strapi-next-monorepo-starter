---
sidebar_position: 3
---

# `@repo/strapi-types`

This package lets the UI and other workspace packages consume Strapi type inference without depending on the whole Strapi app as a workspace dependency.

It contains two things:

- `src/index.ts`, a small entrypoint that re-exports useful Strapi types.
- `generated/`, the Strapi-generated module augmentation files for this project.

The generated files are what teach TypeScript about your actual content types and components. Without them, Strapi's generic types become much weaker and fields often fall back to `any`.

## Exports

| Export                     | Purpose                                                                           |
| -------------------------- | --------------------------------------------------------------------------------- |
| `.`                        | Re-exports `Data`, `Modules`, `UID` from `@strapi/strapi` and adds local helpers. |
| `./generated/components`   | Generated component schema typings.                                               |
| `./generated/contentTypes` | Generated content-type schema typings.                                            |

## Base Types And Extra Helpers

Import from the package entrypoint:

```ts
import type { Data, FindMany, Result, UID } from "@repo/strapi-types"
```

Base Strapi namespaces:

| Type      | Use                                             |
| --------- | ----------------------------------------------- |
| `Data`    | Typed content type and component data.          |
| `Modules` | Lower-level Strapi module types.                |
| `UID`     | Content type, component, and schema UID unions. |

Extra helpers added by this package:

| Type                | Use                                                                   |
| ------------------- | --------------------------------------------------------------------- |
| `ID`                | Strapi document ID type.                                              |
| `FindMany<T>`       | Typed params for document service `findMany`.                         |
| `FindFirst<T>`      | Typed params for document service `findFirst`.                        |
| `FindOne<T>`        | Typed params for document service `findOne`.                          |
| `Result<T, Params>` | Response data shape after `fields` and `populate` params are applied. |

## Local Development

### Preferred: symlink for instant updates

For the best DX, keep `packages/strapi-types/generated` as a symlink to Strapi's generated output folder. This is already prepared in Git and points to:

```text
../../apps/strapi/types/generated
```

With the symlink in place, generated definitions are available to `@repo/strapi-types` immediately.

If you ever need to recreate the symlink, run from the repository root:

```bash
rm -rf packages/strapi-types/generated
ln -s ../../apps/strapi/types/generated packages/strapi-types/generated
```

Notes:

- macOS/Linux: symlinks usually work out of the box.
- Windows: symlinks may require Admin or Developer Mode. If that is a problem, use the copy workflow below.

### Alternative: copy workflow

If symlinks are not available in your environment, the package has a helper script:

```bash
pnpm --filter @repo/strapi-types sync-types
```

From the package directory, the equivalent command is:

```bash
pnpm run sync-types
```

It copies `apps/strapi/types/generated/*.d.ts` into `packages/strapi-types/generated/`.

:::warning
When using the copy workflow, the copied files do not update by themselves after schema changes. Re-run `sync-types` after Strapi types are regenerated.
:::

:::tip Troubleshooting: why fields are often optional
Strapi response types model runtime API variability. A field can be required in the schema and still be absent from a specific read response because of `fields`, `populate`, permissions, locales, draft/publish state, middleware, or custom controller logic.

That is why many values are typed as optional or nullable. "Required" in a Strapi schema means required when creating or updating content, not guaranteed in every API response.
:::

## Related Documentation

- [Strapi Types](../../strapi/strapi-types.md) — practical usage in this project
- [Add a Content Type](../../getting-started/add-content-type.md) — using generated types after adding a schema
