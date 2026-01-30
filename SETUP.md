# Strapi + Next.js Game Database Monorepo

Architecture complète pour une plateforme de gestion de jeux avec Strapi v5 et Next.js 16.

## 🏗️ Architecture

### Backend (Strapi v5.33.3)
- **URL**: http://localhost:1337
- **Admin**: http://localhost:1337/admin
- **API**: http://localhost:1337/api
- **Base de données**: PostgreSQL 16
- **Authentification**: JWT avec session admin

### Frontend (Next.js 16.1.5 + Turbopack)
- **URL**: http://localhost:3000
- **Framework**: Next.js avec Turbopack
- **Styling**: Tailwind CSS v4
- **State**: Sentry pour monitoring

### Packages partagés
- `@repo/design-system` - Composants Tailwind
- `@repo/eslint-config` - Configuration ESLint
- `@repo/prettier-config` - Configuration Prettier
- `@repo/shared-data` - Données partagées
- `@repo/strapi-types` - Types TypeScript générés
- `@repo/typescript-config` - Configuration TypeScript

### QA
- `@repo/tests-playwright` - Tests E2E

## 📋 Modèles de données

### Collections

#### 🎮 Game
Entité centrale représentant un jeu vidéo.
```
- title: string (requis)
- slug: string (unique)
- version: string
- description: richtext
- status: enum [Ongoing, Completed, Hiatus, Cancelled]
- release_date: date
- is_featured: boolean
- trending_score: integer (0-100)
- developer: relation manyToOne -> Developer
- genres: relation manyToMany -> Genre
- tags: relation manyToMany -> Tag
- engine: relation manyToOne -> Engine
- platforms: relation manyToMany -> Platform
- downloads: component (repeatable) -> downloadlink
- gallery: component -> media.gallery
- requirements: component -> system.requirements
- seo: component -> seo.seo
```

#### 👨‍💻 Developer
Créateur/Éditeur de jeux.
```
- name: string (requis)
- slug: string (unique)
- logo: media
- patreon_link: string
- website_link: string
- twitter: string
- discord: string
- subscribestar: string
```

#### 📰 BlogPost
Articles d'actualités et annonces.
```
- title: string
- slug: string (unique)
- content: richtext
- publishedAt: datetime
- related_games: relation manyToMany -> Game
```

#### 🏷️ Genre, Tag, Engine, Platform
Taxonomies de filtrage.
```
- name: string
- slug: string (unique)

Tag a une propriété supplémentaire:
- is_explicit: boolean (pour contenu NSFW)
```

#### 🏠 Homepage (Single Type)
Contenu de la page d'accueil.
```
- hero_slider: component (repeatable)
- featured_categories: relation manyToMany -> Genre
- announcement_banner: richtext
```

#### ⚙️ GlobalSettings (Single Type)
Configuration globale du site.
```
- site_name: string
- logo: media
- footer_text: richtext
- social_links: component
- dmca_text: richtext
```

### Components

#### downloads.downloadlink
Lien de téléchargement pour un jeu.
```
- label: string
- host: enum [Mega, GoogleDrive, Workupload, Gofile, Pixeldrain]
- url: string
- file_size: string
- password: string
- platform_icon: relation manyToOne -> Platform
```

#### media.gallery
Galerie d'images et vidéos.
```
- screenshots: media (multiple)
- trailer_url: string
- is_nsfw_preview: boolean
```

#### system.requirements
Spécifications système PC.
```
- os: string
- processor: string
- ram: string
- graphics: string
- storage: string
```

#### seo.seo
Métadonnées SEO.
```
- metaTitle: string
- metaDescription: string
- metaImage: media
- keywords: string
```

#### shared.socials
Liens sociaux (inutilisé - remplacé par champs directs sur Developer).
```
- twitter: string
- discord: string
- youtube: string
```

## 🚀 Démarrage

### Prérequis
- Node.js v24.13.0
- pnpm 10.28.1
- Docker & Docker Compose (pour PostgreSQL)
- Git

### Installation

```bash
# Cloner le repo
git clone <repo-url>
cd strapi-next-monorepo-starter

# Installer les dépendances
pnpm install

# Relancer si nécessaire les containers Docker
docker compose up -d db
```

### Développement

```bash
# Démarrer tous les services en développement
pnpm run dev

# Ou démarrer individuellement
cd apps/strapi && pnpm run develop    # Strapi sur :1337
cd apps/ui && pnpm run dev            # Next.js sur :3000
```

### Accès

| Service | URL | Credentials |
|---------|-----|-------------|
| Strapi Admin | http://localhost:1337/admin | admin@strapi.local / Admin123! |
| Strapi API | http://localhost:1337/api | N/A (public/token) |
| Next.js UI | http://localhost:3000 | N/A |

## 🌱 Données de seed

Au premier démarrage, les données suivantes sont automatiquement créées:

### Genres
- RPG
- Visual Novel
- Dating Sim
- Sandbox
- Management

### Tags
- Incest (explicit)
- NTR (explicit)
- Corruption (explicit)
- MILF (explicit)
- Male Protagonist

### Engines
- Ren'Py
- Unity
- RPG Maker
- Unreal Engine

### Platforms
- Windows
- Mac
- Linux
- Android

### Sample Data
- Developer: "Notum Studio"
- Game: "Sample Game" (lié à Notum Studio)

Le seeding s'effectue dans le bootstrap Strapi et ignore les éléments existants.

## 📁 Structure des fichiers

```
apps/
├── strapi/                          # Backend Strapi
│   ├── src/
│   │   ├── index.ts                 # Bootstrap & seed
│   │   ├── api/                     # Content types
│   │   ├── components/              # Reusable components
│   │   ├── config/                  # Configuration
│   │   ├── extensions/
│   │   ├── lifeCycles/
│   │   ├── utils/
│   │   └── types/
│   ├── public/
│   ├── database/
│   └── package.json
│
├── ui/                              # Frontend Next.js
│   ├── src/
│   │   ├── app/                     # App router
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── styles/
│   │   └── types/
│   ├── public/
│   └── package.json

packages/
├── design-system/                   # Shared UI components
├── eslint-config/                   # ESLint rules
├── prettier-config/                 # Prettier configuration
├── shared-data/                     # Shared types & utils
├── strapi-types/                    # Generated types
└── typescript-config/               # TS configuration

qa/
└── tests/
    └── playwright/                  # E2E tests

package.json                          # Workspace root
pnpm-workspace.yaml                   # Workspace configuration
turbo.json                            # Turbo build configuration
```

## 🔧 Configuration

### Variables d'environnement

#### Strapi (.env.local)
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi-db
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi
STRAPI_ADMIN_BACKEND_URL=http://localhost:1337
```

#### Next.js (.env.local)
```
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
```

## 📚 Scripts utiles

```bash
# Workspace
pnpm run dev                         # Tous les dev servers
pnpm run build                       # Builder tout
pnpm run lint                        # Linter
pnpm format                          # Format code

# Strapi
cd apps/strapi
pnpm run develop                     # Dev mode
pnpm run build                       # Production build
pnpm run start                       # Run production
pnpm strapi admin:create-user        # Créer admin

# Next.js
cd apps/ui
pnpm run dev                         # Dev avec Turbopack
pnpm run build                       # Production
pnpm run start                       # Run production
```

## 🔐 Authentification

### Admin Strapi
- **Email**: admin@strapi.local
- **Password**: Admin123!
- **Méthode**: JWT (30 jours TTL)

### API Public
- Lecture seule pour les données publiques
- Endpoints standards RESTful
- Pagination support: `?pagination[pageSize]=25&pagination[page]=1`
- Populate: `?populate=*` ou `?populate[nested]=*`
- Filtering: `?filters[status][$eq]=Completed`
- Sorting: `?sort=trending_score:desc`

## 🐛 Dépannage

### Strapi ne démarre pas
1. Vérifiez que PostgreSQL est en cours d'exécution: `docker ps`
2. Effacez le cache: `rm -rf apps/strapi/dist node_modules/.cache`
3. Reconstruisez: `pnpm install && pnpm run build`

### Port déjà utilisé
```bash
# Strapi (1337)
lsof -i :1337 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Next.js (3000)
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### PostgreSQL connexion error
```bash
# Redémarrer la base
docker compose down db
docker compose up -d db
```

## 📚 Documentation supplémentaire

- [Strapi Documentation](https://docs.strapi.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [Turbo Documentation](https://turbo.build/repo/docs)

## 📝 Notes

- Le projet utilise pnpm avec workspace pour la gestion des packages
- Turbo est configuré pour les builds optimisés
- TypeScript est utilisé dans toutes les applis
- Les types Strapi sont générés automatiquement lors du démarrage
- Prettier + ESLint configurés pour la qualité du code
- Sentry est intégré pour le monitoring (désactivé si DSN manquant)

## 🎯 Prochaines étapes

1. **Configurer les permissions Strapi**: Personnaliser l'accès aux collections
2. **Implémenter les appels API**: Connecter Next.js à Strapi
3. **Ajouter l'authentification utilisateur**: Système d'utilisateurs (not admin)
4. **Mettre en place les paiements**: Patreon/abonnement
5. **Configurer le déploiement**: Docker, GitHub Actions CI/CD
6. **Tests**: Ajouter les tests unitaires et E2E

## 📄 License

MIT (ou selon votre choix)
