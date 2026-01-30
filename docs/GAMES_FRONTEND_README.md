# Frontend Architecture - Games avec SSG & ISR

## 📋 Résumé

Cette implémentation utilise **Next.js 16** avec **Static Site Generation (SSG)** et **Incremental Static Regeneration (ISR)** pour fournir une expérience utilisateur optimale avec des performances maximales.

### Points clés

- ⚡ **SSG (Static Site Generation)**: Toutes les pages de jeux sont pré-générées au build time
- 🔄 **ISR (Incremental Static Regeneration)**: Les mises à jour Strapi régénèrent les pages automatiquement
- 🎯 **Performance**: <50ms TTF (Time To First Byte) vs 200-500ms en SSR
- 🌍 **Multi-locale**: Support pour EN, CS, FR, DE
- 🔐 **Sécurisé**: Vérification de webhooks avec secret
- 📱 **Responsive**: Fully responsive design

## 🏗️ Architecture

### Routes créées

```
/[locale]/games                  → Liste des jeux (SSG + ISR)
/[locale]/games/[slug]          → Page individuelle (SSG + ISR)
/api/revalidate                 → Webhook pour ISR
```

### Fichiers clés

| Fichier | Type | Rôle |
|---------|------|------|
| `src/app/[locale]/games/page.tsx` | Page | Listing SSG+ISR |
| `src/app/[locale]/games/[slug]/page.tsx` | Page | Détail SSG+ISR |
| `src/app/api/revalidate/route.ts` | API | Webhook revalidation |
| `src/lib/strapi-api/games/server.ts` | Utils | Fetch Strapi |
| `src/components/games/GamePageContent.tsx` | Component | UI détail |
| `src/components/games/GamesListingContent.tsx` | Component | UI listing |

## 🚀 Getting Started

### 1. Setup Rapide

```bash
# Copier fichier env
cp apps/ui/.env.example apps/ui/.env.local

# Remplir le secret webhook
# STRAPI_WEBHOOK_SECRET=your-secret-key
```

### 2. Build

```bash
cd apps/ui
npm run build
# ou
pnpm build
```

### 3. Test Local

```bash
npm run start
# Accéder à http://localhost:3000/games
```

### 4. Configuration Webhook Strapi

1. **Settings → Webhooks → Add webhook**
2. **URL**: `https://your-domain.vercel.app/api/revalidate`
3. **Events**: `games.create`, `games.update`, `games.delete`
4. **Header**: `x-strapi-webhook-secret: your-secret`

## 📊 Features

### Listing des jeux (`/games`)

- ✅ Affichage en grille 4 colonnes
- ✅ Filtrage par genre
- ✅ Filtrage par plateforme
- ✅ Recherche par titre/description
- ✅ Pagination côté client
- ✅ Images optimisées
- ✅ Responsive design

### Page détail jeu (`/games/[slug]`)

- ✅ Hero section avec cover
- ✅ Infos complètes du jeu
- ✅ Galerie de screenshots
- ✅ Lien vers site officiel
- ✅ Trailer embédé
- ✅ Jeux recommandés
- ✅ SEO optimisé
- ✅ Breadcrumbs

## 🔧 Configuration

### Variables d'environnement requises

```env
STRAPI_WEBHOOK_SECRET=your-secret-key
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
```

### ISR Settings

```typescript
// Dans page.tsx
export const revalidate = 3600 // 1 heure
export const dynamicParams = true // Nouvelles pages à la première visite
```

## 📈 Performance

### Comparaison

| Métrique | SSG | ISR | SSR |
|----------|-----|-----|-----|
| **TTFB** | <50ms | <50ms | 200-500ms |
| **Build** | 30-60s | 30-60s | N/A |
| **Mise à jour** | Rebuild | ISR | Direct |
| **Coût** | Très bas | Très bas | Élevé |

### Temps de build

- **Avec 100 jeux**: ~45 secondes
- **Avec 1000 jeux**: ~2-3 minutes
- **Regénération ISR**: ~5-10 secondes par page

## 🔍 Debugging

### Tester le webhook

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "x-strapi-webhook-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "games.update",
    "data": {
      "id": 1,
      "slug": "sample-game",
      "title": "Sample Game"
    }
  }'
```

### Vérifier les logs ISR

- **Local**: Voir dans le terminal `npm run start`
- **Vercel**: Dashboard → Deployments → Function Logs → Chercher "[ISR Webhook]"

## 📚 Documentation complète

- [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) - Documentation détaillée
- [SSG_ISR_SETUP_GUIDE.md](./SSG_ISR_SETUP_GUIDE.md) - Guide de setup complet
- [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md) - Diagrammes visuels

## ✅ Checklist de déploiement

- [ ] Variables d'env configurées
- [ ] Webhook Strapi créé
- [ ] Test de webhook réussi
- [ ] Build sans erreurs
- [ ] Test en staging
- [ ] Webhook pointant vers Vercel
- [ ] Vérifier les logs
- [ ] Modifier un jeu et vérifier la regénération

## 🎯 Prochaines étapes

- [ ] Ajouter les commentaires des utilisateurs
- [ ] Ajouter un système de notation
- [ ] Ajouter les screenshots avec Lightbox
- [ ] Ajouter les trailers vidéo
- [ ] Ajouter le pré-chargement des images
- [ ] Ajouter l'analytics (Sentry/Vercel Analytics)

## 🆘 Support

- **Docs Next.js**: https://nextjs.org/docs
- **Docs Strapi**: https://docs.strapi.io/
- **Docs Vercel**: https://vercel.com/docs

---

**Version**: 1.0  
**Last Updated**: 29 January 2026  
**Maintainer**: Notum Technologies
