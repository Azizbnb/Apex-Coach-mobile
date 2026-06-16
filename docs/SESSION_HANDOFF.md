# Handoff de session — Apex Coach Mobile

> **Dernière mise à jour :** 14 juin 2026
> **But :** reprendre le travail sans perte de contexte dans une nouvelle session.
> **Branche de travail :** `sprint-final-mobile` (poussée sur `origin`, tracking actif).
> **Deadline :** **30 juin 2026** — build production soumis aux 2 stores.

---

## 1. Mode de travail (verrouillé avec Aziz)

- **Dev manuel, à deux, tous les jours** (calendaires). Les routines auto **MR1-MR8 sont en pause**.
- **Commits directs au fil de l'eau** sur `sprint-final-mobile` (pas de PR par incrément). `git push` après chaque incrément vert.
- **Chaque incrément** : `npx tsc --noEmit` + `npm test` + `npx eslint <fichiers>` au vert avant commit.
- **Toujours charger les skills** `.claude/skills/apex-mobile-*` selon le domaine (dev = toujours actif).

## 2. Décisions de scope (verrouillées)

1. **Onboarding web-only (Netflix strict)** : signup + questionnaire 24 étapes + anti-fraude **restent sur le web**. L'app consomme le programme déjà généré. (~14 tickets Sprint 3 coupés.)
2. **Paywall sans aucun lien d'achat** : message info pur. Les gates/paywalls pointent vers la **home `apexcoach.app`** (jamais `/pricing` ni checkout), via `lib/web-browser.ts`. Évite l'entitlement Apple.
3. **Soumission TestFlight/Play Internal précoce** dès qu'un build conforme existe, polish en parallèle. **Cutoff review publique : 23 juin.**
4. **Conformité Reader App** : zéro SDK paiement, zéro prix affiché, zéro mention Apple/Google.

## 3. ⚠️ Règle critique apprise cette session

**Le repo web est sur ce poste : `C:\Users\benta\Apex-Coach`** (routes `app/api/**/route.ts`, types, composants).
**`docs/sprints/WEB_FLOW_AUDIT.md` est INEXACT sur les endpoints.** Toujours vérifier chemin + méthode + body + shape de réponse **contre le code web réel** avant d'implémenter un appel API.
- Exemple corrigé : suppression compte = `POST /api/user/delete-account { password }` (re-auth), PAS `/api/account/delete { confirm }`.
- Export RGPD = `GET /api/gdpr/export` (renvoie JSON inline), PAS un email.

---

## 4. Fait cette session (11 commits sur `sprint-final-mobile`)

| Domaine | Détail | Tickets |
|---------|--------|---------|
| **Conformité** | Suppression groupe `(payment)`, helper `lib/web-browser.ts` (UTM auto, PAGE_SHEET), gate nutrition → home | — |
| **Paywall** | `components/subscription/PaywallInformational.tsx` (4 triggers, zéro prix) + `app/(modals)/paywall.tsx` | S3-T20 |
| **Onboarding** | Welcome non-connecté, auth guard → welcome, footer signup→web sur login, stub signup supprimé | S3-T01/T02 |
| **Conversion** | `TrialBanner` + `PromoExpiryBanner` + `lib/subscription/countdown.ts` + getters store, intégrés en tête de Programme | S2-T13/T14/T22 |
| **Nutrition** | `MacroRings` (SVG), `ShoppingList` par rayon (`lib/nutrition/food-categories.ts`), `NutritionGenerationProgress` + retry + polling | S2-T23/T24/T25 |
| **RGPD (bloquant stores)** | `accountApi` + `GdprExportButton` (Share natif) + `DeleteAccountButton` (SUPPRIMER + mot de passe), intégrés au Profil | S4-T11/T12 |
| **Sécurité** | Audit passé ; `.gitignore` (`.env`, `google-services.json`, `*-service-account.json`, `.idea/`) ; `apiFetch` tolère corps vide | — |
| **Observabilité** | `@sentry/react-native` 7.11.0 (via `expo install`, config plugin auto-ajouté) ; init env-based `EXPO_PUBLIC_SENTRY_DSN` (vide = no-op) dans `app/_layout.tsx` ; scrubber RGPD `lib/monitoring/scrub.ts` (email/identité/contact/santé Step 5 masqués, `user.id` conservé) ; `AppErrorBoundary` global ; tags `platform`/`app_version`/`user_plan` | S4-T14 |

**État technique : 161 tests verts (27 suites), `tsc` + `eslint` clean.**

Fichier mock test important : `__mocks__/react-native-reanimated.js` expose désormais `Animated.View/Text/ScrollView/Image` (nécessaire pour tester les composants animés).

---

## 5. Reste à faire (par priorité)

### A. Avant le premier build/TestFlight
1. ✅ **Sentry (S4-T14) — FAIT.** Intégration env-based `EXPO_PUBLIC_SENTRY_DSN` (vide = no-op). Reste **côté Aziz** : créer le projet Sentry → remplir le DSN dans `.env`. Pour les **source maps** sur EAS, fournir `SENTRY_AUTH_TOKEN` + org/project au config plugin `@sentry/react-native` dans `app.json` (aujourd'hui en bare string, upload désactivé tant que le token manque — ne casse pas le build).
2. **Workout fixes Sprint 2** : `FreeTimer` (S2-T21), drag-drop exos en prep (S2-T19), `ExerciseVideoModal` (S2-T20 — nécessite ajouter `expo-video`, **valider compat SDK 55** ou fallback WebView).

### B. Sprint 3 restant
3. Deep links auth : `set-password` / reset-password (écrans encore stubs), config deep links (`lib/deep-linking.ts` est un squelette), attribution (Apple Search Ads + Play Referrer).

### C. Sprint 4 restant
4. Profil complet (S4-T06), modals settings (objectif, jeûne, mot de passe, notifications, avis), bilan modal + tab Bilan + analytics, push notifications + store settings.

### D. Sprint 5 — publication
5. `eas.json` prod (corriger `serviceAccountKeyPath` → vraie clé service account, pas `google-services.json`), `.well-known` (apple-app-site-association + assetlinks.json) côté **repo web**, ASO iOS+Android, build+submit, buffer review.

---

## 6. Actions humaines (Aziz) — bloquantes pour publier

- [ ] **Inscription Apple Developer Program** (99€/an, choisir **Individuel** — pas Organisation/D-U-N-S = trop long). Démarré ? Valider sous 24-48h. C'est la longue traîne.
- [ ] Créer la fiche **App Store Connect** (bundle `app.apexcoach.mobile`, nom « Apex Coach »).
- [ ] Compte **Google Play Developer** (25$) + créer l'app.
- [ ] **Service account Google Play** → clé JSON (pour `eas submit`). NE PAS committer (déjà gitignoré).
- [ ] Créer un **projet Sentry mobile** + fournir le **DSN**.
- [ ] Mettre les **routines MR1-MR8 en pause** sur code.claude.ai (déclencheurs RemoteTrigger).
- [ ] Fournir le **Team ID Apple** (pour `apple-app-site-association`).

---

## 7. Comment reprendre dans une nouvelle session

1. Ouvrir le repo, vérifier la branche : `git checkout sprint-final-mobile && git pull`.
2. Lire ce doc + `CLAUDE.md` + la mémoire (chargée auto).
3. Charger le skill `apex-mobile-dev` (+ celui du domaine visé).
4. Reprendre sur **Sentry** (§5.A.1) sauf priorité différente.
5. Pour tout appel API : **grep le repo web** `C:\Users\benta\Apex-Coach\app\api` d'abord (cf. §3).
6. Avant chaque commit : `npx tsc --noEmit` + `npm test` + `eslint`. Push après.

**Plan détaillé original :** `C:\Users\benta\.claude\plans\jusqu-a-present-le-dev-woolly-nebula.md`
