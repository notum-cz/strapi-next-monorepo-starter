# Architecture Frontend avec SSG et ISR

## Vue d'ensemble

Cette architecture utilise **Next.js** avec **Static Site Generation (SSG)** et **Incremental Static Regeneration (ISR)** pour créer une expérience utilisateur optimale avec des performances maximales.

## Concepts clés

### 1. Static Site Generation (SSG)

**Qu'est-ce que c'est?**
- Les pages sont générées au moment du **build** et non à chaque requête
- Les pages pré-générées sont servies instantanément (très rapide)
- Parfait pour le contenu qui change peu

**Avantages:**
- ⚡ Performance extrêmement rapide
- 🔒 Pas de calcul côté serveur à chaque requête
- 📊 SEO optimisé (HTML statique)
- 💰 Coûts d'infrastructure réduits

**Implémentation:**
```typescript
// Dans page.tsx
export async function generateStaticParams() {
  // Récupérer tous les slugs de jeux
  const games = await fetchAllGamesSlugs()
  return games.map(game => ({ slug: game.slug }))
}

// Cette fonction s'exécute au build time
export default async function GamePage({ params }) {
  const game = await fetchGameBySlug(params.slug)
  return <GameContent game={game} />
}
```

### 2. Incremental Static Regeneration (ISR)

**Qu'est-ce que c'est?**
- Permet de régénérer des pages statiques **en arrière-plan** sans reconstruire tout le site
- Les pages existantes restent en cache jusqu'à la fin de la période de revalidation
- Nouvelles pages peuvent être générées **à la première visite**

**Avantages:**
- 🔄 Mises à jour sans rebuild complet
- ⏰ Revalidation à intervalle régulier
- 🆕 Support des nouvelles pages non préexistantes
- 🚀 Meilleure performance qu'ISR traditionnel

**Configuration:**
```typescript
// Dans page.tsx
export const revalidate = 3600 // Revalidate toutes les 1 heure (en secondes)
export const dynamicParams = true // Générer les nouvelles pages à la première visite
```

## Architecture des fichiers

```
apps/ui/src/
├── app/
│   └── [locale]/
│       ├── games/                          # Route principale des jeux
│       │   ├── page.tsx                   # Page listing (SSG + ISR)
│       │   └── [slug]/
│       │       └── page.tsx               # Page de jeu (SSG + ISR)
│       └── api/
│           └── revalidate/
│               └── route.ts               # Webhook ISR
├── lib/
│   └── strapi-api/
│       └── games/
│           ├── server.ts                  # Fetch serveur (SSG)
│           ├── client.ts                  # Fetch client (CSR)
│           └── hooks.ts                   # React hooks
└── components/
    └── games/
        ├── GamePageContent.tsx            # Détail jeu
        └── GamesListingContent.tsx        # Listing jeux
```

## Flow de données

### Génération au Build (SSG)

```
[Build Time]
    ↓
generateStaticParams() exécuté
    ↓
Fetch tous les slugs de jeux depuis Strapi
    ↓
Pour chaque slug, générer une page HTML statique
    ↓
Déployer les fichiers statiques
```

### Mise à jour en Production (ISR)

```
[Strapi]
    ↓ (Webhook)
[Next.js API /api/revalidate]
    ↓
revalidatePath() appelé
    ↓
Page marquée pour regénération en arrière-plan
    ↓
Les anciennes versions restent en cache
    ↓
À la prochaine requête, la nouvelle page est servie
```

## Configuration détaillée

### Page de jeu individuelle (`[locale]/games/[slug]/page.tsx`)

```typescript
// ISR: Revalidate toutes les heures
export const revalidate = 3600

// Permettre les nouvelles pages non pré-générées
export const dynamicParams = true

// Pré-générer les paramètres au build
export async function generateStaticParams({ params: { locale } }) {
  const games = await fetchAllGamesSlugs(locale)
  return games.map(game => ({
    locale,
    slug: game.slug
  }))
}
```

### Page de listing (`[locale]/games/page.tsx`)

```typescript
// ISR: Revalidate toutes les heures
export const revalidate = 3600

// Générer pour toutes les locales
export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}
```

## Configuration du webhook Strapi

### 1. Récupérer l'URL publique de Next.js

Si vous utilisez Vercel:
```
https://your-domain.vercel.app/api/revalidate
```

### 2. Créer un webhook dans Strapi

1. Allez à **Settings → Webhooks**
2. Cliquez sur **Add webhook**
3. Configurez:
   - **Name:** "ISR Revalidation"
   - **URL:** `https://your-domain.vercel.app/api/revalidate`
   - **Events:** 
     - `games.create`
     - `games.update`
     - `games.delete`

4. Ajoutez un header personnalisé:
   - **Key:** `x-strapi-webhook-secret`
   - **Value:** Votre secret (définir en variable d'env `STRAPI_WEBHOOK_SECRET`)

5. **Save**

### 3. Variables d'environnement

Ajouter au fichier `.env.local`:
```env
# ISR Webhook Secret (doit correspondre au header du webhook Strapi)
STRAPI_WEBHOOK_SECRET=your-secret-key-here

# Optionnel: Skip verification en développement
SKIP_WEBHOOK_VERIFY=true
```

## Exemple de payload webhook

Quand un jeu est mis à jour dans Strapi:

```json
{
  "event": "games.update",
  "data": {
    "id": 1,
    "slug": "elden-ring",
    "title": "Elden Ring",
    "description": "...",
    "updatedAt": "2026-01-29T10:30:00.000Z"
  }
}
```

Le endpoint `/api/revalidate` va:
1. Vérifier la signature du webhook
2. Extraire le slug du jeu
3. Appeler `revalidatePath()` pour:
   - `/en/games/elden-ring`
   - `/cs/games/elden-ring`
   - `/en/games`
   - `/cs/games`
   - Etc. pour toutes les locales

## Performance

### Avantages de SSG + ISR

| Métrique | SSG | ISR | SSR |
|----------|-----|-----|-----|
| **Time to First Byte (TTFB)** | <50ms | <50ms | 200-500ms |
| **Cache** | CDN global | CDN global | Aucun |
| **Latence** | Minimale | Minimale | Variable |
| **Coût** | Très bas | Très bas | Élevé |

### Temps de build

- Premier build: 30-60 secondes (génération de toutes les pages)
- Mises à jour: ISR regénère individuellement en arrière-plan (rapide)

## Limitations et considérations

### SSG
- ❌ Ne convient pas au contenu très dynamique
- ❌ Les pages sont figées jusqu'à la regénération

### ISR
- ⚠️ Délai avant que la nouvelle version soit servie à 100%
- ⚠️ Nécessite une connexion publique pour les webhooks

### Solution
- Combine les deux: SSG pour performance + ISR pour mises à jour régulières

## API Clients (Client-side)

Pour les filtres dynamiques et la pagination côté client:

```typescript
'use client'

import { useGamesList } from '@/lib/strapi-api/games/hooks'

export function GamesFilter() {
  const { data, isPending } = useGamesList({
    genreId: 1,
    platformId: 2,
    page: 1,
    pageSize: 12
  })

  return (
    <div>
      {data?.data.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}
```

## Monitoring

### Vérifier l'ISR

1. **URL de test du webhook:**
   ```
   https://your-domain.vercel.app/api/revalidate
   ```

2. **Logs Vercel:**
   - Allez à **Deployments → Logs → Function Logs**
   - Recherchez `[ISR Webhook]`

3. **Test manuel:**
   ```bash
   curl -X POST https://your-domain.vercel.app/api/revalidate \
     -H "x-strapi-webhook-secret: your-secret" \
     -H "Content-Type: application/json" \
     -d '{
       "event": "games.update",
       "data": {
         "slug": "test-game",
         "id": 1
       }
     }'
   ```

## Checklist de déploiement

- [ ] Configurer `STRAPI_WEBHOOK_SECRET` dans les variables d'env
- [ ] Créer le webhook dans Strapi
- [ ] Tester le webhook avec un POST manuel
- [ ] Vérifier les logs ISR
- [ ] Mettre à jour un jeu et vérifier la regénération
- [ ] Tester la création d'un nouveau jeu
- [ ] Vérifier les performances avec Lighthouse

## Ressources

- [Next.js ISR Documentation](https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic-rendering#revalidation)
- [next/cache revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Vercel Documentation](https://vercel.com/docs)
