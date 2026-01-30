# 🎮 Strapi + Next.js Monorepo Starter - Games Frontend

Architecture moderne et performante pour un système de gestion de jeux avec **Strapi (Headless CMS)** et **Next.js (Frontend Headless)**.

## 🌟 Caractéristiques principales

### Frontend (Next.js)

- ⚡ **SSG (Static Site Generation)** - Pages pré-générées pour performance maximale
- 🔄 **ISR (Incremental Static Regeneration)** - Mise à jour sans rebuild complet
- 🎯 **Performance** - <50ms TTFB (Time To First Byte)
- 🌍 **Multi-locale** - Support EN, CS, FR, DE
- 📱 **Responsive** - Design fully responsive
- 🔐 **Type-safe** - Full TypeScript support
- 🎨 **Modern UI** - Radix UI + Tailwind CSS
- 🧩 **Monorepo** - Turbo repo + pnpm workspaces

### Backend (Strapi)

- 📦 **Content Management** - Gestion complète des jeux
- 🎨 **Page Builder** - Constructeur de pages drag-and-drop
- 🔗 **Relations** - Developers, Genres, Platforms
- 🖼️ **Media Management** - Upload et optimisation d'images
- 🔒 **Webhooks** - ISR triggers
- 🌍 **i18n** - Traductions multi-langues
- ✅ **Validation** - Validation des données

## 📁 Structure du projet

```
strapi-next-monorepo-starter/
├── apps/
│   ├── strapi/                    # Backend Strapi
│   │   ├── config/
│   │   ├── database/
│   │   ├── src/
│   │   │   ├── api/               # API endpoints
│   │   │   ├── components/        # Reusable components
│   │   │   └── utils/
│   │   └── ...
│   └── ui/                        # Frontend Next.js
│       ├── src/
│       │   ├── app/
│       │   │   ├── [locale]/
│       │   │   │   ├── games/     # Games routes (SSG+ISR)
│       │   │   │   └── ...
│       │   │   └── api/
│       │   │       └── revalidate/ # Webhook endpoint
│       │   ├── components/
│       │   ├── lib/
│       │   └── types/
│       └── ...
├── packages/                      # Shared packages
│   ├── design-system/            # Shared UI components
│   ├── eslint-config/            # Shared ESLint config
│   ├── shared-data/              # Shared data & utilities
│   ├── strapi-types/             # Generated Strapi types
│   ├── prettier-config/          # Shared Prettier config
│   └── typescript-config/        # Shared TypeScript config
├── qa/
│   └── tests/
│       └── playwright/           # E2E tests
├── docs/                          # Documentation
│   ├── FRONTEND_ARCHITECTURE.md
│   ├── SSG_ISR_SETUP_GUIDE.md
│   ├── ARCHITECTURE_DIAGRAMS.md
│   └── GAMES_FRONTEND_README.md
└── ...
```

## 🚀 Quick Start

### Prérequis

- Node.js 18+
- pnpm 8+
- Docker (optionnel, pour Strapi)

### Installation

```bash
# Clone le repo
git clone <repo-url>
cd strapi-next-monorepo-starter

# Install dependencies
pnpm install

# Setup environment files
cp apps/strapi/.env.example apps/strapi/.env.local
cp apps/ui/.env.example apps/ui/.env.local

# Configure Strapi webhook secret
# STRAPI_WEBHOOK_SECRET=your-secret-key
```

### Démarrage en développement

```bash
# Lancer les deux apps avec Turbo
pnpm dev

# Ou individuellement:
# Strapi Backend
pnpm dev --filter=@repo/strapi

# Next.js Frontend
pnpm dev --filter=@repo/ui
```

Accédez:
- Frontend: http://localhost:3000
- Strapi: http://localhost:1337/admin
- API Strapi: http://localhost:1337/api

### Création des données d'exemple

```bash
# Seed des jeux et genres
cd apps/strapi
pnpm seed
```

### Build & Deploy

```bash
# Build all
pnpm build

# Build frontend avec SSG
pnpm build --filter=@repo/ui

# Lancer le frontend en production
pnpm -F @repo/ui start
```

## 📖 Documentation

### Architecture Frontend

Pour comprendre comment SSG et ISR fonctionnent ensemble:

📄 **[FRONTEND_ARCHITECTURE.md](./docs/FRONTEND_ARCHITECTURE.md)**
- Concepts SSG et ISR
- Architecture des fichiers
- Configuration détaillée
- Performance metrics

### Guide de setup

Pour mettre en place l'environnement complet:

📄 **[SSG_ISR_SETUP_GUIDE.md](./docs/SSG_ISR_SETUP_GUIDE.md)**
- Configuration étape par étape
- Configuration des webhooks Strapi
- Tests et debugging
- Déploiement sur Vercel

### Diagrammes d'architecture

Pour visualiser le flux de données:

📄 **[ARCHITECTURE_DIAGRAMS.md](./docs/ARCHITECTURE_DIAGRAMS.md)**
- Architecture global
- Flow de build
- Flow de requests
- Timeline ISR
- Diagrammes Mermaid

### Frontend Games

Documentation spécifique pour les pages de jeux:

📄 **[GAMES_FRONTEND_README.md](./docs/GAMES_FRONTEND_README.md)**
- Résumé de l'architecture
- Features principales
- Configuration
- Performance
- Checklist de déploiement

## 🎮 Pages de jeux - Features

### Listing `/games`

- ✅ Grille responsive 1-4 colonnes
- ✅ Filtrage par genre et plateforme
- ✅ Recherche en temps réel
- ✅ Pagination côté client
- ✅ Images optimisées avec Next.js Image
- ✅ SSG + ISR pour performance

### Détail `/games/[slug]`

- ✅ Hero section avec cover
- ✅ Informations complètes du jeu
- ✅ Galerie de screenshots
- ✅ Lien vers site officiel
- ✅ Trailer vidéo embédé
- ✅ Jeux recommandés
- ✅ SEO optimisé
- ✅ Breadcrumbs
- ✅ SSG + ISR pour performance

## 🔄 Workflow ISR

### 1. Build Time (SSG)

```
pnpm build
  ↓
generateStaticParams() exécuté
  ↓
Fetch tous les slugs de jeux
  ↓
Pour chaque slug → Générer HTML statique
  ↓
Deploy
```

### 2. Update in Strapi

```
Admin modifie un jeu
  ↓
Strapi déclenche webhook
  ↓
POST /api/revalidate
  ↓
revalidatePath() appelé
  ↓
Page marquée pour regénération
  ↓
À la prochaine visite → Nouvelle version servie
```

### 3. Performance Impact

| Métrique | Avant ISR | Après ISR |
|----------|-----------|-----------|
| Time to First Byte | <50ms | <50ms |
| Build Time | 1-5 min | 1-5 min (initial) |
| Mise à jour | Rebuild (5-10 min) | ISR (5-10 sec bg) |
| Coûts | Élevés | Très bas |

## 🛠️ Configuration

### Variables d'environnement Strapi

```env
# apps/strapi/.env.local
DATABASE_CLIENT=sqlite
JWT_SECRET=your-jwt-secret
API_TOKEN_SALT=your-api-token-salt
TRANSFER_TOKEN_SALT=your-transfer-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
```

### Variables d'environnement Frontend

```env
# apps/ui/.env.local
STRAPI_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_TOKEN=your-strapi-api-token
NEXT_OUTPUT=standalone
```

## 📦 Packages

### `@repo/design-system`

Design system partagé avec Tailwind CSS et Radix UI.

```typescript
import { Button, Card, Input } from "@repo/design-system"
```

### `@repo/shared-data`

Données et utilitaires partagés.

```typescript
import { ROOT_PAGE_PATH, joinStrapiPagePath } from "@repo/shared-data"
```

### `@repo/strapi-types`

Types générés automatiquement depuis Strapi.

```typescript
import type { Game, GameLocalizationResponse } from "@repo/strapi-types"
```

## 🧪 Tests

### E2E Tests (Playwright)

```bash
cd qa/tests/playwright

# Lancer les tests
pnpm test

# Mode headless
pnpm test:ui

# Debugging
pnpm test:debug
```

## 🚢 Déploiement

### Vercel (Recommandé)

```bash
# Connecter le repo GitHub
# Ajouter les variables d'env dans Vercel

# Framework: Next.js
# Root Directory: apps/ui
# Build Command: pnpm build --filter=@repo/ui
# Output Directory: .next
```

### Docker

```bash
# Build Docker image
docker build -f apps/ui/Dockerfile -t games-ui .

# Run container
docker run -p 3000:3000 games-ui
```

## 🔐 Sécurité

- ✅ Validation de webhooks avec secret
- ✅ CORS configuré
- ✅ CSP headers
- ✅ XSS protection
- ✅ Sanitization des données

## 🐛 Debugging

### Webhook ISR

```bash
# Test le webhook
curl -X POST http://localhost:3000/api/revalidate \
  -H "x-strapi-webhook-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "games.update",
    "data": { "slug": "test-game" }
  }'
```

### Logs

```bash
# Frontend logs
pnpm dev --filter=@repo/ui

# Strapi logs
pnpm dev --filter=@repo/strapi

# Vercel logs
vercel logs --follow
```

## 📊 Performance Monitoring

### Lighthouse

```bash
# Audit frontend
pnpm build --filter=@repo/ui
pnpm start --filter=@repo/ui
# Ouvrir http://localhost:3000 et exécuter Lighthouse
```

### Sentry (Configuration optionnelle)

```env
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token
```

## 🤝 Contributing

1. Fork le repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

Ce projet est sous license [MIT](LICENSE).

## 👥 Support

Pour des questions ou problèmes:

1. Vérifiez la [documentation](./docs/)
2. Ouvrez une [issue](../../issues)
3. Consultez les [discussions](../../discussions)

## 🔗 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Strapi Documentation](https://docs.strapi.io/)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

**Made with ❤️ by Notum Technologies**

Dernière mise à jour: 29 January 2026
