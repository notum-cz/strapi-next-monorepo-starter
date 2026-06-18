---
sidebar_position: 4
---

# Asset Proxy

Route: `/api/asset/[...slug]`

File:

```txt
apps/ui/src/app/api/asset/[...slug]/route.ts
```

This route lets client-side components load Strapi assets without knowing the private Strapi origin URL.

:::warning Uploads only
Only paths under `uploads/` are allowed. Other paths return `403 Forbidden`.
:::

:::tip Local uploads
The route is useful when Strapi local uploads return relative asset URLs. External storage providers such as S3 often return absolute URLs and do not need this proxy.
:::
