# Plan hebdo MR1 — Sprint 2 — Semaine 2026-W21

> **Généré le :** 2026-05-18
> **Routine :** MR1 Sprint Planner v1.0
> **Sprint actif :** Sprint 2 — Dashboard + Programme + Workout actif + Nutrition + Affiliés + Banners
> **Source :** `docs/sprints/sprint-2.md`

---

## Tickets planifiés cette semaine (5/5)

| ID | Titre | Estimation | Dépendances | Issue GitHub |
|----|-------|------------|-------------|--------------|
| S2-T19 | Drag-and-drop exercices en phase `prep` | M (~180 LOC, med) | S2-T10 ✅ | [#32](https://github.com/Azizbnb/Apex-Coach-mobile/issues/32) |
| S2-T21 | Timer libre dans `WorkoutTopBar` | S (~120 LOC, low) | S2-T10 ✅ | [#33](https://github.com/Azizbnb/Apex-Coach-mobile/issues/33) |
| S2-T23 | Mirror `MacroRings` (anneaux SVG concentriques) | M (~180 LOC, med) | S2-T11 ✅ | [#34](https://github.com/Azizbnb/Apex-Coach-mobile/issues/34) |
| S2-T22 | Intégrer `FastingBanner` + `EquipmentRecs` + `NextUnlockBanner` dans tab Programme | M (~180 LOC, low) | S2-T05 ✅ | [#35](https://github.com/Azizbnb/Apex-Coach-mobile/issues/35) |
| S2-T13 | Composant `TrialBanner` + countdown | S (~100 LOC, low) | aucune | [#36](https://github.com/Azizbnb/Apex-Coach-mobile/issues/36) |

**Ordre de priorité appliqué :**
1. Risque décroissant : T19 (med) + T23 (med) devant les low
2. Verticalité workout : T19 + T21 ensemble pour clore le flow 6 phases
3. Verticalité programme : T22 complète le tab Programme
4. Ticket sans dépendance : T13 (standalone, prérequis S3)

---

## Tickets en attente

| ID | Titre | Raison | Estimation |
|----|-------|--------|------------|
| S2-T20 | Modal vidéo démo embarqué | ⛔ Bloqué — prérequis web : enrichir `Apex-Coach/lib/programs/schemas.ts` avec champ `video_url` (non fait à ce jour) | M (~200 LOC, med) |
| S2-T14 | Composant `PromoExpiryBanner` | Hors cap 5 — éligible semaine suivante | S (~80 LOC, low) |
| S2-T24 | `ShoppingListSection` par catégorie + `SupplementRecommendations` | Hors cap 5 — éligible semaine suivante | M (~220 LOC, low) |
| S2-T25 | `NutritionGenerationProgress` + retry génération | Hors cap 5 — éligible semaine suivante | M (~180 LOC, med) |

---

## Récap

| Métrique | Valeur |
|----------|--------|
| Sprint actif | Sprint 2 |
| Tickets planifiés | 5 |
| Tickets reportés | 4 (1 bloqué externe + 3 hors cap) |
| Estimation totale | ~760 LOC (3×M + 2×S) |
| PR ouvertes au démarrage | 0 |
| Issues créées | #32, #33, #34, #35, #36 |
