# Plan hebdo MR1 — Sprint 2 · Semaine 2026-W23

> **Généré le :** 2026-06-01  
> **Sprint actif :** Sprint 2 — Dashboard + Programme + Workout + Nutrition + Banners  
> **Routine :** MR1 Sprint Planner v1.0  
> **PRs ouvertes au moment du run :** 2 (#47, #50)  

---

## État du sprint 2

Le sprint 2 est en **phase terminale** : toutes les issues ont été créées par MR2 avant le premier run de MR1, et la majorité des tickets est livrée.

| Tickets done | Tickets livrés |
|---|---|
| 24 / 26 | T00-T13, T15-T19, T21-T23 + T14 + T24 |
| 2 en cours | T20 (PR #47), T25 (PR #50) |

---

## Tickets planifiés cette semaine

> **0 nouvelle issue créée** — toutes les issues existaient déjà (idempotence).

| ID | Titre | Estim. | Dépendances | Issue GitHub | Statut |
|----|-------|--------|-------------|--------------|--------|
| S2-T14 | Composant `PromoExpiryBanner` | S · ~80 LOC · low | aucune | [#42](https://github.com/Azizbnb/Apex-Coach-mobile/issues/42) (CLOSED ✅) | Livré — SKIP |
| S2-T20 | Modal vidéo démo embarqué | M · ~200 LOC · med | S2-T10 ✅ | [#43](https://github.com/Azizbnb/Apex-Coach-mobile/issues/43) | PR [#47](https://github.com/Azizbnb/Apex-Coach-mobile/pull/47) draft — SKIP |
| S2-T24 | `ShoppingListSection` catégories + `SupplementRecs` | M · ~220 LOC · low | S2-T11 ✅ | [#44](https://github.com/Azizbnb/Apex-Coach-mobile/issues/44) (CLOSED ✅) | Livré — SKIP |
| S2-T25 | `NutritionGenerationProgress` + retry | M · ~180 LOC · med | S2-T11 ✅ | [#45](https://github.com/Azizbnb/Apex-Coach-mobile/issues/45) | PR [#50](https://github.com/Azizbnb/Apex-Coach-mobile/pull/50) draft — SKIP |

---

## Tickets en attente (dépendances non mergées)

Aucun — toutes les dépendances de Sprint 2 sont satisfaites.

---

## Récapitulatif

| Métrique | Valeur |
|----------|--------|
| Tickets éligibles analysés | 4 |
| Issues créées ce run | 0 (idempotence) |
| Issues reportées (dépendances) | 0 |
| PRs draft ouvertes | 2 (#47 T20, #50 T25) |
| Estimation totale restante | 2 × M (~380 LOC) |

### Action requise

Les 2 PRs draft en attente de review humaine doivent être mergées pour clore le Sprint 2 :
- **PR #47** `[S2-T20]` — Modal vidéo démo embarqué (`exercise-video.tsx` + `ExerciseVideoButton`)
- **PR #50** `[S2-T25]` — `NutritionGenerationProgress` + retry génération

Une fois ces 2 PRs mergées, **MR1 basculera automatiquement sur Sprint 3** au prochain cron (lundi 08/06).

### Prochaine exécution

Si T20 et T25 sont mergés avant lundi 08/06 → MR1 lancera Sprint 3 (26 tickets : welcome, onboarding, questionnaire 24 micro-steps, redeem, paywall info, deep links, attribution).

---

*Plan généré automatiquement par MR1 v1.0 le 2026-06-01. Ne pas modifier manuellement.*
