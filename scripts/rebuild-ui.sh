#!/bin/bash

# Clean and rebuild script for Next.js frontend

echo "🧹 Nettoyage du cache Next.js..."
rm -rf apps/ui/.next
rm -rf apps/ui/node_modules/.next

echo "🔨 Rebuild du frontend..."
cd apps/ui
pnpm build

echo "✅ Rebuild complète!"
echo ""
echo "Pour lancer en développement:"
echo "  pnpm dev --filter=@repo/ui"
echo ""
echo "Pour lancer en production:"
echo "  pnpm start --filter=@repo/ui"
