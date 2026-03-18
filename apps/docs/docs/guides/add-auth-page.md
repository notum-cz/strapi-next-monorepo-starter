---
sidebar_position: 2
sidebar_label: "Add an auth page"
---

# Add an auth page

Add a protected Dashboard page at `/auth/dashboard` that requires an active session.

## Step 1: Create the route

1. Create the page directory and file:

```
apps/ui/src/app/[locale]/auth/dashboard/
├── page.tsx
└── _components/
    └── DashboardView.tsx
```

2. Add the page component. Auth pages follow a thin pattern: set the locale, then delegate to a component in `_components/`:

```tsx title="apps/ui/src/app/[locale]/auth/dashboard/page.tsx"
import type { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { use } from "react"

import { DashboardView } from "./_components/DashboardView"

export default function DashboardPage({
  params,
}: PageProps<"/[locale]/auth/dashboard">) {
  const { locale } = use(params) as { locale: Locale }
  setRequestLocale(locale)

  return <DashboardView />
}
```

3. Create a minimal view component:

```tsx title="apps/ui/src/app/[locale]/auth/dashboard/_components/DashboardView.tsx"
export function DashboardView() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to your dashboard.</p>
    </div>
  )
}
```

:::info Key patterns

- `setRequestLocale(locale)` is required for static rendering with `next-intl`. Never omit it.
- Sync pages use `use(params)` to unwrap the promise. Async pages use `await params` instead.
- Page-local components live in a `_components/` subdirectory alongside `page.tsx`.
  :::

## Step 2: Protect the route

1. Open `apps/ui/src/lib/proxies/authGuard.ts` and add `"/auth/dashboard"` to the `authPages` array:

```typescript title="apps/ui/src/lib/proxies/authGuard.ts"
const authPages = ["/auth/change-password", "/auth/dashboard", "/auth"]
```

2. The regex used by the middleware is rebuilt automatically from this array — no other changes are needed. The guard checks for a valid session via `getSessionSSR(req.headers)` and redirects unauthenticated users to `/auth/signin?callbackUrl=<current-path>`.

3. Do **not** add public auth pages to this array. These pages must remain accessible without a session:
   - `/auth/signin`
   - `/auth/register`
   - `/auth/forgot-password`
   - `/auth/activate`
   - `/auth/reset-password`

Only add pages that require an active session.

For details on how the auth guard fits into the middleware pipeline, see the [authentication reference](../frontend/authentication).

## Step 3: Read session data in the component

If your page needs to display user-specific data, read the session server-side:

```typescript title="apps/ui/src/app/[locale]/auth/dashboard/_components/DashboardView.tsx"
import { getSessionSSR } from "@/lib/auth"
import { headers } from "next/headers"

export async function DashboardView() {
  const session = await getSessionSSR(await headers())

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Signed in as {session?.user?.email}</p>
    </div>
  )
}
```

The `session.user` object contains: `id`, `email`, `strapiJWT`, `blocked`, and `provider`.

For details on how the middleware pipeline processes requests before they reach your page, see the [middleware reference](../frontend/middleware).

:::warning
Do not skip `setRequestLocale` in `page.tsx` — it is required for `next-intl` static rendering even if your component does not use translations directly.
:::
