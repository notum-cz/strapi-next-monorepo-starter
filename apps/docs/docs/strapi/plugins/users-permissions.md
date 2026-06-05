---
sidebar_position: 2
---

# Users Permissions

The [`users-permissions`](https://docs.strapi.io/cms/features/users-permissions) plugin handles Strapi user JWTs.

JWT expiry is set to **30 days** to match the Better Auth session `maxAge` (`apps/strapi/config/plugins.ts:14`). Change both together or sessions and JWTs will desync.

See [Authentication](../../auth/ui/authentication.md) for the full UI auth flow.
