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
┌─────────────────────────────────────────────────────────────────┐
│  Lun→Ven 17:00 UTC  MR8 Auto-Merger                             │
│      ↓                                                          │
│  Lit verdict MR4 → fix inline les MED → rebase → squash merge   │
│  (HIGH = escalade humaine ; cap 5 PR/run)                       │
└─────────────────────────────────────────────────────────────────┘
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
| MR8 | [routine-mr8-auto-merger.md](routine-mr8-auto-merger.md) | Lun→Ven 17:00 UTC | 5 PR max/run | Fix MED inline + squash merge des PRs reviewées par MR4 |

---

## Phasage de l'activation

**État actuel (17/05/2026) :** 6 routines actives (`MR1`, `MR2`, `MR4`, `MR5`, `MR6`, `MR8`). Activation des 2 restantes (`MR3` Visual QA, `MR7` Web Sync) à planifier suivant [`ACTIVATION_PLAN_MR3-MR7.md`](ACTIVATION_PLAN_MR3-MR7.md) (Phases 0, 1, 2, 4.1 validées).

Ordre d'activation (risque croissant) :

1. **Phase 0** : vérification pré-requis — ✅ **Effectuée 2026-05-17** ([`PREREQUISITES_CHECK.md`](PREREQUISITES_CHECK.md)). 5/5 routines activables (`EXPO_TOKEN` persisté côté Cowork).
2. **Phase 1 — pilote** : `MR6` Sentry Triage seule, 48h observation (zéro risque, écrit seulement des commentaires)
3. **Phase 2** : `MR4` Code Review (review-only, sur PRs ouvertes)
4. **Phase 3** : `MR3` Visual QA (Playwright + Expo Web)
5. **Phase 4.1** : `MR5` EAS Build hebdo (vendredi)
6. **Phase 4.2** : `MR7` Web Sync hebdo (dimanche)
7. **Phase 5 — observation continue** : 1 sprint complet (Sprint 2 reprise) pour valider la boucle complète

> Voir `ACTIVATION_PLAN_MR3-MR7.md` pour le détail de chaque phase + critères de réussite + rollback.

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

> ✅ **Phase 0 du plan d'activation effectuée le 2026-05-17** sur machine locale Aziz — résultats détaillés dans [`PREREQUISITES_CHECK.md`](PREREQUISITES_CHECK.md). Re-vérification résiduelle côté `code.claude.ai` requise avant chaque CronCreate (cf. §"Vérification résiduelle" du fichier).

| Prérequis | Statut local 2026-05-17 | Bloque |
|-----------|-------------------------|--------|
| Node 20+ / npx / gh CLI authentifié | ✅ Node 20.20.0, gh 2.82.0 scopes `repo, gist, read:org` | — |
| Playwright (`npx playwright`) | ✅ v1.60.0 auto-install | MR3 |
| Expo CLI Web (`npx expo --version`) | ✅ 55.0.16 | MR3 |
| EAS CLI (`npx eas-cli`) | ✅ 18.13.0 via npx | MR5 |
| **`EXPO_TOKEN`** persisté dans `~/.bashrc` env Cowork | ✅ Fait 2026-05-17 (compte Expo `aziiz.bnb`) | MR5 |
| Labels `sentry`, `triaged-by-mr6`, `auto-qa`, `weekly-build`, `sync-conflict`, `from-mr7` | ✅ Tous présents sur repo mobile | MR3/MR4/MR5/MR6/MR7 |
| Repo web `Azizbnb/Apex-Coach` (PRIVATE) accessible | ✅ `git ls-remote HEAD` OK via token gh actuel | MR7 |
| Branch protection `claude/main` mobile | ⚠️ Non configurée (HTTP 404) | non-bloquant pilote, à activer avant Phase 5 |
| Workflow `sentry-to-github.yml` côté repo mobile | ❌ à créer Sprint 4 | MR6 (idempotente, OK en attendant) |
| Sentry projet mobile + DSN dans EAS env | ❌ à créer Sprint 4 (S4-T12) | MR6 (idempotente, OK) |

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
