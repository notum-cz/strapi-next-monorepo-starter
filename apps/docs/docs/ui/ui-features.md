---
sidebar_position: 3
---

# UI Features

`apps/ui` includes a few operational features around the actual page rendering: middleware, error handling, observability, SEO helpers, runtime env handling, and development diagnostics.

Use this page as a map. Each feature has its own short reference:

- [Project Structure](./project-structure.md) — where UI code belongs
- [shadcn/ui](./shadcn-ui.md) — component library setup and conventions
- [Edge Proxies](./edge-proxies.md) — Next.js middleware chain
- [Strapi API Client](./strapi-api-client.md) — typed Strapi clients and API proxy routes
- [Error Handling](./error-handling.md) — route and component boundaries
- [Sentry](./sentry.md) — runtime error reporting and source maps
- [reCAPTCHA v3](./recaptcha.md) — anti-bot helpers for forms
- [SEO](./seo.md) — metadata, sitemap, robots.txt, structured data
- [Caching](./caching.md) — Strapi request cache and ISR defaults
- [Health Check](./health-check.md) — `/api/health`
- [Log Verbosity](./log-verbosity.md) — development debug flags
- [Environment Variables](./environment-variables.md) — `.env.local`, `getEnvVar()`, and runtime public env injection
- [Docker Build](./docker-build.md) — standalone image and build args
- [Rendering Modes](./rendering-modes.md) — output modes and route-level rendering behavior

For request and data flow, see [Strapi API Client](./strapi-api-client.md). For images, see [Image Optimization](./images.md).
