---
name: apex-mobile-debug
description: >
  Skill de debug pour Apex Coach Mobile. À utiliser dès qu'un bug apparaît :
  issue Sentry mobile, erreur Metro, échec EAS Build, deep link cassé,
  Supabase qui répond mal, écran qui ne re-render pas, hermes stacktrace
  incompréhensible. Ce skill impose un workflow structuré — analyser AVANT
  de corriger — pour éviter les fixes "à l'aveugle". Déclencher sur : "j'ai
  un bug mobile", "Sentry remonte une erreur RN", "EAS Build échoue", "Metro
  bundler error", "le screen ne s'affiche pas", "deep link KO".
---

# Apex Coach Mobile — Skill Debug

Le bug est presque toujours plus profond que le symptôme visible. **Plan AVANT fix.** Une correction posée sans diagnostic crée un nouveau bug 3 jours plus tard.

---

## Workflow obligatoire (5 étapes)

1. **Reproduire** — minimum viable repro : étapes exactes, plateforme (iOS/Android), version Expo, profile EAS (dev/preview/prod), device/simulateur.
2. **Identifier la couche** — UI, navigation, state, API, native (lib RN), Metro/build, store config.
3. **Lire la stacktrace en entier** — ne pas s'arrêter à la première ligne. Hermes inline les sources, lire les frames `node_modules/...` pour identifier le module fautif.
4. **Hypothèses ordonnées** — lister 2-3 causes probables, ordonnées par probabilité. Vérifier la plus probable d'abord.
5. **Plan de fix** — décrire le diff prévu AVANT de l'écrire. Si le diff dépasse 30 lignes, redécouper en sous-fixes.

> Avant de proposer un fix : poster un commentaire (ou répondre à l'user) avec : **cause identifiée**, **fichiers touchés**, **approche**, **alternatives écartées**, **risques de régression**, **tests à ajouter**.

---

## Sources d'erreurs typiques mobile

### Metro / Build (avant que l'app ne tourne)

| Symptôme | Cause probable | Fix |
|----------|---------------|-----|
| `Unable to resolve module @/...` | path alias mal configuré | Vérifier `babel.config.js` (plugin `expo-router/babel` + `module-resolver` si présent) et `tsconfig.json` (`paths`) |
| `babel-preset-expo not found` | install manquante | `npx expo install` (PAS `npm install`) |
| `EAS Build fail: Unable to find ...` | dépendance native non liée | `npx expo prebuild` localement pour debug |
| Hermes crash en production seulement | code utilisant `eval`, `Function`, ou `Proxy` non supporté | tracer la ligne, refactor sans eval |
| `Reanimated 4 is not configured` | plugin manquant | ajouter `'react-native-reanimated/plugin'` en **dernier** dans `babel.config.js` |

### Runtime RN

| Symptôme | Cause probable |
|----------|---------------|
| `Element type is invalid` | un import default qui n'existe pas (typique fichier `.tsx` sans `export default`) |
| `Cannot read property of undefined` au mount | data race : composant rendu avant que le store soit initialisé. Wrapper avec `if (loading) return <Skeleton />`. |
| Re-renders en boucle | sélecteur Zustand non-atomique (recrée objet à chaque render). Voir skill `apex-mobile-state`. |
| Tab bar cache pas l'écran gated | `href: null` manque dans `Tabs.Screen options` |
| `expo-secure-store` lance "Value is too large" | utiliser `LargeSecureStore` (chunking auto) du projet |

### Réseau / Supabase

| Symptôme | Cause probable |
|----------|---------------|
| 401 sur tous les calls | session expirée non rafraîchie. Vérifier `autoRefreshToken: true` dans le client Supabase + `AppState` listener |
| PGRST116 sur lecture optionnelle | `.single()` au lieu de `.maybeSingle()` |
| RLS deny | requête côté mobile via `supabase.from(...)` sans user.id eq → RLS bloque. Toujours `.eq('user_id', user.id)`. |
| Timeout en preview EAS | `EXPO_PUBLIC_API_URL` non injecté dans le profile EAS (à déclarer dans `eas.json` env) |

### Deep links

| Symptôme | Cause probable |
|----------|---------------|
| Le link ouvre le browser au lieu de l'app | `.well-known/apple-app-site-association` absent ou mal formé côté web |
| `Linking.parse` retourne null | scheme manquant dans `app.json` |
| Universal Link Android KO | `intentFilters[].autoVerify` manquant ou `assetlinks.json` faux |

---

## Sentry mobile (workflow P1 → P3)

Le projet doit utiliser `@sentry/react-native` (Sprint 4, S4-T12). Quand une issue Sentry est créée :

1. **Lire l'issue Sentry complète** : event count, plateformes touchées, version d'app, breadcrumbs (10 dernières actions user)
2. **Identifier l'utilisateur impacté** (si profile attaché) — pour valider l'hypothèse
3. **Ouvrir un commentaire dans l'issue GitHub liée** avec le plan AVANT fix (workflow CLAUDE.md projet web §11)
4. **Implémenter sur une branche** `fix/sentry-{issue_id}-{slug}`
5. **Marquer l'issue Sentry comme résolue** depuis le PR (commit avec `Fixes SENTRY-MOBILE-{ID}`)

---

## Outils utiles

```bash
# Logs runtime (device connecté)
npx expo start --dev-client

# Inspect bundler errors complet
npx expo start --clear

# Type-check sans build
npx tsc --noEmit

# Lint mobile
npx eslint app/ components/ hooks/ lib/ stores/ --ext .ts,.tsx

# Logs EAS Build d'un build raté
eas build:view {build-id} --platform ios

# Doctor (détecte les versions Expo désynchronisées)
npx expo-doctor
```

---

## Anti-patterns à éviter

- **Fix par try/catch silencieux** — masque le bug. Toujours logger + remonter à Sentry.
- **`as any` pour faire passer le type-check** — interdit (règle 6 du skill `apex-mobile-dev`).
- **Bumper une lib pour faire passer le build** — vérifier le changelog d'abord, puis faire un test sur un EAS preview avant de merger.
- **Désactiver Hermes** pour contourner un bug — il y a presque toujours un fix de plus haut niveau.
- **Patcher `node_modules` directement** — utiliser `patch-package` si vraiment nécessaire (rare).

---

## Carte de délégation

| Situation | Skill |
|-----------|-------|
| Bug d'API / RLS | **`apex-mobile-api`** |
| Bug de state Zustand | **`apex-mobile-state`** |
| Bug de navigation / deep link | **`apex-mobile-navigation`** |
| Bug visuel ou animation | **`apex-mobile-design`** |
| Suspicion de leak ou faille | **`apex-mobile-security-review`** |
| Test de non-régression à ajouter | **`apex-mobile-test`** |
