# ⚡ Quick Implementation Checklist

## 🚀 Pour commencer rapidement

### Étape 1: Setup Local (5 min)

```bash
# 1. Copy env file
cp apps/ui/.env.example apps/ui/.env.local

# 2. Edit .env.local avec votre secret
STRAPI_WEBHOOK_SECRET=your-secret-key

# 3. Install & build
pnpm install
pnpm build --filter=@repo/ui

# 4. Start
pnpm dev --filter=@repo/ui
```

**Vérifier:** http://localhost:3000/games devrait marcher

---

### Étape 2: Données de test (3 min)

```bash
# Dans un autre terminal
cd apps/strapi
pnpm seed

# Cela crée:
# - 2 genres (RPG, Action)
# - 2 plateformes (PC, PS5)
# - 1 développeur (Test Dev)
# - 1 jeu (Sample Game)
```

**Vérifier:** http://localhost:3000/games devrait afficher le jeu

---

### Étape 3: Test du Webhook Local (5 min)

#### Option A: Avec ngrok
```bash
# Terminal 1: Lancer Next.js
pnpm dev --filter=@repo/ui

# Terminal 2: Lancer ngrok
ngrok http 3000
# Copier: https://xxxx-xx-xxx-xxx-xx.ngrok-free.app

# Terminal 3: Configurer Strapi
# Admin → Settings → Webhooks → Add webhook
# Name: ISR Revalidation
# URL: https://xxxx-xx-xxx-xxx-xx.ngrok-free.app/api/revalidate
# Events: games.create, games.update, games.delete
# Header: x-strapi-webhook-secret = your-secret-key
# Save
```

#### Option B: Sans ngrok (test curl)
```bash
# Terminal 1: Lancer Next.js
pnpm dev --filter=@repo/ui

# Terminal 2: Tester le webhook
curl -X POST http://localhost:3000/api/revalidate \
  -H "x-strapi-webhook-secret: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "games.update",
    "data": {
      "id": 1,
      "slug": "sample-game",
      "title": "Sample Game"
    }
  }'

# Response: {"revalidated":true,"message":"..."}
```

---

### Étape 4: Tester ISR (2 min)

1. Ouvrir Strapi Admin: http://localhost:1337/admin
2. Aller à **Content Manager → Games → Sample Game**
3. Modifier le titre: "Sample Game - Updated"
4. **Save**
5. Attendre 2-3 secondes
6. Ouvrir http://localhost:3000/games/sample-game
7. **Ctrl+F5** pour refresh (pas cache)
8. ✅ Titre devrait être mis à jour

---

### Étape 5: Vérifier les Builds (2 min)

```bash
# Build complet
pnpm build --filter=@repo/ui

# Output:
# Route (generate)                                   Size
# ├ ○ /                                             XX kB
# ├ ○ /games                                        XX kB
# ├ ○ /games/sample-game                           XX kB
# ├ ○ /[locale]/games                              XX kB
# ├ ○ /[locale]/games/[slug]                       XX kB
# └ [X] /api/revalidate                            XX B
```

✅ Toutes les routes doivent avoir un symbole (○ ou [X])

---

## 📋 Configuration Production

### Sur Vercel

**1. Créer un projet Vercel**
```
Connecter le repo GitHub
```

**2. Ajouter env vars**
```
Dashboard → Settings → Environment Variables

STRAPI_WEBHOOK_SECRET = your-secret
NEXT_PUBLIC_STRAPI_API_URL = https://strapi.your-domain.com
NEXT_PUBLIC_STRAPI_API_TOKEN = your-token (optionnel)
```

**3. Build settings**
```
Root Directory: apps/ui
Build Command: pnpm build --filter=@repo/ui
Output Directory: .next
```

**4. Webhook Strapi**
```
Settings → Webhooks → Edit

URL: https://your-domain.vercel.app/api/revalidate
Secret: Même que STRAPI_WEBHOOK_SECRET
Events: games.create, games.update, games.delete
```

**5. Test**
```bash
# Modifier un jeu dans Strapi
# Vérifier Vercel logs: vercel logs --follow
# Chercher: [ISR Webhook] Revalidated
```

---

## ✅ Validation

### Local
```bash
# Build réussi?
pnpm build --filter=@repo/ui

# Pages générées?
ls -la apps/ui/.next/server/pages

# Jeux affichés?
curl http://localhost:3000/games

# Webhook fonctionne?
curl -X POST http://localhost:3000/api/revalidate \
  -H "x-strapi-webhook-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"event":"games.update","data":{"slug":"test","id":1}}'

# Réponse: {"revalidated":true,...}
```

### Production (Vercel)
```bash
# Vérifier l'URL
curl https://your-domain.vercel.app/games

# Vérifier le webhook
curl https://your-domain.vercel.app/api/revalidate

# Vérifier les logs
vercel logs --follow

# Tester ISR
# Modifier un jeu → Vérifier logs → Page mise à jour
```

---

## 🔍 Debugging rapide

### Pages ne s'affichent pas
```bash
# Vérifier ISR debug component
# Voir: SimpleBreadcrumbs dans les pages
# Ajouter ISRDebugInfo dans page.tsx

# Vérifier les erreurs de build
pnpm build --filter=@repo/ui 2>&1 | grep -i error
```

### Webhook ne se déclenche pas
```bash
# Vérifier la configuration
# Strapi → Settings → Webhooks → Voir les logs

# Tester manuellement
curl -X POST https://domain/api/revalidate \
  -H "x-strapi-webhook-secret: secret" \
  -H "Content-Type: application/json" \
  -d '{"event":"games.update","data":{"slug":"test","id":1}}'
```

### Page lente
```bash
# Vérifier les metrics
# Chrome DevTools → Lighthouse

# Vérifier que SSG fonctionne
# Page source ne doit pas avoir <script> dynamique

# Vérifier CDN cache
curl -I https://domain/games/sample-game | grep -i cache-control
```

---

## 📚 Documentation rapide

| Besoin | Document |
|--------|----------|
| Comprendre l'architecture | [FRONTEND_ARCHITECTURE.md](./docs/FRONTEND_ARCHITECTURE.md) |
| Setup complet | [SSG_ISR_SETUP_GUIDE.md](./docs/SSG_ISR_SETUP_GUIDE.md) |
| Déboguer un problème | [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) |
| Voir les diagrammes | [ARCHITECTURE_DIAGRAMS.md](./docs/ARCHITECTURE_DIAGRAMS.md) |
| Overview générale | [GAMES_FRONTEND_README.md](./docs/GAMES_FRONTEND_README.md) |

---

## ⏱️ Temps estimé

| Tâche | Temps |
|-------|-------|
| **Setup local** | 5 min |
| **Vérifier ISR** | 5 min |
| **Build & test** | 5 min |
| **Deploy Vercel** | 10 min |
| **Configurer webhook** | 5 min |
| **Total** | 30 min |

---

## 🎯 Résultat final

Vous devez avoir:

✅ Pages `/games` (listing)  
✅ Pages `/games/[slug]` (détail)  
✅ Webhook ISR fonctionnel  
✅ ISR revalidation en arrière-plan  
✅ Performance <50ms TTFB  
✅ Multi-locale support  
✅ Build SSG complet  

---

## 🆘 Problème? Besoin d'aide?

1. **Checklist rapide:**
   - `.env.local` configuré?
   - Strapi accessible?
   - Build sans erreur?
   - Webhook testé?

2. **Voir les logs:**
   ```bash
   # Local
   pnpm dev --filter=@repo/ui 2>&1 | grep -E "ISR|error|warn"
   
   # Vercel
   vercel logs --filter "ISR" --follow
   ```

3. **Consulter TROUBLESHOOTING.md**

4. **Ouvrir une issue**

---

## 🚀 Prochaines étapes

1. ✅ Implémentation complète
2. ✅ Testing local
3. ✅ Deploy production
4. 🔄 Monitoring ISR
5. 📈 Métriques & analytics
6. 🎨 Customization

---

**Bon codage! 🎉**

Pour toute question → Voir la documentation dans `docs/`
