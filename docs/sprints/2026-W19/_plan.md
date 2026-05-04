# Plan hebdo MR1 — Sprint 2 / Semaine 2026-W19

> **Sprint actif :** Sprint 2 — Dashboard + Programme + Workout actif + Nutrition + Affiliés + Banners
> **Semaine ISO :** 2026-W19 (04–10 mai 2026)
> **Généré le :** 2026-05-04 par MR1 v1.0

---

## Tickets planifiés (5 / cap 5)

| ID | Titre | Taille | Risque | Dépendances | Issue GitHub |
|----|-------|--------|--------|-------------|--------------|
| S2-T00 | Setup Jest + ESLint + Prettier (PRÉREQUIS MR2) | M | low | aucune | #1 |
| S2-T07 | Store `stores/workout.ts` + hook `useWorkout` | M | med | aucune | #2 |
| S2-T04 | Composant `ProgressRing` | S | med | aucune | #3 |
| S2-T01 | Composant `WeekCard` | S | low | aucune | #4 |
| S2-T11 | Écran `(tabs)/nutrition/index.tsx` (gated Coaching Pro) | L | med | aucune | #5 |

**Estimation totale :** ~750 LOC (M+M+S+S+L)
**Tickets L en parallèle :** 1 (S2-T11) — conforme règle cap

---

## Tickets en attente (dépendances non mergées)

| ID | Titre | Bloqué par |
|----|-------|-----------|
| S2-T05 | Écran `programme/index.tsx` complet | S2-T01, S2-T02, S2-T04 |
| S2-T06 | Modal `session-detail.tsx` | S2-T03 |
| S2-T08 | Composant `SetTracker` | S2-T07 |
| S2-T09 | Composant `RestTimer` + modal | S2-T07 |
| S2-T10 | Écran `workout/index.tsx` (Active Workout) | S2-T07, S2-T08, S2-T09 |

---

## Tickets éligibles non planifiés (cap atteint)

| ID | Titre | Taille | Raison report |
|----|-------|--------|---------------|
| S2-T02 | Composant `SessionCard` | S | Cap 5 atteint |
| S2-T03 | Composant `ExerciseCard` | S | Cap 5 atteint |
| S2-T12 | Composants affiliés | M | Cap 5 atteint |
| S2-T13 | Composant `TrialBanner` + countdown | S | Cap 5 atteint |
| S2-T14 | Composant `PromoExpiryBanner` | S | Cap 5 atteint |

---

## Récap

| Métrique | Valeur |
|----------|--------|
| Tickets planifiés | 5 |
| Tickets reportés (dépendances) | 5 |
| Tickets reportés (cap) | 5 |
| Estimation totale planifiée | ~750 LOC |
| PR ouvertes au démarrage | 0 |
| Issues créées ce run | #1, #2, #3, #4, #5 |
