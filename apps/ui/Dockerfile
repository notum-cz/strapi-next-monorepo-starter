# This is PRODUCTION Dockerfile for Next.js in Turborepo.
# It's assumed that this Dockerfile is run from the root of the monorepo.

# Created according to following examples:
# - https://github.com/vercel/turbo/blob/main/examples/with-docker/apps/web/Dockerfile
# - https://dev.to/moofoo/creating-a-development-dockerfile-and-docker-composeyml-for-yarn-122-monorepos-using-turborepo-896

# Customize APP (name of folder in /apps) and WORKSPACE (name from package.json) to match this app
ARG APP=ui
ARG WORKSPACE=@repo/ui

FROM node:22-alpine AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update && apk add --no-cache libc6-compat

# -------------------------- stage pruned ---------------------------------
FROM base AS pruned
ARG WORKSPACE

# Set working directory
WORKDIR /app
COPY . .

RUN yarn global add turbo@^1.13.4
# see https://turbo.build/repo/docs/reference/command-line-reference#turbo-prune---scopetarget
RUN turbo prune ${WORKSPACE} --docker

# -------------------------- stage installer ---------------------------------
FROM base AS installer
ARG APP
ARG WORKSPACE

WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=pruned /app/out/json/ .
COPY --from=pruned /app/out/yarn.lock ./yarn.lock

RUN yarn global add turbo@^1.13.4

RUN \
    --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=locked \
    yarn --prefer-offline --frozen-lockfile --ignore-scripts

# Because of yarn v1 install sharp explicitly with "--ignore-engines". See https://github.com/lovell/sharp/issues/3871
RUN \
    --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=locked \
    yarn workspace ${WORKSPACE} add sharp --ignore-engines --prefer-offline --frozen-lockfile

# Build the project and its dependencies
COPY --from=pruned /app/out/full/ .
COPY turbo.json turbo.json

ENV NODE_ENV=production

RUN turbo run build --filter=${WORKSPACE}

# -------------------------- stage runner ---------------------------------
FROM base AS runner
ARG APP
ARG WORKSPACE
ENV NODE_ENV=production

RUN apk update && apk add --no-cache vips-dev

# Don't run production as root
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs
USER nextjs

WORKDIR /app
COPY --from=installer /app/apps/${APP}/next.config.mjs .
COPY --from=installer /app/apps/${APP}/package.json .

# Automatically leverage output traces to reduce image size - https://nextjs.org/docs/14/pages/api-reference/next-config-js/output
# next.config.mjs's `output` options has to be set to "standalone" to make this work (see README)
COPY --from=installer --chown=nextjs:nextjs /app/apps/${APP}/.next/standalone ./
COPY --from=installer --chown=nextjs:nextjs /app/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=installer --chown=nextjs:nextjs /app/apps/${APP}/public ./apps/${APP}/public

WORKDIR /app/apps/${APP}
EXPOSE ${PORT:-3000}
CMD ["node", "server.js"]
