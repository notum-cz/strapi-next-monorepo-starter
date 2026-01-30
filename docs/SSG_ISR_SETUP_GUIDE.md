# Guide de configuration SSG/ISR pour les jeux

## 🚀 Setup Rapide

### Étape 1: Configuration des variables d'environnement

Créez le fichier `.env.local` dans `apps/ui/`:

```bash
cp apps/ui/.env.example apps/ui/.env.local
```

Remplissez les variables:

```env
STRAPI_WEBHOOK_SECRET=your-secret-key-change-this
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
```

### Étape 2: Vérifier la structure Strapi

Assurez-vous que votre modèle `games` dans Strapi a les champs:

```typescript
- title (string)
- slug (string, unique)
- description (text)
- cover (media)
- developer (relation)
- genres (relation)
- platforms (relation)
- screenshots (media)
- trailer (relation)
- releaseDate (date)
- rating (number)
- website (string)
- seo (component)
```

### Étape 3: Configurer les données d'exemple

Exécutez le seed Strapi:

```bash
cd apps/strapi
npm run seed
# ou
pnpm seed
```

Cela créera des jeux d'exemple.

### Étape 4: Build du frontend

```bash
cd apps/ui

# Build avec SSG (génère les pages statiques)
npm run build
# ou
pnpm build
```

**Output attendu:**
```
Route (generate)                                Size
├ ○ /                                         XX kB
├ ○ /games                                    XX kB
├ ○ /games/sample-game                        XX kB
└ [X] /api/revalidate                         XX B
```

### Étape 5: Tester en local

```bash
# Lancer le serveur
npm run start
# ou
pnpm start

# Accéder à l'app
open http://localhost:3000/games
```

## 🔗 Configuration du Webhook Strapi

### Étape 1: Configurer l'URL publique

Pour les tests en local, utilisez `ngrok` ou `localhost.run`:

```bash
# Avec ngrok (install via https://ngrok.com/download)
ngrok http 3000

# Vous obtenez une URL comme: https://xxxx-xx-xxx-xxx-xx.ngrok-free.app
```

### Étape 2: Créer le webhook dans Strapi

1. Allez à **Strapi Admin** (`http://localhost:1337/admin`)
2. **Settings** → **Webhooks**
3. **Add new webhook**
4. Remplissez:
   - **Name:** `Games ISR Revalidation`
   - **URL:** `https://xxxx-xx-xxx-xxx-xx.ngrok-free.app/api/revalidate`
   - **Events:** Cochez:
     - `games.create`
     - `games.update`
     - `games.delete`

5. **Headers** → Ajoutez:
   - **Key:** `x-strapi-webhook-secret`
   - **Value:** `your-secret-key-change-this` (le même que dans `.env.local`)

6. **Save**

### Étape 3: Tester le webhook

```bash
# Depuis un autre terminal
curl -X POST http://localhost:3000/api/revalidate \
  -H "x-strapi-webhook-secret: your-secret-key-change-this" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "games.update",
    "data": {
      "id": 1,
      "slug": "sample-game",
      "title": "Sample Game"
    }
  }'

# Réponse attendue:
# {
#   "revalidated": true,
#   "message": "ISR revalidation triggered for game: sample-game",
#   "timestamp": "2026-01-29T..."
# }
```

### Étape 4: Vérifier l'ISR en action

1. Ouvrez dans Strapi: **Content Manager** → **Games** → **Sample Game**
2. Modifiez le titre, ex: "Sample Game - Updated"
3. **Save**
4. Allez sur `http://localhost:3000/games/sample-game`
5. Actualisez la page (Ctrl+F5 pour ignorer le cache)
6. Le titre devrait être à jour en quelques secondes

## 📊 Vérifier l'ISR dans les logs

Dans le terminal où vous avez lancé `npm run start`:

```
[ISR Webhook] Event: games.update, Game: sample-game
[ISR Webhook] Revalidated: /en/games/sample-game
[ISR Webhook] Revalidated: /en/games
[ISR Webhook] Revalidated: /cs/games/sample-game
[ISR Webhook] Revalidated: /cs/games
...
```

## 🔍 Debugging

### Problème: Le webhook ne se déclenche pas

**Solutions:**
1. Vérifiez que l'URL est correctement configurée dans Strapi
2. Vérifiez les logs du webhook dans Strapi (**Webhooks** → cliquez sur le webhook)
3. Vérifiez le header `x-strapi-webhook-secret`
4. Testez avec `curl` (voir Étape 3 ci-dessus)

### Problème: "Invalid webhook secret"

**Solutions:**
1. Vérifiez que le secret dans `.env.local` correspond à celui dans le webhook Strapi
2. Si en développement, mettez `SKIP_WEBHOOK_VERIFY=true` dans `.env.local`
3. Vérifiez les espaces/caractères supplémentaires

### Problème: Les pages ne sont pas à jour

**Solutions:**
1. Le cache ISR met par défaut 1 heure (`revalidate = 3600`)
2. Attendez 1 heure ou changez `revalidate` dans `page.tsx`
3. Rebuildez le projet: `npm run build && npm run start`

## 🚢 Déploiement sur Vercel

### Configuration recommandée

1. **Créez un projet Vercel** à partir du repo GitHub

2. **Variables d'environnement:**
   - Allez à **Settings** → **Environment Variables**
   - Ajoutez:
     ```
     STRAPI_WEBHOOK_SECRET=your-production-secret
     NEXT_PUBLIC_STRAPI_API_URL=https://your-strapi-domain.com
     NEXT_PUBLIC_STRAPI_API_TOKEN=your-strapi-token
     ```

3. **Build Settings:**
   - Root Directory: `apps/ui`
   - Build Command: `pnpm build`
   - Output Directory: `.next`

4. **Webhooks Strapi:**
   - URL: `https://your-domain.vercel.app/api/revalidate`
   - Secret: Le même que `STRAPI_WEBHOOK_SECRET`

### Vérifier le déploiement

```bash
# Voir les logs des fonctions
# Dashboard Vercel → Deployments → Fonction Logs

# Chercher "[ISR Webhook]"
```

## 📈 Performance

### Avec SSG + ISR

```
First Load:    ~50ms
Subsequent:    ~20ms
After Update:  ~10 secondes (regénération)
```

### Comparé à SSR

```
First Load:    ~200-500ms
Subsequent:    ~200-500ms
Every time
```

**Gain:** 5-25x plus rapide avec SSG+ISR

## 📚 Fichiers clés

| Fichier | Rôle |
|---------|------|
| `apps/ui/src/app/[locale]/games/page.tsx` | Listing SSG+ISR |
| `apps/ui/src/app/[locale]/games/[slug]/page.tsx` | Détail jeu SSG+ISR |
| `apps/ui/src/app/api/revalidate/route.ts` | Webhook revalidation |
| `apps/ui/src/lib/strapi-api/games/server.ts` | Fetch Strapi |
| `apps/ui/src/components/games/GamePageContent.tsx` | UI jeu |
| `apps/ui/src/components/games/GamesListingContent.tsx` | UI listing |

## ✅ Checklist complète

- [ ] `.env.local` configuré
- [ ] Modèle `games` créé dans Strapi
- [ ] Données d'exemple créées (`npm run seed`)
- [ ] Build sans erreurs (`npm run build`)
- [ ] Test en local (`npm run start`)
- [ ] Webhook Strapi créé et testé
- [ ] ISR testé en modifiant un jeu
- [ ] Déployé sur Vercel
- [ ] Webhook Vercel configuré
- [ ] Test ISR en production

## 🆘 Besoin d'aide?

- **Docs Next.js:** https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic-rendering
- **Docs Strapi:** https://docs.strapi.io/
- **Docs Vercel:** https://vercel.com/docs

---

**Version:** 1.0  
**Dernière mise à jour:** 29 Janvier 2026
