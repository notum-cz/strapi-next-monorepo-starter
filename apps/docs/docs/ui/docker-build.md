---
sidebar_position: 13
---

# Docker Build

The UI Dockerfile builds Next.js in `standalone` mode for a smaller runtime image. `NEXT_OUTPUT=standalone` is set in:

```txt
apps/ui/Dockerfile
```

:::info Production runtime image
The Dockerfile is intended for production runs. Use the local development commands from [Installation](./installation.md) when working on the UI locally.
:::

Run Docker commands from the monorepo root. Turborepo needs the root `package.json`, `pnpm-lock.yaml`, and `turbo.json` during the build.

## Build Strategies

Choose a build strategy based on when pages should render and where environment values should be supplied. See [Caching](./caching.md) for ISR/static behavior and [Next Configuration](./next-config.md) for `NEXT_OUTPUT` modes.

### Build once, deploy many

No env vars are passed at build time. Pages render at runtime, so the same image can be used for staging and production.

```bash
docker build -t starter-ui:latest -f apps/ui/Dockerfile .
```

:::tip Remove build-time env wiring

For this strategy, remove the optional build-time env block from `apps/ui/Dockerfile` so secrets and environment-specific URLs are not baked into the image:

```dockerfile
# Optionally, pass all required information at build time to prebuild pages
ARG APP_PUBLIC_URL
ARG STRAPI_URL
ARG STRAPI_REST_READONLY_API_KEY # Sensitive data should not be used in the ARG or ENV commands!
ENV APP_PUBLIC_URL=${APP_PUBLIC_URL}
ENV STRAPI_URL=${STRAPI_URL}
ENV STRAPI_REST_READONLY_API_KEY=${STRAPI_REST_READONLY_API_KEY}
```

Provide these values at container runtime instead.

:::

### Build per environment

Pass Strapi connection values as build args so pages can be pre-rendered during the image build. This gives a faster first request, but the image is tied to that environment and bakes the read-only Strapi API key into the image.

```bash
docker build -t starter-ui:latest -f apps/ui/Dockerfile \
  --build-arg STRAPI_URL="http://host.docker.internal:1337" \
  --build-arg STRAPI_REST_READONLY_API_KEY="your-readonly-api-key" \
  --build-arg APP_PUBLIC_URL="http://localhost:3000" \
  --progress=plain \
  .
```

## Run

```bash
docker run -it --rm --name starter-ui -p 3000:3000 \
  --env-file apps/ui/.env.local starter-ui:latest
```
