# Plan hebdomadaire MR1 — 2026-W22

> **Sprint actif :** Sprint 2 — Dashboard + Programme + Workout actif + Nutrition + Affiliés + Banners
> **Semaine :** 2026-W22 (25 mai – 31 mai 2026)
> **Date génération :** 2026-05-25 (run MR1 v1.0)
> **Source de vérité :** `docs/sprints/sprint-2.md`

---

## Tickets planifiés cette semaine

| ID | Titre | Estimation | Dépendances | Issue GitHub | État |
|----|-------|------------|-------------|--------------|------|
| S2-T25 | `NutritionGenerationProgress` + retry génération | M (~180 LOC, med) | S2-T11 ✅ mergé | [#45](https://github.com/Azizbnb/Apex-Coach-mobile/issues/45) | `mr2-ready` (pas de PR) |
| S2-T20 | Modal vidéo démo embarqué (mirror `ExerciseVideoModal`) | M (~200 LOC, med) | S2-T10 ✅ mergé | [#43](https://github.com/Azizbnb/Apex-Coach-mobile/issues/43) | en cours — [PR #47](https://github.com/Azizbnb/Apex-Coach-mobile/pull/47) (draft) |

**Ordre de priorité :** T25 en premier (aucune PR ouverte, `mr2-ready`), T20 déjà en cours via PR #47.

---

## Tickets en attente / déjà livrés

| ID | Titre | Issue | Motif |
|----|-------|-------|-------|
| S2-T14 | Composant `PromoExpiryBanner` | [#42](https://github.com/Azizbnb/Apex-Coach-mobile/issues/42) | **closed** — livré avant ce run MR1 |
| S2-T24 | `ShoppingListSection` par catégorie + `SupplementRecommendations` | [#44](https://github.com/Azizbnb/Apex-Coach-mobile/issues/44) | **closed** — livré avant ce run MR1 |

---

## Idempotence — Issues non créées (existaient déjà)

Toutes les issues Sprint 2 ont été anticipées par MR2 avant le premier run MR1. Aucune création cette semaine.

| Ticket | Issue existante | Créée le |
|--------|-----------------|----------|
| S2-T14 | #42 (closed) | 2026-05-21 |
| S2-T20 | #43 (open) | 2026-05-21 |
| S2-T24 | #44 (closed) | 2026-05-21 |
| S2-T25 | #45 (open) | 2026-05-21 |

---

## Récap

| Métrique | Valeur |
|----------|--------|
| Tickets planifiés | 2 (T25 + T20) |
| Issues créées ce run | 0 (idempotence) |
| Issues en attente de PR | 1 (T25 → #45) |
| PR ouvertes | 1 (PR #47 pour T20) |
| Estimation totale | ~380 LOC (M + M) |
| Tickets `done` Sprint 2 | 24/26 |
| Tickets `todo` restants Sprint 2 | 2 (T20 + T25) |

**Sprint 2 quasi-terminé.** Une fois T20 (PR #47) et T25 mergés, le Sprint 2 sera complet et MR1 basculera sur Sprint 3.

---

> *Plan généré automatiquement par MR1 v1.0 — ne pas modifier manuellement.*
