# Guide de Troubleshooting - Games Frontend SSG/ISR

## 🔴 Problèmes courants et solutions

### 1. Build Errors

#### ❌ "Cannot find module '@/lib/strapi-api/games/server'"

**Cause:** Le fichier server.ts n'a pas été créé ou le chemin est incorrect.

**Solution:**
```bash
# Vérifier que le fichier existe
ls -la apps/ui/src/lib/strapi-api/games/server.ts

# Si manquant, le créer
touch apps/ui/src/lib/strapi-api/games/server.ts
```

#### ❌ "Type error: Property 'revalidate' not found"

**Cause:** La version de Next.js est trop ancienne ou la configuration ISR est mal placée.

**Solution:**
```bash
# Mettre à jour Next.js
cd apps/ui
pnpm add next@latest

# Vérifier que revalidate est au niveau du module
# (pas à l'intérieur d'une fonction)
```

#### ❌ "Module parse failed: Unexpected token"

**Cause:** Problème de TypeScript ou d'import mal formé.

**Solution:**
```bash
# Lancer typecheck
pnpm typecheck --filter=@repo/ui

# Forcer rebuild du cache TypeScript
rm -rf apps/ui/.next
pnpm build --filter=@repo/ui
```

---

### 2. Webhook Issues

#### ❌ "Invalid webhook secret"

**Cause:** Le secret dans `.env.local` ne correspond pas à celui dans Strapi.

**Solution:**
1. Allez dans Strapi → **Settings → Webhooks**
2. Cliquez sur votre webhook
3. Copiez le header `x-strapi-webhook-secret`
4. Mettez à jour `.env.local`:
   ```env
   STRAPI_WEBHOOK_SECRET=<secret-exact-from-strapi>
   ```
5. Redémarrez Next.js

#### ❌ "Webhook not being triggered from Strapi"

**Cause:** L'URL du webhook est incorrecte ou Strapi ne peut pas y accéder.

**Solutions:**

**En local:**
```bash
# Utiliser ngrok pour exposer localhost
ngrok http 3000

# Vous obtenez: https://xxxx-xx-xxx-xxx-xx.ngrok-free.app
# URL du webhook: https://xxxx-xx-xxx-xxx-xx.ngrok-free.app/api/revalidate
```

**En production:**
```
URL du webhook: https://your-domain.vercel.app/api/revalidate
```

**En staging:**
- Vérifier que le webhook pointe vers `staging-domain.vercel.app`
- Ne pas laisser le webhook pointer vers localhost

#### ❌ "Failed to revalidate"

**Cause:** Le webhook s'exécute mais revalidatePath() échoue.

**Solution:**
1. Vérifier les logs en temps réel:
   ```bash
   # Local
   tail -f /tmp/next-server.log
   
   # Vercel
   vercel logs --follow
   ```

2. Vérifier le format du payload:
   ```bash
   curl -X POST http://localhost:3000/api/revalidate \
     -H "x-strapi-webhook-secret: your-secret" \
     -H "Content-Type: application/json" \
     -d '{
       "event": "games.update",
       "data": {
         "slug": "sample-game",
         "id": 1
       }
     }'
   ```

---

### 3. Performance Issues

#### ❌ "Pages are taking too long to build"

**Cause:** Trop de jeux à générer ou requêtes Strapi lentes.

**Solutions:**

1. **Réduire le nombre de jeux en dev:**
   ```typescript
   // Dans generateStaticParams()
   const results = await fetchAllGamesSlugs("api::game.game", locale)
   const params = results.slice(0, 10).map(game => ({ // Limit to 10
     locale,
     rest: [game.slug],
   }))
   ```

2. **Augmenter le timeout:**
   ```bash
   # next.config.mjs
   export const config = {
     staticPageGenerationTimeout: 120 // 2 minutes
   }
   ```

3. **Optimiser les requêtes Strapi:**
   ```typescript
   // Utiliser une pagination plus petite
   const games = await fetchAllGamesSlugs(locale, {
     pageSize: 50, // Réduire si trop gros
   })
   ```

#### ❌ "TTFB is slow even with SSG"

**Cause:** Le CDN n'est pas utilisé ou le cache est court.

**Solutions:**

1. **Vérifier les headers CDN:**
   ```bash
   curl -I https://your-domain.vercel.app/games
   
   # Doit voir:
   # cache-control: public, max-age=31536000, immutable
   ```

2. **Augmenter le cache:**
   ```typescript
   // next.config.mjs
   headers() {
     return [{
       source: '/games/:path*',
       headers: [
         {
           key: 'Cache-Control',
           value: 'public, max-age=31536000, immutable'
         }
       ]
     }]
   }
   ```

---

### 4. ISR Regeneration Issues

#### ❌ "Page not updated after modifying in Strapi"

**Cause:** La regénération ISR n'a pas été déclenchée ou est en arrière-plan.

**Solutions:**

1. **Attendre que le cache expire:**
   ```
   Temps par défaut: revalidate = 3600 (1 heure)
   Attendez 1 heure ou modifiez la valeur
   ```

2. **Forcer une regénération manuelle:**
   ```bash
   # Appel direct à revalidatePath via Next.js
   # Pas possible en client, utiliser le webhook
   ```

3. **Vérifier que le webhook a été appelé:**
   ```bash
   # Vercel logs
   vercel logs --filter "ISR Webhook" --follow
   ```

4. **Redéployer si rien ne marche:**
   ```bash
   # Redeploiement complet
   git push
   # Le déploiement Vercel se lancera automatiquement
   ```

#### ❌ "Webhook retourne 200 mais page non mise à jour"

**Cause:** revalidatePath() a réussi mais le navigateur montre du cache.

**Solutions:**

1. **Forcer un refresh navigateur:**
   ```
   Ctrl+F5 (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

2. **Attendre la regénération en arrière-plan:**
   ```
   La première requête après revalidatePath() va regénérer
   Les requêtes suivantes seront servies depuis le cache
   ```

3. **Vérifier les headers du cache:**
   ```bash
   curl -I https://your-domain/games/elden-ring
   # Voir: age, cache-control, etc.
   ```

---

### 5. Deployment Issues

#### ❌ "Build failed on Vercel"

**Cause:** Variables d'env manquantes ou configuration incorrecte.

**Solutions:**

1. **Vérifier les env vars dans Vercel:**
   ```
   Dashboard → Settings → Environment Variables
   
   Doivent avoir:
   - STRAPI_WEBHOOK_SECRET
   - NEXT_PUBLIC_STRAPI_API_URL
   - NEXT_PUBLIC_STRAPI_API_TOKEN (optionnel)
   ```

2. **Vérifier la configuration du build:**
   ```
   Dashboard → Settings → Build & Development
   
   - Root Directory: apps/ui
   - Build Command: pnpm build --filter=@repo/ui
   - Output Directory: .next
   ```

3. **Voir les logs de build:**
   ```
   Dashboard → Deployments → [latest] → Logs
   ```

#### ❌ "Webhook returns 404 on Vercel"

**Cause:** L'URL du webhook est mal configurée dans Strapi.

**Solution:**
```
Strapi Webhook URL doit être:
https://your-production-domain.vercel.app/api/revalidate

Vérifier que:
- Pas de typo dans le domaine
- Pas de trailing slash
- Protocole https (pas http)
```

---

### 6. Database/Strapi Issues

#### ❌ "Cannot fetch games from Strapi"

**Cause:** URL Strapi incorrecte ou Strapi n'est pas accessible.

**Solutions:**

1. **Vérifier la connexion:**
   ```bash
   # Test direct
   curl http://localhost:1337/api/games
   
   # Doit retourner du JSON (même vide)
   ```

2. **Vérifier l'URL dans `.env.local`:**
   ```env
   NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
   ```

3. **Vérifier les permissions d'API Strapi:**
   ```
   Strapi Admin → Settings → Users & Permissions → Roles
   
   Public role doit avoir accès à:
   - Games (read)
   - Developers (read)
   - Genres (read)
   - Platforms (read)
   ```

#### ❌ "Webhook 403 Forbidden from Strapi"

**Cause:** Strapi ne peut pas accéder à Next.js.

**Solutions:**

1. **En local avec ngrok:**
   ```bash
   ngrok http 3000
   # Copier l'URL publique
   # Tester: https://xxxx.ngrok-free.app/api/revalidate
   ```

2. **En production:**
   ```
   Vérifier que le domaine est accessible publiquement
   Test: curl https://your-domain.vercel.app/api/revalidate
   ```

3. **Vérifier le firewall:**
   ```
   - Pas de blocage du port 443
   - Pas de WAF qui bloque Strapi
   ```

---

### 7. TypeScript Issues

#### ❌ "Type 'any' is not assignable to type 'Game'"

**Cause:** Types générés Strapi manquants ou incorrects.

**Solutions:**

```bash
# Régénérer les types Strapi
cd apps/strapi
pnpm generate-types

# Ou manuellement:
cd apps/ui
pnpm typecheck
```

#### ❌ "Cannot find name 'PageProps'"

**Cause:** Type PageProps n'est pas défini.

**Solutions:**

```typescript
// Définir le type localement
type PageProps<T extends string> = {
  params: Promise<Record<string, string>>
  searchParams?: Promise<Record<string, string | string[]>>
}

// Ou importer si disponible
import type { PageProps } from "next"
```

---

## 🔍 Debugging Tools

### 1. Vercel Logs

```bash
# Voir les logs en temps réel
vercel logs --follow

# Filtrer par fonction
vercel logs --filter "api/revalidate" --follow

# Voir les logs spécifiques
vercel logs [deployment-id]
```

### 2. Strapi Webhooks

**Strapi Admin:**
- Go to **Settings → Webhooks**
- Cliquez sur votre webhook
- Voir l'onglet **Logs**
- Chaque tentative est loggée avec le statut

### 3. Network Inspection

```bash
# Voir les requêtes Strapi
curl -v http://localhost:1337/api/games?filters[slug][$eq]=sample-game

# Avec headers
curl -v -H "Authorization: Bearer $STRAPI_TOKEN" \
  http://localhost:1337/api/games
```

### 4. Local Debugging

```bash
# Ajouter des logs
export DEBUG=@repo:*

# Lancer Next.js en debug
node --inspect-brk ./node_modules/next/dist/bin/next dev

# Lancer avec verbose logging
DEBUG=@repo:* pnpm dev --filter=@repo/ui
```

---

## 📋 Checklist de Validation

- [ ] `.env.local` configuré avec le bon secret
- [ ] `STRAPI_WEBHOOK_SECRET` correspond entre `.env.local` et Strapi
- [ ] Strapi accessible et retourne les jeux
- [ ] Webhook créé dans Strapi avec les bons events
- [ ] Webhook test réussi (curl ou Strapi UI)
- [ ] Build Next.js réussi sans erreurs
- [ ] Pages générées contiennent des jeux
- [ ] Modification d'un jeu dans Strapi
- [ ] Webhook déclenché et retourne 200
- [ ] Page mise à jour après quelques secondes
- [ ] Performance < 50ms TTFB

---

## 🆘 Quand demander de l'aide

Si après avoir suivi ce guide les problèmes persistent:

1. **Collecter les informations:**
   - Version de Node.js: `node -v`
   - Version de Next.js: `pnpm ls next`
   - Logs complets (Vercel ou local)
   - Exemple du payload webhook

2. **Ouvrir une issue:**
   - Décrire le problème
   - Ajouter les logs
   - Ajouter les steps pour reproduire

3. **Consulter la documentation:**
   - [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md)
   - [Next.js ISR Docs](https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic-rendering#revalidation)
   - [Strapi Webhooks](https://docs.strapi.io/user-docs/latest/guides/webhooks)

---

**Dernière mise à jour:** 29 January 2026
