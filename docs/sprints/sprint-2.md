# Sprint 2 — Dashboard + Programme + Workout actif + Nutrition + Affiliés + Banners

> **Source de vérité :** `docs/sprints/WEB_FLOW_AUDIT.md` (sections 5.14 à 5.17 + 6.1 à 6.4 + 7.1 à 7.5 et 7.9 à 7.10)
> **Livrable :** miroir complet du flow web `/programme`, `/entrainement` (+ session/[id] redirect), `/nutrition`, `/nutrition` preferences (Sprint 3) et de leurs modals/banners.
> **Total tickets :** 26 (17 livrés via PRs #6/#7/#8/#9/#10/#20/#21/#22/#23/#24/#25/#26/#27/#28/#29/#31, 9 todo : T13, T14, T19-T25).
> **PRs livrées :** [#29](https://github.com/Azizbnb/Apex-Coach-mobile/pull/29) (assemblage Programme/Session detail), [#30](https://github.com/Azizbnb/Apex-Coach-mobile/pull/30) (icons + routes FR), [#31](https://github.com/Azizbnb/Apex-Coach-mobile/pull/31) (flow workout 6 phases).

---

## A — Infrastructure tests / lint (prérequis MR2)

### S2-T00: Setup Jest + ESLint + Prettier (PRÉREQUIS MR2)

- **Statut :** done — livré (vérifié 2026-05-16 : devDeps, configs, scripts et `__tests__/`, `__mocks__/` tous en place)
- **Estimation :** M (~150 LOC, low)
- **Fichiers :** `package.json` (devDeps + scripts), `jest.config.js`, `jest.setup.ts`, `.eslintrc.js`, `.eslintignore`, `.prettierrc.js`, `__mocks__/react-native-reanimated.js`, `__tests__/{components,hooks,stores}/`
- **Notes :** infrastructure tests/lint/format complète. devDeps actuelles : `jest@^29.7.0`, `jest-expo@^55.0.16`, `@testing-library/react-native@^13.3.3`, `@types/jest@^29.5.14`, `react-test-renderer@^19.2.0`, `eslint@^8.57.1`, `eslint-config-expo@^55.0.0`, `@typescript-eslint/{parser,eslint-plugin}@^7.18.0`, `eslint-config-prettier@^9.1.2`, `prettier@^3.8.3`. Mocks globaux : `expo-router`, `expo-secure-store`, `@supabase/supabase-js`, `react-native-reanimated`.

---

## B — Tab Programme (mirror `/programme`)

> Web : `app/(dashboard)/programme/page.tsx` → composants `ProgrammeWrapper`, `ProgrammeContent`, `FastingBanner`, `EquipmentRecommendations`, `NextUnlockBannerClient`. Modal associé : `SessionDetailModal`.

### S2-T01: Composant `WeekCard` (carte semaine)

- **Statut :** done — livré PR #29
- **Estimation :** S (~80 LOC, low)
- **Fichiers :** `components/programme/WeekCard.tsx`, `__tests__/components/programme/WeekCard.test.tsx`
- **Mirror web :** sous-composant de `components/programme/ProgrammeContent.tsx` (carte semaine)
- **Notes :** `useProgram()` pour le statut + helper `progressive-unlock` partagé avec le web.

### S2-T02: Composant `SessionCard` (carte session)

- **Statut :** done — livré PR #29
- **Estimation :** S (~70 LOC, low)
- **Fichiers :** `components/programme/SessionCard.tsx`
- **Mirror web :** rendu jour par jour dans `ProgrammeContent.tsx`

### S2-T03: Composant `ExerciseCard` (carte exercice)

- **Statut :** done — livré PR #29 (sous-composant de session-detail)
- **Fichiers :** `components/programme/ExerciseCard.tsx`
- **Mirror web :** `components/entrainement/ExerciseCard.tsx`

### S2-T04: Composant `ProgressRing` (anneau progression)

- **Statut :** done — livré PR #29
- **Estimation :** S (~60 LOC, med)
- **Fichiers :** `components/programme/ProgressRing.tsx`
- **Notes :** SVG via `react-native-svg`, animé via `react-native-reanimated`.

### S2-T05: Écran `(tabs)/programme/index.tsx`

- **Statut :** done — livré PR #29
- **Mirror web :** `app/(dashboard)/programme/page.tsx`
- **Notes :** liste WeekCards + ProgressRing global + pull-to-refresh + skeleton + empty state.

### S2-T06: Modal `(modals)/session-detail.tsx`

- **Statut :** done — livré PR #29
- **Mirror web :** `components/programme/SessionDetailModal.tsx` (cf. WEB_FLOW_AUDIT §6.1)
- **Notes :** liste ExerciseCards de la session + CTA "Démarrer la séance" → `(tabs)/entrainement`.

### S2-T22: Intégrer `FastingBanner` + `EquipmentRecs` + `NextUnlockBanner` dans le tab Programme

- **Statut :** todo
- **Estimation :** M (~180 LOC, low)
- **Dépendances :** S2-T05 (mergé)
- **Fichiers :** `app/(tabs)/programme/index.tsx`, `components/programme/FastingBanner.tsx` (nouveau), `components/programme/NextUnlockBanner.tsx` (nouveau)
- **Critères d'acceptance :**
  - [ ] Si `useSubscription().isFastingActive` → afficher `FastingBanner` en haut du tab Programme (mirror `components/fasting/FastingBanner.tsx`)
  - [ ] Si la prochaine semaine n'est pas encore déverrouillée → afficher `NextUnlockBanner` avec date + countdown (mirror `components/subscription/NextUnlockBannerClient.tsx`)
  - [ ] Si user a un questionnaire complété → afficher `EquipmentRecs` en bas (composant existe déjà côté mobile)
  - [ ] 3 tests unitaires (rendu conditionnel des 3 banners)
- **Mirror web :** `app/(dashboard)/programme/page.tsx` lignes intégrant ces 3 composants
- **Notes :** ces 3 éléments existent côté web mais sont absents du tab Programme mobile actuel. Audit §5.14.

---

## C — Tab Entraînement actif (mirror `/entrainement` + flow 6 phases)

> Web : `app/(dashboard)/entrainement/page.tsx` → `WorkoutCompanion` → `ActiveWorkout` (6 phases). Modals : `RestTimerFullscreen`, `ExerciseVideoModal`. Composants prep : `ExercisePrepScreen`, `SortableExerciseItem`, `WorkoutTimerStrip`.

### S2-T07: Store `stores/workout.ts` + hook `useWorkout`

- **Statut :** done — livré PR #31
- **Fichiers :** `stores/workout.ts`, `hooks/useWorkout.ts`
- **Mirror web :** state machine du composant `ActiveWorkout.tsx` (6 phases)
- **Notes :** state = `currentPhase: 'warmup'|'prep'|'exercise'|'restChoice'|'resting'|'cooldown'|'completed'`. `finishSession()` vs `resetSession()` — cf. point 4 du REFONTE_BRIEF.

### S2-T08: Composant `SetTracker` (tracking sets/reps/weight)

- **Statut :** done — livré PR #29, intégré au flow PR #31
- **Fichiers :** `components/workout/SetTracker.tsx`
- **Mirror web :** logique de validation des séries dans `ExerciseView.tsx`

### S2-T09: Composant `RestTimer` + intégration phase `resting`

- **Statut :** done — livré PR #31
- **Fichiers :** `components/workout/RestTimer.tsx`
- **Mirror web :** `components/entrainement/RestTimerFullscreen.tsx` (cf. WEB_FLOW_AUDIT §6.3)
- **Notes :** son + haptics (`expo-haptics`) à l'écoulement. Background notification si app pas au 1er plan.

### S2-T10: Écran `(tabs)/entrainement/index.tsx` + orchestrateur `ActiveWorkout` 6 phases

- **Statut :** done — refondu PR #31 (initialement simpliste PR #29)
- **Fichiers :** `app/(tabs)/entrainement/index.tsx`, `components/workout/{ActiveWorkout,WarmupCooldownCard,ExercisePrepScreen,ExerciseView,RestChoiceScreen,RestTimer,WorkoutTopBar}.tsx`
- **Mirror web :** `components/entrainement/ActiveWorkout.tsx` + sous-composants
- **Notes :** flow `warmup → prep → exercise (×N) → restChoice → resting → cooldown → completed`. POST `/api/workout/complete-session` à la fin.

### S2-T19: Drag-and-drop des exercices en phase `prep`

- **Statut :** todo
- **Estimation :** M (~180 LOC, med)
- **Dépendances :** S2-T10 (mergé)
- **Fichiers :** `components/workout/ExercisePrepScreen.tsx` (refacto), `components/workout/SortableExerciseItem.tsx` (nouveau)
- **Critères d'acceptance :**
  - [ ] Liste numérotée d'exercices avec poignée drag (icône `GripVertical` Lucide)
  - [ ] Drag fluide via `react-native-reanimated` + `react-native-gesture-handler` (long-press 200ms pour activer)
  - [ ] L'ordre persiste dans `useWorkoutStore` avant `startExercises()`
  - [ ] Haptic feedback au drop (`Haptics.impactAsync('light')`)
  - [ ] Accessibilité : `accessibilityActions` (move up / move down) pour fallback non-drag
  - [ ] Test unitaire : reorder met à jour le store
- **Mirror web :** `components/entrainement/SortableExerciseItem.tsx` (@dnd-kit côté web)
- **Notes :** correctif PR #31 (liste numérotée actuelle ne permet pas de réordonner). Cf. REFONTE_BRIEF §"Backlog d'améliorations".

### S2-T20: Modal vidéo démo embarqué (mirror `ExerciseVideoModal`)

- **Statut :** todo
- **Estimation :** M (~200 LOC, med)
- **Dépendances :** S2-T10 (mergé), prérequis schéma vidéo
- **Fichiers :** `app/(modals)/exercise-video.tsx` (nouveau), `components/workout/ExerciseVideoButton.tsx` (nouveau), `lib/programs/schemas.ts` (enrichir avec champ `video_url`)
- **Critères d'acceptance :**
  - [ ] Modal plein écran avec lecteur `expo-video` (player avec play/pause/seek)
  - [ ] Loader pendant fetch signed URL Supabase Storage (mirror hook `useExerciseVideo`)
  - [ ] Boutons « Démo » dans `ExerciseView` et `ExerciseCard` ouvrent le modal au lieu de `WebBrowser.openBrowserAsync`
  - [ ] Fallback gracieux si pas de vidéo dispo (toast "Démo bientôt disponible")
  - [ ] Bouton fermer (X) en overlay + swipe down pour dismiss
  - [ ] Audit RGPD : pas de log d'event en clair, pas de tracking 3rd party (vidéo en first-party uniquement)
- **Mirror web :** `components/entrainement/ExerciseVideoModal.tsx` (cf. WEB_FLOW_AUDIT §6.2)
- **Notes :** **prérequis web** : enrichir le schéma `Apex-Coach/lib/programs/schemas.ts` pour exposer les URLs vidéo des exercices (champ manquant aujourd'hui). À synchroniser via MR7 Web Sync ensuite. Correctif PR #31.

### S2-T21: Timer libre dans `WorkoutTopBar` (mirror `WorkoutTimerStrip`)

- **Statut :** todo
- **Estimation :** S (~120 LOC, low)
- **Dépendances :** S2-T10 (mergé)
- **Fichiers :** `components/workout/FreeTimer.tsx` (nouveau), `components/workout/WorkoutTopBar.tsx` (intégrer le bouton + état)
- **Critères d'acceptance :**
  - [ ] Bouton chrono dans `WorkoutTopBar` (icône `Timer` Lucide)
  - [ ] Tap → menu compact avec presets 30s / 1min / 1min30 / 2min / 3min + bouton "stop"
  - [ ] Timer tourne en parallèle du timer repos (indépendant)
  - [ ] Affichage countdown discret dans `WorkoutTopBar` quand actif
  - [ ] Haptic au démarrage et à l'écoulement
  - [ ] Test unitaire : démarrage + arrêt + indépendance vs RestTimer
- **Mirror web :** `components/entrainement/WorkoutTimerStrip.tsx`
- **Notes :** utile pour le user qui veut un chrono libre (cardio, gainage). Indépendant du flow 6 phases.

---

## D — Tab Nutrition (mirror `/nutrition`)

> Web : `app/(dashboard)/nutrition/page.tsx` → `AccessDeniedState`, `NoDataState`, `MacroRings`, `DayButton`, `DayModal`, `ShoppingListSection`, `SupplementRecommendations`, `NutritionGenerationProgress`. Gated Coaching Pro.

### S2-T11: Écran `(tabs)/nutrition/index.tsx` (gated Coaching Pro)

- **Statut :** done — livré (Sprint 1 + S2-T11 initial)
- **Fichiers :** `app/(tabs)/nutrition/index.tsx`, `components/nutrition/{MealPlanCard,MacroSummary,ShoppingList,RecipeDetail}.tsx`
- **Mirror web :** `app/(dashboard)/nutrition/page.tsx`
- **Notes :** gating Coaching Pro via `FeatureGate`. Skeleton + empty state.

### S2-T15: Extraire `FeatureGate` vers `components/subscription/FeatureGate.tsx`

- **Statut :** done — livré (PR #10)
- **Fichiers :** `components/subscription/FeatureGate.tsx`
- **Mirror web :** `components/subscription/FeatureGate.tsx`
- **Notes :** props `{ icon, title, description, ctaUrl, ctaLabel }`. Réutilisable.

### S2-T16: `MealPlanCard` ouvre le détail complet du repas

- **Statut :** done — livré (PR de S2-T16)
- **Fichiers :** `components/nutrition/MealDetail.tsx`, `app/(tabs)/nutrition/index.tsx`
- **Mirror web :** `components/nutrition/DayModal.tsx` + `MealCard.tsx` (cf. WEB_FLOW_AUDIT §6.4)

### S2-T17: Tests unitaires `RecipeDetail` + `ShoppingList`

- **Statut :** done — livré PR #26
- **Fichiers :** `__tests__/components/nutrition/RecipeDetail.test.tsx`, `__tests__/components/nutrition/ShoppingList.test.tsx`
- **Notes :** résout LOW-1 PR #10. Aligne couverture avec `MacroSummary` et `MealPlanCard`.

### S2-T23: Mirror `MacroRings` (anneaux SVG concentriques)

- **Statut :** todo
- **Estimation :** M (~180 LOC, med)
- **Dépendances :** S2-T11 (mergé)
- **Fichiers :** `components/nutrition/MacroRings.tsx` (nouveau, remplace `MacroSummary` ou en variante)
- **Critères d'acceptance :**
  - [ ] 3 anneaux concentriques (protéines, glucides, lipides) via `react-native-svg` + `react-native-reanimated`
  - [ ] Animation de remplissage à l'apparition (~600ms easing)
  - [ ] Au centre : total calories du jour + objectif
  - [ ] Toggle "vue compacte" (barres) vs "vue anneaux" persisté dans `useSettings`
  - [ ] Test unitaire (rendu + animation reached final state)
- **Mirror web :** `components/nutrition/MacroRings.tsx`
- **Notes :** alternative visuelle plus fidèle au web. Conserver `MacroSummary` (barres) en fallback / mode compact.

### S2-T24: `ShoppingListSection` par catégorie + `SupplementRecommendations`

- **Statut :** todo
- **Estimation :** M (~220 LOC, low)
- **Dépendances :** S2-T11 (mergé)
- **Fichiers :** `components/nutrition/ShoppingList.tsx` (refacto), `components/affiliate/SupplementRecs.tsx` (intégration nutrition)
- **Critères d'acceptance :**
  - [ ] `ShoppingList` regroupe les ingrédients par catégorie (Légumes / Protéines / Féculents / Épicerie / Autres)
  - [ ] Catégories collapsibles (accordion)
  - [ ] Quantités agrégées par nom (mirror web)
  - [ ] `SupplementRecs` affiché sous le plan repas (sidebar web → bas du tab mobile)
  - [ ] `AffiliateLink.openExternal` pour tap supplement → browser
  - [ ] Tests unitaires : agrégation + ordre catégories
- **Mirror web :** `components/nutrition/ShoppingListSection.tsx` + `components/affiliate/SupplementRecommendations.tsx`

### S2-T25: `NutritionGenerationProgress` + retry génération

- **Statut :** todo
- **Estimation :** M (~180 LOC, med)
- **Dépendances :** S2-T11 (mergé)
- **Fichiers :** `components/nutrition/NutritionGenerationProgress.tsx` (nouveau), `app/(tabs)/nutrition/index.tsx` (gestion état)
- **Critères d'acceptance :**
  - [ ] Affiche loader animé si `nutrition_plan.status === 'generating'` (polling 5s)
  - [ ] Affiche écran erreur + CTA "Réessayer" si `status === 'failed'`
  - [ ] CTA "Réessayer" → `POST /api/programs/retry-nutrition` puis bascule sur état `generating`
  - [ ] Toast "Plan nutrition prêt !" quand transition `generating → ready`
  - [ ] Test : 3 états couverts (generating / failed / ready)
- **Mirror web :** `components/programme/NutritionGenerationProgress.tsx` (cf. WEB_FLOW_AUDIT §4 endpoint `/api/programs/retry-nutrition`)

---

## E — Banners abonnement & affiliés (mirror `components/subscription/*` et `components/affiliate/*`)

### S2-T12: Composants affiliés (`AffiliateLink`, `EquipmentRecs`, `SupplementRecs`)

- **Statut :** done — livré
- **Fichiers :** `components/affiliate/{AffiliateLink,EquipmentRecs,SupplementRecs}.tsx`
- **Mirror web :** `components/affiliate/*.tsx`
- **Notes :** `WebBrowser.openBrowserAsync` + tracking `POST /api/affiliate/click`.

### S2-T13: Composant `TrialBanner` + countdown

- **Statut :** todo (vérifié 2026-05-16 : aucun fichier `components/subscription/TrialBanner.tsx` ni `hooks/useTrialCountdown.ts` n'existe encore)
- **Estimation :** S (~100 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/subscription/TrialBanner.tsx`, `hooks/useTrialCountdown.ts`
- **Critères d'acceptance :**
  - [ ] Affichage conditionnel via `useSubscription().isTrial === true`
  - [ ] Compte les jours + heures restants jusqu'à `current_period_end` (mis à jour chaque minute)
  - [ ] Style cohérent : neutre J-7+, orange J-3 → J-1, rouge J-0
  - [ ] Tap → ouvre `(modals)/paywall` avec trigger `trial_expiring` (S3-T20)
  - [ ] 2 tests (rendu conditionnel + countdown formaté)
- **Mirror web :** `components/subscription/TrialExpiryBanner.tsx`

### S2-T14: Composant `PromoExpiryBanner`

- **Statut :** todo (vérifié 2026-05-16 : aucun fichier `components/subscription/PromoExpiryBanner.tsx` n'existe encore)
- **Estimation :** S (~80 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/subscription/PromoExpiryBanner.tsx`
- **Critères d'acceptance :**
  - [ ] Affichage conditionnel via `useSubscription().isPromo === true`
  - [ ] Orange J-7+, rouge J-1
  - [ ] Tap → ouvre `(modals)/paywall` avec trigger `promo_expiring` (S3-T20)
  - [ ] Test : rendu + style selon proximité expiration
- **Mirror web :** `components/subscription/PromoExpiryBanner.tsx`

### S2-T18: Tech debt cosmétique — LOWs PRs #8 / #9

- **Statut :** done — livré PR #25
- **Fichiers :** `components/programme/WeekCard.tsx`, `__tests__/components/programme/WeekCard.test.tsx`, `__mocks__/react-native-reanimated.js`
- **Notes :** résout LOW-1, LOW-2 PR #8 + LOW-1 PR #9. Typage `Href`, migration test vers structure standard, JSDoc surface du mock reanimated.

---

## Récap des dépendances clés

```
S2-T00 (Jest setup) ──► débloque S2-T17 + tous les futurs tests Sprint 3/4
S2-T05 ──► S2-T22 (banners intégration)
S2-T10 ──► S2-T19 (drag-drop) + S2-T20 (vidéo modal) + S2-T21 (timer libre)
S2-T11 ──► S2-T23 (MacroRings) + S2-T24 (ShoppingList catégories) + S2-T25 (génération nutrition)
```

## Sortie de sprint

- **9 tickets `todo` à planifier** : T13 (TrialBanner), T14 (PromoExpiryBanner), T19 (drag-drop prep), T20 (modal vidéo), T21 (timer libre), T22 (intégration banners Programme), T23 (MacroRings SVG), T24 (ShoppingList catégories + Supplements), T25 (NutritionGenerationProgress).
- **17 tickets `done` consolidés** : T00 (PR #6 infra), T01 (#8), T02 (#21), T03 (#22), T04 (#9), T05 (#29), T06 (#29), T07 (#7), T08 (#23), T09 (#24), T10 (#29 + refonte #31), T11 (#10), T12 (#28), T15 (#20), T16 (#27), T17 (#26), T18 (#25) — conservés dans le fichier pour la traçabilité MR1.
- Vérification end-of-sprint : ouvrir le tab Programme + tab Entraînement + tab Nutrition sur device → flow web miroir complet, modals OK, banners conditionnels OK, drag-drop + vidéo + timer libre opérationnels.
