# ==============================================================================
# PRODUCTION DOCKERFILE FOR STRAPI MONOREPO
# Optimized multi-stage build for Render deployment
# ==============================================================================

# Stage 1: Base image with Node.js 22
FROM node:22-alpine AS base
RUN apk update && apk add --no-cache libc6-compat git
WORKDIR /app
ENV NODE_ENV=production

# Stage 2: Install dependencies
FROM base AS dependencies
WORKDIR /app

# Copy package files
COPY package.json yarn.lock .yarnrc .npmrc* ./
COPY turbo.json ./

# Copy workspace package.json files
COPY services/cms/package.json ./services/cms/
COPY services/stellar-agents/package.json ./services/stellar-agents/
COPY services/stream/package.json ./services/stream/
COPY services/newworldkids-backend/package.json ./services/newworldkids-backend/
COPY services/blockchain/package.json ./services/blockchain/
COPY services/ai-agents/package.json ./services/ai-agents/
COPY services/browser-service/package.json ./services/browser-service/
COPY services/chrome-devtools-mcp/package.json ./services/chrome-devtools-mcp/
COPY services/computer-control/package.json ./services/computer-control/
COPY services/big-3-orchestrator/package.json ./services/big-3-orchestrator/

# Copy any app package.json files if they exist
COPY apps/*/package.json ./apps/ 2>/dev/null || true
COPY packages/*/package.json ./packages/ 2>/dev/null || true

# Install dependencies with caching
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=locked \
    yarn install --frozen-lockfile --production=false --network-timeout 100000

# Stage 3: Build
FROM base AS builder
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ gcc autoconf automake libc-dev \
    zlib-dev libpng-dev vips-dev cairo-dev jpeg-dev pango-dev giflib-dev

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services ./services
COPY --from=dependencies /app/apps ./apps
COPY --from=dependencies /app/packages ./packages

# Copy source code
COPY . .

# Build all services
RUN yarn build

# Stage 4: Production runner
FROM base AS runner
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    vips-dev \
    tini \
    && addgroup --system --gid 1001 appuser \
    && adduser --system --uid 1001 appuser

# Copy built application
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /app/services ./services
COPY --from=builder --chown=appuser:appuser /app/apps ./apps
COPY --from=builder --chown=appuser:appuser /app/packages ./packages
COPY --from=builder --chown=appuser:appuser /app/package.json ./
COPY --from=builder --chown=appuser:appuser /app/yarn.lock ./
COPY --from=builder --chown=appuser:appuser /app/turbo.json ./

# Create required directories
RUN mkdir -p /app/.cache /app/public/uploads \
    && chown -R appuser:appuser /app

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:${PORT:-1337}/admin', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Expose port (Render will override with PORT env var)
EXPOSE ${PORT:-1337}

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application (CMS by default)
CMD ["yarn", "start:cms"]
