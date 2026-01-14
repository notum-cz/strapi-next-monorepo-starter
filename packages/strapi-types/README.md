# 🎁 Strapi Types - `@repo/strapi-types`

This workspace package exists so `apps/ui` (and other apps or packages) can consume **Strapi type inference without depending on the whole Strapi backend** (`apps/strapi`) as a workspace dependency.

It intentionally contains:

- A small [src/index.ts](src/index.ts) that re-exports utility types from `@strapi/strapi`
- The Strapi-generated module augmentation `.d.ts` files in `generated/`

Those generated `.d.ts` files are the critical part: they augment `@strapi/strapi` with your project’s schema, component schemas, etc.). If they’re missing, TypeScript falls back to weaker typing and you’ll often see values become `any`.

This allows to use dynamic inference of Strapi content based on the filters, populates and fields you use in your queries.

## Local development

### Preferred: symlink for instant updates

For the best DX, keep `packages/strapi-types/generated` folder as a symlink to Strapi’s generated output folder. This is already prepared in GIT and the `generated` symbolic link points to [`../../apps/strapi/types/generated`](../../apps/strapi/types/generated).

If you ever need to recreate the symlink, run:

```sh
# from repo root
rm -rf packages/strapi-types/generated
ln -s ../../apps/strapi/types/generated packages/strapi-types/generated
```

Notes:

- macOS/Linux: works out of the box.
- Windows: symlinks may require Admin/Developer Mode; if that’s a problem, use the copy workflow below.

### Alternative: copy (no symlinks)

`@repo/strapi-types` ships with a helper script:

```sh
# from repo root
yarn workspace @repo/strapi-types sync-types

# from here
yarn sync-types
```

It copies `apps/strapi/types/generated/*.d.ts` into `packages/strapi-types/generated/`.

> [!WARNING]
> If you use this copy workflow, remember that the types in `@repo/strapi-types` will not update automatically when you change Strapi’s schema or regenerate types. You need to re-run the `sync-types` script manually after such changes.

## Usage

In UI app or other code:

1. Add a new devDependency `"@repo/strapi-types": "*"` to the package.json
2. Import from the workspace package as needed, e.g.:

```ts
import type { Data, Modules, UID } from "@repo/strapi-types"
```

## Troubleshooting

### Why “everything is optional” in Strapi types?

This is mostly by design in Strapi’s type model and what it’s trying to represent:

- **API responses are shape-dependent**. In Strapi, the returned payload depends on:
  - `fields` selection (attribute can be omitted)
  - `populate` graph (relations/components may be omitted unless populated)
  - draft/publish, permissions, locales, plugins, custom controllers, sanitization, middlewares, etc.
- **Strapi encodes “may be absent” as `undefined`**. Even if an attribute is “required” in the schema, it might not be present in the response if you didn’t request/populate it or it was removed by sanitization/permissions/overwritten endpoint logic.
- **Strapi often encodes “may be empty” as `null`**. Some attributes can be unset/missing in DB or returned as null-ish depending on type and content.

That’s why you see lots of `?:` and `| null | undefined` even for “required” schema fields. Strapi’s type system is primarily modeling runtime API variability, not enforcing “schema-required ⇒ always present in API response”.

> In other words: “required in Strapi schema” means “must be present when creating/updating content (required in the DB)”, not “guaranteed present in every read response”.
