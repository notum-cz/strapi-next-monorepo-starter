#!/bin/bash

# Quick fix script - Nettoie et relance le frontend

echo "🧹 Étape 1: Nettoyage du cache..."
rm -rf apps/ui/.next 2>/dev/null || true

echo "🔄 Étape 2: Installation des dépendances..."
pnpm install

echo "🔨 Étape 3: Build TypeScript..."
cd apps/ui
pnpm typecheck

echo "✅ Nettoyage complète!"
echo ""
echo "📝 Prochaines étapes:"
echo ""
echo "Terminal 1 - Strapi Backend:"
echo "  pnpm dev --filter=@repo/strapi"
echo ""
echo "Terminal 2 - Next.js Frontend:"
echo "  pnpm dev --filter=@repo/ui"
echo ""
echo "Puis accédez à:"
echo "  Frontend:  http://localhost:3000"
echo "  Strapi:    http://localhost:1337/admin"
echo "  Games:     http://localhost:3000/games"
