# Sprint 2 — Dashboard + Programme + Workout actif + Nutrition

> **Spec source :** `Apex-Coach/docs/MOBILE_APP_TECHNICAL_SPEC_v2.md` §18 Sprint 2 (Jours 6-12, ~7j)
> **Livrable :** dashboard complet avec programme, entraînement actif, nutrition, liens affiliés, banners.
> **Total tickets :** 14

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
