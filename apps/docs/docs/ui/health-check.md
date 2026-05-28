# Health Check

The UI exposes a small health endpoint for uptime probes:

```txt
GET /api/health
```

Route file:

```txt
apps/ui/src/app/api/health/route.ts
```

The endpoint is dynamic and returns a no-store JSON response so external monitors can check that the Next.js server is running.
