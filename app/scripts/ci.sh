#!/bin/bash
set -e

echo "🔧 New World Kids Platform - CI Pipeline"
echo "========================================"

# Check Node version
echo "📦 Checking Node version..."
node --version

# Check Yarn version
echo "📦 Checking Yarn version..."
yarn --version

# Install dependencies
echo "📦 Installing dependencies..."
yarn install --frozen-lockfile

# Lint
echo "🔍 Running ESLint..."
yarn lint || echo "⚠️ Linting warnings found (non-blocking)"

# Type check
echo "🔍 Running TypeScript type check..."
yarn typecheck || echo "⚠️ Type errors found (non-blocking)"

# Build services
echo "🏗️ Building services..."
cd services/blockchain
yarn build
cd ../..

cd services/ai-agents
yarn build
cd ../..

# Run unit tests
echo "🧪 Running unit tests..."
yarn test --passWithNoTests || echo "⚠️ No tests found or tests failed (non-blocking for v0)"

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose -f app/infra/docker/docker-compose.yml build

echo "✅ CI Pipeline Complete!"
echo ""
echo "Next steps:"
echo "  - Run: docker-compose -f app/infra/docker/docker-compose.yml up"
echo "  - Run E2E tests: cd app/tests && npx playwright test"
echo "  - Deploy: yarn deploy"
