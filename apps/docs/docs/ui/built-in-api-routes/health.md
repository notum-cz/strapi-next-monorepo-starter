---
sidebar_position: 6
---

# Health Check API

Route: `/api/health`

File:

```txt
apps/ui/src/app/api/health/route.ts
```

This route returns `200 OK` with `{ "data": "OK" }` when the Next.js server is running.

:::tip Uptime probes
It is `force-dynamic` and sends `Cache-Control: no-store`, so uptime probes do not read stale health responses.
:::
