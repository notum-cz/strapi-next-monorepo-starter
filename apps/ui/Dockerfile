# This is PRODUCTION Dockerfile for Next.js in Turborepo.
# It's assumed that this Dockerfile is run from the root of the monorepo.

# Related references:
# - https://github.com/vercel/turbo/blob/main/examples/with-docker/apps/web/Dockerfile
# - https://turborepo.com/docs/guides/tools/docker

# Customize APP (name of folder in /apps) and WORKSPACE (name from package.json) to match this app
ARG APP=ui
ARG WORKSPACE=@repo/ui

# The reason is that Debian (slim image) uses glibc that has faster runtime performance.
# https://edu.chainguard.dev/chainguard/chainguard-images/about/images-compiled-programs/glibc-vs-musl/#high-level-differences-between-glibc-and-musl
FROM node:22-slim AS base

# Install pnpm globally
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# ---
FROM base AS prepare
ARG WORKSPACE

# Install turbo globally to prune below
RUN pnpm add -g turbo@2.7.3

COPY . .

# Materialize generated .d.ts files (symlink may not survive prune)
# If generated/ is a symlink, replace it with a real directory + copied files.
# This runs while we still have the full repo in the Docker build context
RUN set -eux; \
  rm -rf "packages/strapi-types/generated"; \
  mkdir -p "packages/strapi-types/generated"; \
  cp -f apps/strapi/types/generated/*.d.ts "packages/strapi-types/generated/"

# see https://turbo.build/repo/docs/reference/command-line-reference#turbo-prune---scopetarget
RUN turbo prune ${WORKSPACE} --docker

# ---
FROM base AS builder

# Install turbo globally to use during build below
RUN pnpm add -g turbo@2.7.3

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prepare /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Installation with caching and frozen-lockfile
RUN \
    --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline --ignore-scripts

# Build the project and its dependencies
COPY --from=prepare /app/out/full/ .
COPY turbo.json turbo.json

# Set Next.js to output standalone build recommended for Docker
ENV NEXT_OUTPUT=standalone

# NextAuth secret is required even during build for NextAuth to work properly (Error [MissingSecretError]: Please define a `secret` in production)
# We use dummy secret at build, real one at runtime
# https://next-auth.js.org/errors#no_secret
ENV NEXTAUTH_SECRET=dummy-build-secret

# Optionally, pass all required information at build time to prebuild pages
ARG APP_PUBLIC_URL
ARG STRAPI_URL
ARG STRAPI_REST_READONLY_API_KEY # Sensitive data should not be used in the ARG or ENV commands!
ENV APP_PUBLIC_URL=${APP_PUBLIC_URL}
ENV STRAPI_URL=${STRAPI_URL}
ENV STRAPI_REST_READONLY_API_KEY=${STRAPI_REST_READONLY_API_KEY}

RUN turbo run build

# ---
FROM node:22-alpine AS runner
ARG APP

# Don't run production as root for security reasons
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/${APP}/next.config.mjs .
COPY --from=builder /app/apps/${APP}/package.json .

# Automatically leverage output traces to reduce image size - https://nextjs.org/docs/app/api-reference/config/next-config-js/output
# next.config.mjs's `output` options has to be set to "standalone" to make this work (see README)
COPY --from=builder --chown=nextjs:nextjs /app/apps/${APP}/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=builder --chown=nextjs:nextjs /app/apps/${APP}/public ./apps/${APP}/public

WORKDIR /apps/${APP}
EXPOSE 3000
CMD ["node", "server.js"]