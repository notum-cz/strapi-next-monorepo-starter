# 🔧 Guide de Résolution Rapide des Erreurs

## ❌ Erreur: "Module not found: Can't resolve 'nuqs'"

**Status:** ✅ RÉSOLU

**Solution appliquée:**
- Remplacé `useQueryState` de `nuqs` par `useSearchParams` et `useRouter` (APIs natives)
- Nettoyé le cache TypeScript

**Pour le vérifier:**
```bash
grep -r "nuqs" apps/ui/src/
# Aucun résultat = bon!
```

---

## ❌ Erreur: "Type 'string' is not assignable to 'Locale'"

**Status:** ✅ RÉSOLU

**Solution appliquée:**
- Ajouté `as Locale` cast dans les deux fichiers:
  - `apps/ui/src/app/[locale]/games/[slug]/page.tsx`
  - `apps/ui/src/app/[locale]/games/page.tsx`

---

## 🧹 Nettoyage du Cache (Recommandé)

Si vous voyez encore des erreurs après les corrections:

```bash
# Option 1: Script automatisé
bash scripts/rebuild-ui.sh

# Option 2: Nettoyage manuel
rm -rf apps/ui/.next
rm -rf apps/ui/node_modules/.next
cd apps/ui
pnpm install
pnpm build
```

---

## 🚀 Relancer le développement

```bash
# Terminal 1: Backend Strapi
pnpm dev --filter=@repo/strapi

# Terminal 2: Frontend Next.js (après cleaning)
rm -rf apps/ui/.next
pnpm dev --filter=@repo/ui
```

---

## ✅ Vérification post-correction

```bash
# 1. Vérifier qu'il n'y a plus d'imports nuqs
grep -r "nuqs" apps/ui/src/
# Résultat: aucun

# 2. Vérifier la compilation TypeScript
pnpm typecheck --filter=@repo/ui
# Résultat: aucune erreur

# 3. Accéder aux pages
# http://localhost:3000/games
# http://localhost:3000/games/sample-game
```

---

## 📊 Fichiers Corrigés

| Fichier | Problème | Solution |
|---------|----------|----------|
| `games/[slug]/page.tsx` | Type Locale | Ajouté `as Locale` cast |
| `games/page.tsx` | Type Locale | Ajouté `as Locale` cast |
| `GamesListingContent.tsx` | Module nuqs | Remplacé par APIs natives |

---

## 🆘 Si ça ne marche toujours pas

1. **Vérifier les logs du terminal:**
   ```bash
   pnpm dev --filter=@repo/ui 2>&1 | head -50
   ```

2. **Vérifier la console navigateur (F12):**
   - Onglet "Console"
   - Chercher les erreurs en rouge

3. **Vérifier que Strapi fonctionne:**
   ```bash
   curl http://localhost:1337/api/games
   ```

4. **Forcer un reboot complet:**
   ```bash
   # Tuer les processus
   pkill -f "next dev"
   pkill -f "strapi"
   
   # Nettoyer
   rm -rf apps/ui/.next
   rm -rf apps/strapi/.cache
   
   # Relancer
   pnpm dev
   ```

---

**Dernière mise à jour:** 29 Janvier 2026
