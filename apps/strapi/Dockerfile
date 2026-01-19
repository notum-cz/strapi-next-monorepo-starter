# This is PRODUCTION Dockerfile for Strapi in Turborepo.
# It's assumed that this Dockerfile is run from the root of the monorepo.

# Related references:
# - https://docs.strapi.io/dev-docs/installation/docker#production-dockerfile
# - https://github.com/vercel/turbo/blob/main/examples/with-docker/apps/api/Dockerfile
# - https://dev.to/moofoo/creating-a-development-dockerfile-and-docker-composeyml-for-yarn-122-monorepos-using-turborepo-896

# Customize APP (name of folder in /apps) and WORKSPACE (name from package.json) to match this app
ARG APP=strapi
ARG WORKSPACE=@repo/strapi

FROM node:22-alpine AS base

RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git > /dev/null 2>&1

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set working directory
WORKDIR /app

# ---
FROM base AS prepare
ARG WORKSPACE

# Install turbo globally to prune below
RUN yarn global add turbo@^2.7.3

COPY . .

# see https://turbo.build/repo/docs/reference/command-line-reference#turbo-prune---scopetarget
RUN turbo prune ${WORKSPACE} --docker

# ---
FROM base AS builder

ARG APP

# Install turbo globally to use during build below
RUN yarn global add turbo@^2.7.3
# Install node-gyp globally to build native addons
RUN yarn global add node-gyp

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/yarn.lock ./yarn.lock

# see https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/reference.md#run---mounttypecache
RUN \
    --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=locked \
    yarn --prefer-offline --frozen-lockfile --ignore-scripts --production

ENV PATH=/app/apps/${APP}/node_modules/.bin:$PATH

# Build the project and its dependencies
COPY --from=prepare /app/out/full/ .
COPY turbo.json turbo.json

RUN turbo run build

# ---
FROM node:22-alpine AS runner

RUN apk add --no-cache vips-dev

ARG APP
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Don't run production as root
RUN addgroup --system --gid 1001 strapi
RUN adduser --system --uid 1001 strapi

WORKDIR /app
COPY --from=builder --chown=strapi:strapi /app /app

ENV PATH=/app/apps/${APP}/node_modules/.bin:$PATH

USER strapi
WORKDIR /app/apps/${APP}
EXPOSE ${PORT:-1337}
CMD ["yarn", "start"]