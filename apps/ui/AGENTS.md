# Next.js Frontend

Next.js 16 with App Router, React 19, TailwindCSS v4, TanStack Query, and Shadcn/ui.

## Import Alias

Always use `@/` prefix (maps to `src/`):

```typescript
import { Container } from "@/components/elementary/Container"
```

## Page Builder Components

**Naming:** `Strapi{PascalCase}.tsx` in `components/page-builder/components/{category}/`

**Props:** Use `Data.Component<"uid">` from `@repo/strapi-types`:

```typescript
import { Data } from "@repo/strapi-types"

export function StrapiHero({
  component,
}: {
  readonly component: Data.Component<"sections.hero">
}) {
  return <section>{component.title}</section>
}
```

**Registry:** `components/page-builder/index.tsx` maps UIDs to components.

Full workflow: [Page Builder docs](../docs/docs/content-system/page-builder.md)

## Strapi API Clients

```typescript
import { PrivateStrapiClient, PublicStrapiClient } from "@/lib/strapi-api"
```

| Client                | Auth     | Use Case               |
| --------------------- | -------- | ---------------------- |
| `PublicStrapiClient`  | API key  | Read-only content      |
| `PrivateStrapiClient` | User JWT | Authenticated requests |

**Client-side:** Use `useProxy: true` option.

Full reference: [Strapi API Client docs](../docs/docs/content-system/strapi-api-client.md)

## Internationalization

| System      | Purpose    | Location                          |
| ----------- | ---------- | --------------------------------- |
| next-intl   | UI strings | `locales/{locale}.json`           |
| Strapi i18n | Content    | `locale` query param (auto-added) |

## Authentication

- **Better Auth v1**: Session management
- **Strapi JWT**: Stored as `session.user.strapiJWT`

```typescript
// Server
const session = await getSessionSSR(await headers())

// Client
const { data: session } = await getSessionCSR()
```

Full reference: [Authentication docs](../docs/docs/auth/frontend/authentication.md)

## Adding Page Builder Components

Use skill: `/create-content-component`, or do it manually

1. Create Strapi schema — see [apps/strapi/AGENTS.md](../strapi/AGENTS.md)
2. Generate types (see root AGENTS.md)
3. Create component: `components/page-builder/components/{category}/Strapi{Name}.tsx`
4. Register in `PageContentComponents`

## Related Documentation

- [Page Builder](../docs/docs/content-system/page-builder.md) — Full component workflow
- [Strapi API Client](../docs/docs/content-system/strapi-api-client.md) — Fetching content
- [Authentication](../docs/docs/auth/frontend/authentication.md) — Better Auth + Strapi JWT
- [Strapi Types](../docs/docs/content-system/strapi-types-usage.md) — Type utilities
