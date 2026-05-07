# Sprint 2 — Dashboard + Programme + Workout actif + Nutrition

> **Spec source :** `Apex-Coach/docs/MOBILE_APP_TECHNICAL_SPEC_v2.md` §18 Sprint 2 (Jours 6-12, ~7j)
> **Livrable :** dashboard complet avec programme, entraînement actif, nutrition, liens affiliés, banners.
> **Total tickets :** 19 (S2-T00 Setup Jest ajouté en tête, prérequis MR2 ; S2-T15 à T18 ajoutés en follow-up des PRs #7-#10 le 2026-05-07)

---

### S2-T00: Setup Jest + ESLint + Prettier (PRÉREQUIS MR2 — bloquant absolu)

- **Statut :** todo
- **Estimation :** M (~150 LOC, low)
- **Dépendances :** aucune (priorité 1 absolue — sans ce ticket, MR2 échoue à STEP 6 sur `npx jest` ET `npx eslint`, et marque `mr2-blocked`)
- **Fichiers :** `package.json` (devDependencies + scripts), `jest.config.js`, `jest.setup.ts`, `__tests__/components/ui/Button.test.tsx`, `.eslintrc.js`, `.eslintignore`, `.prettierrc.js`
- **Critères d'acceptance — Jest :**
  - [ ] devDependencies : `jest`, `jest-expo`, `@testing-library/react-native`, `@types/jest`, `react-test-renderer` (versions compatibles RN 0.83 / React 19)
  - [ ] `jest.config.js` avec `preset: 'jest-expo'`, `transformIgnorePatterns` pour RN/Expo/Supabase, `moduleNameMapper` pour `@/*`, `setupFilesAfterEach: ['<rootDir>/jest.setup.ts']`
  - [ ] `jest.setup.ts` avec mocks globaux : `expo-router`, `expo-secure-store`, `@supabase/supabase-js`
  - [ ] 1 smoke test `__tests__/components/ui/Button.test.tsx` qui rend `<Button label="Test" />` et passe vert
  - [ ] Scripts : `"test": "jest"`, `"test:watch": "jest --watch"`, `"test:coverage": "jest --coverage"`
  - [ ] `npx jest --silent` retourne `0`
- **Critères d'acceptance — ESLint :**
  - [ ] devDependencies : `eslint`, `eslint-config-expo` (preset officiel Expo 55 + RN), `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`
  - [ ] `.eslintrc.js` avec `extends: ['expo']`, parser TS, règles spécifiques projet (no `as any` interdit, no `console.log` warning, react-hooks/rules-of-hooks error)
  - [ ] `.eslintignore` exclut `node_modules`, `.expo`, `dist`, `web-build`
  - [ ] Script : `"lint": "eslint . --ext .ts,.tsx"`, `"lint:fix": "eslint . --ext .ts,.tsx --fix"`
  - [ ] `npx eslint . --ext .ts,.tsx` retourne `0` (zéro warning sur le code Sprint 1 existant — corriger sinon)
- **Critères d'acceptance — Prettier :**
  - [ ] devDependencies : `prettier`, `eslint-config-prettier` (désactive règles ESLint conflictuelles)
  - [ ] `.prettierrc.js` aligné avec le web (singleQuote, trailingComma all, printWidth 100, semi true)
  - [ ] Script : `"format": "prettier --write ."`, `"format:check": "prettier --check ."`
- **Critères d'acceptance — global :**
  - [ ] `npx tsc --noEmit` reste vert
  - [ ] `npm test && npm run lint && npm run format:check` tous verts en chaîne
- **Notes :** Référence templates `.claude/skills/apex-mobile-test/SKILL.md`. **Sans ce ticket complet, MR2 + MR4 hit `mr2-blocked` au 1er run.** À traiter en priorité absolue lundi 11 mai par MR2.

---

### S2-T01: Composant `WeekCard` (carte semaine)

- **Statut :** todo
- **Estimation :** S (~80 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/programme/WeekCard.tsx`, `components/programme/__tests__/WeekCard.test.tsx`
- **Critères d'acceptance :**
  - [ ] Affiche numéro de semaine, nb de sessions, % progression
  - [ ] État `unlocked` / `locked` (lock icon + date déverrouillage)
  - [ ] Press → navigue vers `(tabs)/programme/[weekNumber]`
  - [ ] Test unitaire RN avec `react-native-testing-library`
- **Notes :** lit `useProgram()` pour le statut. Référence design : `components/subscription/ProgressiveUnlock.tsx` côté web.

### S2-T02: Composant `SessionCard` (carte session)

- **Statut :** todo
- **Estimation :** S (~70 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/programme/SessionCard.tsx` + test
- **Critères d'acceptance :**
  - [ ] Titre session, jour, durée estimée, nb exercices
  - [ ] Badge état (à faire / terminée / sautée)
  - [ ] Press → ouvre modal `(modals)/session-detail.tsx`

### S2-T03: Composant `ExerciseCard` (carte exercice)

- **Statut :** todo
- **Estimation :** S (~90 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/programme/ExerciseCard.tsx` + test
- **Critères d'acceptance :**
  - [ ] Nom exercice, sets × reps, temps de repos, bouton play vidéo si dispo
  - [ ] Optionnel : tap sur play ouvre `(modals)/exercise-detail.tsx`
  - [ ] Variante compacte pour liste

### S2-T04: Composant `ProgressRing` (anneau progression)

- **Statut :** todo
- **Estimation :** S (~60 LOC, med)
- **Dépendances :** aucune
- **Fichiers :** `components/programme/ProgressRing.tsx`
- **Notes :** SVG via `react-native-svg`. Animer avec `react-native-reanimated`.

### S2-T05: Écran `(tabs)/programme/index.tsx` complet

- **Statut :** todo
- **Estimation :** M (~200 LOC, med)
- **Dépendances :** S2-T01, S2-T02, S2-T04
- **Fichiers :** `app/(tabs)/programme/index.tsx`
- **Critères d'acceptance :**
  - [ ] Liste WeekCards avec state progressive unlock
  - [ ] Header : ProgressRing global + nom du programme
  - [ ] Pull-to-refresh
  - [ ] Skeleton loading
  - [ ] Empty state si pas de programme

### S2-T06: Modal `(modals)/session-detail.tsx`

- **Statut :** todo
- **Estimation :** M (~150 LOC, low)
- **Dépendances :** S2-T03
- **Fichiers :** `app/(modals)/session-detail.tsx`
- **Critères d'acceptance :**
  - [ ] Liste ExerciseCards de la session
  - [ ] CTA "Démarrer la session" → `(tabs)/workout` avec session passée en param
  - [ ] CTA "Marquer comme sautée"

### S2-T07: Store `stores/workout.ts` + hook `useWorkout`

- **Statut :** todo
- **Estimation :** M (~180 LOC, med)
- **Dépendances :** aucune
- **Fichiers :** `stores/workout.ts`, `hooks/useWorkout.ts` + tests
- **Critères d'acceptance :**
  - [ ] State : sessionActive, currentExerciseIndex, sets[], timer, startedAt
  - [ ] Actions : startSession, logSet, nextExercise, finishSession
  - [ ] Persist actif via SecureStore (resume si app fermée en cours de session)

### S2-T08: Composant `SetTracker` (tracking sets/reps/weight)

- **Statut :** todo
- **Estimation :** M (~150 LOC, low)
- **Dépendances :** S2-T07
- **Fichiers :** `components/workout/SetTracker.tsx` + test

### S2-T09: Composant `RestTimer` + Modal `(modals)/rest-timer.tsx`

- **Statut :** todo
- **Estimation :** M (~120 LOC, med)
- **Dépendances :** S2-T07
- **Fichiers :** `components/workout/RestTimer.tsx`, `app/(modals)/rest-timer.tsx`
- **Notes :** son + haptics (expo-haptics) à l'écoulement. Déclenche notification background si app pas au premier plan.

### S2-T10: Écran `(tabs)/workout/index.tsx` (Active Workout, full-screen)

- **Statut :** todo
- **Estimation :** L (~300 LOC, high)
- **Dépendances :** S2-T07, S2-T08, S2-T09
- **Fichiers :** `app/(tabs)/workout/index.tsx`, `components/workout/ActiveWorkout.tsx`, `components/workout/CompletionScreen.tsx`
- **Critères d'acceptance :**
  - [ ] Affiche exercice courant + SetTracker + bouton "Set suivant"
  - [ ] Timer entre sets (modal RestTimer)
  - [ ] Progress bar globale (X/N exercices)
  - [ ] Completion screen avec stats + POST `/api/workout/complete-session`
  - [ ] Haptics sur set logged

### S2-T11: Écran `(tabs)/nutrition/index.tsx` (gated Coaching Pro)

- **Statut :** todo
- **Estimation :** L (~280 LOC, med)
- **Dépendances :** aucune
- **Fichiers :** `app/(tabs)/nutrition/index.tsx`, `components/nutrition/{MealPlanCard,MacroSummary,ShoppingList,RecipeDetail}.tsx`
- **Critères d'acceptance :**
  - [ ] Plan repas du jour + macros
  - [ ] Bouton "Liste de courses" → modal complet
  - [ ] Si pas Coaching Pro : `FeatureGate` avec CTA upgrade
  - [ ] Skeleton + empty state

### S2-T12: Composants affiliés (`AffiliateLink`, `EquipmentRecs`, `SupplementRecs`)

- **Statut :** todo
- **Estimation :** M (~180 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/affiliate/*.tsx`
- **Notes :** ouvrir l'URL dans le browser système (`WebBrowser.openBrowserAsync`). Tracking : POST `/api/affiliate/click`.

### S2-T13: Composant `TrialBanner` + countdown

- **Statut :** todo
- **Estimation :** S (~100 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/subscription/TrialBanner.tsx`, `hooks/useTrialCountdown.ts`
- **Notes :** affiché si `useSubscription().isTrial === true`. Compte j+h restants jusqu'à `current_period_end`.

### S2-T14: Composant `PromoExpiryBanner` (préparation Sprint 3)

- **Statut :** todo
- **Estimation :** S (~80 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/subscription/PromoExpiryBanner.tsx`
- **Notes :** affiché si `subscription.isPromo`. Banner orange si J-7 avant expiration.

---

## Follow-ups PRs #7-#10 (ajoutés 2026-05-07 après merge)

### S2-T15: Extraire `FeatureGate` vers `components/subscription/FeatureGate.tsx`

- **Statut :** todo
- **Estimation :** S (~80 LOC, low)
- **Dépendances :** aucune (S2-T11 mergée)
- **Fichiers :** `components/subscription/FeatureGate.tsx` (nouveau), `app/(tabs)/nutrition/index.tsx` (import + usage)
- **Critères d'acceptance :**
  - [ ] Composant exporté générique avec props `{ icon, title, description, ctaUrl, ctaLabel }`
  - [ ] `app/(tabs)/nutrition/index.tsx` ramené sous 150 lignes après extraction
  - [ ] Le composant utilise `WebBrowser.openBrowserAsync` pour ouvrir `ctaUrl`
  - [ ] `accessibilityRole="link"` + `accessibilityLabel` sur le `Pressable` secondaire
  - [ ] 1 test unitaire (rendu + appel `openBrowserAsync` au tap)
- **Notes :** résout le MED-2 de la PR #10 (164 lignes > seuil anti-troncature 150). Composant prévu par `MOBILE_APP_TECHNICAL_SPEC_v2.md` §3 — sera réutilisé par `PaywallScreen`, `PromoExpiryBanner`, et tout futur gating Pro.

### S2-T16: `MealPlanCard` ouvre le détail du repas (pas seulement le 1er aliment)

- **Statut :** todo
- **Estimation :** S (~80 LOC, low)
- **Dépendances :** aucune (S2-T11 mergée)
- **Fichiers :** `components/nutrition/MealDetail.tsx` (nouveau modal), `app/(tabs)/nutrition/index.tsx` (state + onPress), `components/nutrition/MealPlanCard.tsx` (signature inchangée)
- **Critères d'acceptance :**
  - [ ] Nouveau modal `MealDetail` qui affiche le repas complet (heure + nom + tous les aliments avec leurs macros)
  - [ ] Tap sur un aliment dans `MealDetail` → ouvre `RecipeDetail` du-dit aliment
  - [ ] `app/(tabs)/nutrition/index.tsx:onPress` ouvre `MealDetail(meal)` au lieu de `setSelectedFood(meal.foods[0])`
  - [ ] 1 test unitaire `MealDetail` (rendu + tap aliment → onPress callback)
- **Notes :** résout LOW-2 de la PR #10. UX dégradée actuelle si plusieurs aliments par repas (seul `foods[0]` est accessible).

### S2-T17: Tests unitaires `RecipeDetail` + `ShoppingList`

- **Statut :** todo
- **Estimation :** S (~120 LOC, low)
- **Dépendances :** aucune (S2-T11 mergée)
- **Fichiers :** `__tests__/components/nutrition/RecipeDetail.test.tsx` (nouveau), `__tests__/components/nutrition/ShoppingList.test.tsx` (nouveau)
- **Critères d'acceptance :**
  - [ ] `RecipeDetail` : 4 tests (modal masqué si `food=null`, rendu macros, calories, bouton fermeture)
  - [ ] `ShoppingList` : 5 tests (modal masqué si `visible=false`, agrégation quantités par nom, compteur ingrédients, ordre alphabétique, bouton fermeture)
  - [ ] Tous les tests passent (`./node_modules/.bin/jest --silent components/nutrition`)
- **Notes :** résout LOW-1 de la PR #10. Aligne la couverture avec `MacroSummary` et `MealPlanCard` qui ont déjà 7 tests chacun.

### S2-T18: Tech debt cosmétique — LOWs PRs #8 et #9

- **Statut :** todo
- **Estimation :** S (~30 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/programme/WeekCard.tsx`, `components/programme/__tests__/WeekCard.test.tsx`, `__mocks__/react-native-reanimated.js`
- **Critères d'acceptance :**
  - [ ] Retirer le `as never` ligne 34 de `WeekCard.tsx` — typer correctement la route Expo Router (utiliser `Href` du package `expo-router`)
  - [ ] Déplacer `components/programme/__tests__/WeekCard.test.tsx` vers `__tests__/components/programme/WeekCard.test.tsx` (convention CLAUDE.md mobile §test location)
  - [ ] Documenter la surface du mock `__mocks__/react-native-reanimated.js` (entête JSDoc listant `useAnimatedStyle`, `useSharedValue`, `withTiming`, `Easing`)
  - [ ] `npx jest --silent` toujours vert (15/15 ProgressRing + WeekCard)
  - [ ] `npx eslint . --ext .ts,.tsx` zéro nouvelle erreur
- **Notes :** résout LOW-1 et LOW-2 de la PR #8 (WeekCard) + LOW-1 de la PR #9 (mock surface). Bundle pour économiser un slot MR2.
