# Routines Mobile — Cycle vertueux 24/7

> **But :** finaliser le développement mobile en autonomie. 7 routines `MR1` à `MR7` orchestrées via `RemoteTrigger` (env code.claude.ai), indépendantes des routines vidéo (R1-R4) du repo web.

---

## Vue d'ensemble du cycle

```
┌─────────────────────────────────────────────────────────────────┐
│  Lundi 05:00  MR1 Sprint Planner                                │
│      ↓                                                          │
│  Lit docs/sprints/backlog.md → fragmente → N issues GitHub      │
│  (label: mr2-ready, sprint-N, size-S/M/L)                       │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  Lun→Ven, 08:00 + 16:00  MR2 Auto-Implementer (2/jour)          │
│      ↓                                                          │
│  Prend 1 issue mr2-ready → branche → code → tsc/eslint/jest →   │
│  push → PR (label: auto-qa, from-mr2)                           │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼  (sur ouverture PR)
┌─────────────────────────┴───────────────────────────────────────┐
│  MR3 Visual QA            MR4 Code Review                       │
│  Expo Web + Playwright    git diff + skill security-review      │
│  → screenshots + checklist → audit HIGH/MED/LOW                 │
│  → commentaire ✅ ou ⚠️    → commentaire avec verdict           │
└─────────────────────────┬───────────────────────────────────────┘
                          │ (si MR3 ✅ + MR4 ✅)
                          ▼
                     Auto-merge (humain valide v1.0)
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  Vendredi 18:00  MR5 EAS Build Preview                          │
│      ↓                                                          │
│  eas build --profile preview iOS+Android → drop dans issue      │
│  (submit TestFlight/Play : MANUEL par toi)                      │
└─────────────────────────────────────────────────────────────────┘

         ▲                                    ▲
         │ (en parallèle, indépendant)        │
         │                                    │

┌─────────────────────────────────────────────────────────────────┐
│  Quotidien 07:00  MR6 Sentry Triage Mobile                      │
│      ↓                                                          │
│  gh issue list label sentry → plan AVANT fix → commentaire      │
│  (MR2 prendra ensuite si label mr2-ready ajouté manuellement)   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Dimanche 22:00  MR7 Web Sync Detector                          │
│      ↓                                                          │
│  diff fichiers partagés web↔mobile → cp + tsc → PR              │
│  (label: auto-qa OU sync-conflict si tsc fail)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Liste des routines

| # | Fichier | Schedule | Cap / Pacing | Output |
|---|---------|----------|--------------|--------|
| MR1 | [routine-mr1-sprint-planner.md](routine-mr1-sprint-planner.md) | Lun 05:00 | 5 issues max/run | Plan hebdo + issues GitHub |
| MR2 | [routine-mr2-auto-implementer.md](routine-mr2-auto-implementer.md) | Lun→Ven 08:00 + 16:00 | 1 PR/run, 5 PR ouvertes max | Branche + PR avec tests verts |
| MR3 | [routine-mr3-visual-qa.md](routine-mr3-visual-qa.md) | Sur PR `auto-qa` | — | Commentaire screenshots + checklist |
| MR4 | [routine-mr4-code-review.md](routine-mr4-code-review.md) | Sur ouverture PR | — | Commentaire HIGH/MED/LOW |
| MR5 | [routine-mr5-eas-build.md](routine-mr5-eas-build.md) | Ven 18:00 | 1 build/sem | Issue avec lien EAS preview |
| MR6 | [routine-mr6-sentry-triage.md](routine-mr6-sentry-triage.md) | Tous les jours 07:00 | 5 issues max/run | Commentaire plan AVANT fix |
| MR7 | [routine-mr7-web-sync.md](routine-mr7-web-sync.md) | Dim 22:00 | — | PR `chore: sync from web` si drift |

---

## Phasage de l'activation

L'activation respecte un ordre de risque croissant (validé dans le plan de session 03/05/2026) :

1. **Phase C — pilote** : `MR6` seule pendant 48h pour valider l'écosystème (zéro risque, juste des commentaires)
2. **Phase D.1** : `MR1` + `MR2` + `MR4` (chaîne plan→code→review)
3. **Phase D.2** : `MR3` (visual QA, Playwright headless)
4. **Phase D.3** : `MR5` (EAS Build) + `MR7` (web sync)
5. **Phase E — observation continue** : 1 sprint complet (Sprint 2 mobile) pour valider la boucle

---

## Garde-fous (anti-emballement)

- **Cap PR ouvertes** : MR2 skip si > 5 PR ouvertes (queue de review humaine)
- **Branch protection** : merge auto seulement si MR3 + MR4 ont commenté ✅ (auto-merge désactivé en v1.0, humain valide)
- **Cap budget EAS** : MR5 = 1 build/sem max, profil `preview`, jamais submit
- **MR6 ne fixe pas** : triage et plan, humain valide avant que MR2 prenne la main (label `mr2-ready` ajouté par humain)
- **MR2 plafond 3 essais** : si tsc/eslint/jest échouent 3× → label `mr2-blocked` + commentaire d'échec
- **Anti-troncature partout** : <150 lignes par Write, fragmenter sinon

---

## Pré-requis techniques

| Prérequis | Statut | Bloque |
|-----------|--------|--------|
| Workflow `sentry-to-github.yml` côté repo mobile | ❌ à créer Sprint 4 | MR6 (idempotente, OK en attendant) |
| Sentry projet mobile + DSN dans EAS env | ❌ à créer Sprint 4 (S4-T12) | MR6 (idempotente, OK) |
| Playwright dans l'env code.claude.ai | À vérifier | MR3 |
| EAS_TOKEN configuré | À fournir par utilisateur | MR5 |
| Repo web clonable depuis env code.claude.ai | À vérifier | MR7 |
| Branch protection `claude/main` | À configurer | toute la chaîne |

---

## Cycle vertueux — méta

> Chaque routine est lue par les autres :
> - MR1 lit `docs/sprints/backlog.md` (rédigé par toi en Phase 0)
> - MR2 lit le ticket dans `docs/sprints/sprint-N.md` (référencé dans l'issue créée par MR1)
> - MR4 charge le skill `apex-mobile-security-review` qui référence les 12 règles + délégation vers `apex-rgpd` (skill web)
> - MR7 référence `docs/AUDIT_PHASE_0.md` §1 pour la liste de fichiers partagés
>
> Le cycle est **auto-documenté** et **auto-correcteur** : un drift dans la doc est attrapé par MR6 (Sentry) ou MR7 (sync), corrigé par MR2, validé par MR3+MR4, déployé par MR5.

---

## Versioning

Chaque routine porte un numéro de version (`v1.0`, `v1.1`, ...) dans son frontmatter ET dans la signature de ses commentaires (ex: `[MR4 v1.0] Audit ...`). Pour upgrader une routine :

1. Modifier le fichier `routine-mr{N}-{nom}.md` + bumper la version
2. Tester sur un repo de staging si refonte majeure
3. Mettre à jour le RemoteTrigger côté code.claude.ai
4. Documenter le changement dans le frontmatter Historique
