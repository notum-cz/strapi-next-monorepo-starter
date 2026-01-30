# Diagrammes d'Architecture SSG/ISR

## 1. Architecture Global

```
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APPLICATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  SSG AT BUILD    │  │   ISR CACHE      │  │   CLIENT CACHE   │ │
│  │                  │  │                  │  │                  │ │
│  │ • Pre-generate   │  │ • 1 hour TTL     │  │ • React Query    │ │
│  │   all game pages │  │ • Auto regener.  │  │ • Client-side    │ │
│  │ • Max perf       │  │ • Minimal stale  │  │ • For filtering  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Flow de Build Time (SSG)

```
┌─────────────┐
│   npm build │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ generateStaticParams() pour chaque locale    │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│ fetchAllGamesSlugs() → ["game-1", "game-2"] │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│ Pour chaque slug + locale:                   │
│   • fetchGameBySlug(slug)                    │
│   • generateMetadata()                       │
│   • Générer HTML statique                    │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│ ✓ Fichiers HTML statiques générés             │
│   /en/games/game-1/index.html                │
│   /en/games/game-2/index.html                │
│   /cs/games/game-1/index.html                │
│   /en/games/index.html                       │
└──────────────────────────────────────────────┘
```

## 3. Flow Runtime - Request utilisateur

```
┌──────────────────────────┐
│ Utilisateur demande      │
│ /en/games/elden-ring     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Page existe dans le cache ISR?       │
└──┬──────────────────────────────────┬┘
   │ OUI                      │ NON
   │                          │
   ▼                          ▼
┌─────────────────┐    ┌──────────────────────────────┐
│ Servir depuis   │    │ dynamicParams = true?        │
│ le cache        │    └──┬──────────────────────────┬┘
│ <50ms           │       │ OUI              │ NON
│                 │       │                  │
│ ✓ Très rapide   │       ▼                  ▼
└─────────────────┘ ┌──────────────────┐ ┌──────────┐
                    │ Générer la page  │ │ 404 Not  │
                    │ en arrière-plan  │ │ Found    │
                    │ et mettre en     │ └──────────┘
                    │ cache            │
                    │ Servir: SSR      │
                    │ Next: static     │
                    └──────────────────┘
```

## 4. Flow de Revalidation ISR

```
┌─────────────────────────┐
│ Modifier un jeu dans    │
│ Strapi                  │
└──────────┬──────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Strapi déclenche le webhook          │
│ POST /api/revalidate                 │
├──────────────────────────────────────┤
│ Headers:                             │
│ x-strapi-webhook-secret: xxx         │
│                                      │
│ Body:                                │
│ {                                    │
│   event: "games.update",             │
│   data: { slug: "elden-ring" }       │
│ }                                    │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ verifyWebhookSecret()                │
│ → Signature valide?                  │
└──┬──────────────────────────────────┬┘
   │ OUI                      │ NON
   │                          │
   ▼                          ▼
┌─────────────────────┐ ┌──────────────────┐
│ Extraire le slug    │ │ Retourner 401    │
└──────┬──────────────┘ │ Unauthorized     │
       │                └──────────────────┘
       ▼
┌──────────────────────────────────────┐
│ Pour chaque locale:                  │
│ revalidatePath(                      │
│   '/[locale]/games/elden-ring'       │
│ )                                    │
│ revalidatePath(                      │
│   '/[locale]/games'                  │
│ )                                    │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Pages marquées pour regénération     │
│ en arrière-plan                      │
├──────────────────────────────────────┤
│ • Anciennes versions restent en cache│
│ • À la prochaine requête, nouvelle   │
│   version est servie                 │
│ • Zéro temps d'inactivité             │
└──────────────────────────────────────┘
```

## 5. Timeline ISR - Avant/Après

### Avant la mise à jour

```
Time: 12:00:00
User requests: /games/elden-ring
┌─────────────────────────────────────┐
│ Cache ISR                           │
├─────────────────────────────────────┤
│ Title: Elden Ring                   │
│ Description: (old description)      │
│ Last revalidated: 11:00:00          │
│ Next revalidation: 12:00:00 + 3600s │
└─────────────────────────────────────┘
```

### Modification dans Strapi

```
Time: 12:05:00
Admin modifie le jeu dans Strapi
↓
Webhook déclenché
↓
/api/revalidate appelé
↓
revalidatePath() exécuté
```

### Après la mise à jour

```
Time: 12:05:10 (10 secondes après)
User requests: /games/elden-ring
┌─────────────────────────────────────┐
│ Cache ISR (nouveau)                 │
├─────────────────────────────────────┤
│ Title: Elden Ring (Updated)         │
│ Description: (new description)      │
│ Last revalidated: 12:05:00          │
│ Next revalidation: 12:05:00 + 3600s │
└─────────────────────────────────────┘
```

## 6. Comparaison: SSG vs SSR vs ISR

```
                    BUILD TIME  RUNTIME  FRESHNESS  PERFORMANCE
                    ──────────  ───────  ─────────  ────────────

SSG (Static)        5-60s       <50ms    1-∞ hours  ⭐⭐⭐⭐⭐
                    (one-time)  (cached)

ISR (Revalidate)    5-60s       <50ms    ~1 hour    ⭐⭐⭐⭐⭐
                    (one-time)  (cached) (+ updates)

SSR (Server)        0s          200-500ms Real-time  ⭐⭐
                    (every req) (dynamic)
```

## 7. Structure des dossiers

```
apps/ui/
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       ├── games/              ← Route principale
│   │       │   ├── page.tsx        ← Listing (SSG+ISR)
│   │       │   │   • revalidate = 3600
│   │       │   │   • generateStaticParams()
│   │       │   │
│   │       │   └── [slug]/
│   │       │       └── page.tsx    ← Détail (SSG+ISR)
│   │       │           • revalidate = 3600
│   │       │           • dynamicParams = true
│   │       │
│   │       └── api/
│   │           └── revalidate/
│   │               └── route.ts    ← Webhook ISR
│   │
│   ├── lib/
│   │   ├── strapi-api/
│   │   │   └── games/
│   │   │       ├── server.ts       ← Fetch SSG
│   │   │       ├── client.ts       ← Fetch client
│   │   │       └── hooks.ts        ← React hooks
│   │   └── metadata/
│   │
│   └── components/
│       └── games/
│           ├── GamePageContent.tsx    ← UI détail
│           ├── GamesListingContent.tsx ← UI listing
│           └── ISRDebugInfo.tsx       ← Debug
│
└── .env.local                      ← Config ISR
    STRAPI_WEBHOOK_SECRET=xxx
```

## 8. Flux Webhook Strapi → Next.js

```
STRAPI                      NEXT.JS
┌──────────────────┐       ┌──────────────────┐
│ Admin Panel      │       │ App Vercel       │
│                  │       │                  │
│ 1. Edit game     │       │                  │
│ 2. Save          │───┐   │                  │
│ 3. Trigger       │   │   │                  │
│    webhook       │   │   │                  │
└──────────────────┘   │   │                  │
                       │   │ POST /api/revalidate
                       │   │ ┌────────────────────┐
                       │   │ │ 1. Verify secret   │
                       └──→│ │ 2. Extract slug    │
                           │ │ 3. revalidatePath()│
                           │ │ 4. Mark for regen  │
                           │ └────────────────────┘
                           │
                           │ Background regeneration
                           ▼
                       ┌────────────────────┐
                       │ Cache updated      │
                       │ Next request → new │
                       │ version            │
                       └────────────────────┘
```

## 9. Performance Timeline

```
             TIME UNTIL USER SEES PAGE
             
SSG/ISR:     ├─ <50ms (from CDN) ─┤
             
SSR:         ├────── 200-500ms ────┤
             │ (server processing) │
             
SSG+SSR:     ├─ <50ms ─┤  ├─ 2-5min (regener.) ─┤
             │(cached) │  │ (background)         │
```

---

Ces diagrammes illustrent comment SSG et ISR travaillent ensemble pour fournir une expérience utilisateur optimale.
