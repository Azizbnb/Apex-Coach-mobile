# Plan hebdo MR1 — Sprint 2 / Semaine 2026-W20

> **Sprint actif :** Sprint 2 — Dashboard + Programme + Workout actif + Nutrition + Affiliés + Banners
> **Semaine ISO :** 2026-W20 (11–17 mai 2026)
> **Généré le :** 2026-05-11 par MR1 v1.0

---

## Tickets planifiés (5 / cap 5)

| ID | Titre | Taille | Risque | Dépendances | Issue GitHub |
|----|-------|--------|--------|-------------|--------------|
| S2-T02 | Composant `SessionCard` (carte session) | S | low | aucune | #15 |
| S2-T03 | Composant `ExerciseCard` (carte exercice) | S | low | aucune | #16 |
| S2-T08 | Composant `SetTracker` (tracking sets/reps/weight) | M | low | S2-T07 ✓ | #17 |
| S2-T09 | Composant `RestTimer` + Modal `(modals)/rest-timer.tsx` | M | med | S2-T07 ✓ | #18 |
| S2-T12 | Composants affiliés (`AffiliateLink`, `EquipmentRecs`, `SupplementRecs`) | M | low | aucune | #19 |

**Estimation totale :** ~510 LOC (S+S+M+M+M)
**Tickets L en parallèle :** 0 — conforme règle cap

---

## Rappel : issues follow-up déjà ouvertes (créées 2026-05-07)

Ces 4 issues sont déjà dans la queue MR2 avec `mr2-ready` — non recomptées dans ce plan :

| ID | Titre | Issue |
|----|-------|-------|
| S2-T15 | Extraire `FeatureGate` vers `components/subscription/FeatureGate.tsx` | #11 |
| S2-T16 | `MealPlanCard` ouvre le détail du repas (pas seulement le 1er aliment) | #12 |
| S2-T17 | Tests unitaires `RecipeDetail` + `ShoppingList` | #13 |
| S2-T18 | Tech debt cosmétique — LOWs PRs #8 et #9 | #14 |

---

## Tickets en attente (dépendances non mergées)

| ID | Titre | Bloqué par |
|----|-------|-----------|
| S2-T05 | Écran `programme/index.tsx` complet | S2-T02 (→ #15, pas encore mergé) |
| S2-T06 | Modal `session-detail.tsx` | S2-T03 (→ #16, pas encore mergé) |
| S2-T10 | Écran `workout/index.tsx` (Active Workout, L/high) | S2-T08 (→ #17) + S2-T09 (→ #18) |

---

## Tickets éligibles non planifiés (cap atteint)

| ID | Titre | Taille | Raison report |
|----|-------|--------|---------------|
| S2-T13 | Composant `TrialBanner` + countdown | S | Cap 5 atteint |
| S2-T14 | Composant `PromoExpiryBanner` | S | Cap 5 atteint |

---

## Récap

| Métrique | Valeur |
|----------|--------|
| Tickets planifiés | 5 |
| Tickets reportés (dépendances) | 3 |
| Tickets reportés (cap) | 2 |
| Estimation totale planifiée | ~510 LOC |
| PR ouvertes au démarrage | 0 |
| Issues créées ce run | #15, #16, #17, #18, #19 |
| Issues follow-up déjà présentes | #11, #12, #13, #14 |

---

## Tickets mergés en W19 (référence)

| ID | Titre | Issue fermée |
|----|-------|-------------|
| S2-T00 | Setup Jest + ESLint + Prettier | #1 |
| S2-T01 | Composant `WeekCard` | #4 |
| S2-T04 | Composant `ProgressRing` | #3 |
| S2-T07 | Store `workout.ts` + hook `useWorkout` | #2 |
| S2-T11 | Écran `nutrition/index.tsx` (gated Coaching Pro) | #5 |
