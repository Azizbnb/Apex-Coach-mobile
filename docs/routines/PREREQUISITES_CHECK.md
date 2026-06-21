# Pré-requis routines MR3-MR7 — Matrice de vérification (Phase 0)

> **Date du check :** 2026-05-17
> **Environnement testé :** machine locale Aziz (Windows 11 / PowerShell + Git Bash, Node 20.20.0, gh 2.82.0)
> **Plan source :** [`ACTIVATION_PLAN_MR3-MR7.md`](ACTIVATION_PLAN_MR3-MR7.md) §"Phase 0"
> **Statut global :** ✅ **5/5 routines activables.** `EXPO_TOKEN` persisté dans `~/.bashrc` de l'env Cowork le 2026-05-17 via one-shot trigger `setup-expo-token-once` (puis nettoyé + à supprimer manuellement via UI).

> ⚠️ **Limite importante :** ce check a été effectué sur la machine locale d'Aziz. L'environnement réel d'exécution des routines est `code.claude.ai` (qui héberge déjà MR1, MR2, MR8). **Les résultats ci-dessous ne préjugent pas de la dispo des binaires côté code.claude.ai** — une re-vérification rapide (1 trigger test par routine) sera nécessaire avant chaque activation. Cf. §"Vérification résiduelle côté code.claude.ai".

---

## Matrice pré-requis × routine

Légende : ✅ OK, ⚠️ Action manuelle, ❌ Bloquant, — Non applicable

| Pré-requis | MR3 Visual QA | MR4 Code Review | MR5 EAS Build | MR6 Sentry Triage | MR7 Web Sync |
|---|---|---|---|---|---|
| **Node 20+** (`v20.20.0`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **npx** (`9.2.0`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **gh CLI auth** (`2.82.0`, account `Azizbnb`, scopes `gist, read:org, repo`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Skills `apex-mobile-*`** (chargés via YAML frontmatter du prompt) | ✅ | ✅ | — | ✅ | ✅ |
| **Playwright** (auto-install via `npx playwright`, v1.60.0) | ✅ | — | — | — | — |
| **Expo CLI Web** (`npx expo --version` = 55.0.16) | ✅ | — | — | — | — |
| **EAS CLI** (`npx eas-cli` = 18.13.0) | — | — | ✅ | — | — |
| **`EXPO_TOKEN` persisté côté Cowork** (dans `~/.bashrc` env `env_011CULFvjZDpUYFSdXFdGcm1`, validé par `npx eas-cli whoami` = aziiz.bnb le 2026-05-17) | — | — | ✅ | — | — |
| **Label `sentry`** sur repo mobile | — | — | — | ✅ | — |
| **Label `triaged-by-mr6`** | — | — | — | ✅ | — |
| **Label `auto-qa`** (MR3 le pose, MR7 le re-pose après sync) | ✅ | — | — | — | ✅ |
| **Label `weekly-build`** (MR5 le pose sur son issue de tracking) | — | — | ✅ | — | — |
| **Label `sync-conflict`** + `from-mr7` (MR7 fallback) | — | — | — | — | ✅ |
| **Repo web `Azizbnb/Apex-Coach` accessible** (visibility=PRIVATE, `git ls-remote HEAD` OK via gh auth) | — | — | — | — | ✅ |
| **Disque dispo** pour clone web (`201 GB` libre, repo web ≤ 500 MB) | — | — | — | — | ✅ |
| **Branch protection sur `claude/main`** (mobile) | ⚠️ | ⚠️ | — | — | — |

### Détail des résultats bruts

```
Node       : v20.20.0
npx        : 9.2.0
Playwright : 1.60.0 (via npx, auto-installé)
Expo       : 55.0.16
EAS CLI    : eas-cli/18.13.0 win32-x64 (via npx)
EAS auth   : KO (commande `eas` introuvable globalement, pas de EAS_TOKEN dans env)
gh         : 2.82.0, account Azizbnb (keyring), scopes: gist, read:org, repo
Web repo   : Azizbnb/Apex-Coach, default branch claude/main, visibility PRIVATE,
             git ls-remote HEAD → 8b22bd4 (OK)
Mobile labels présents : sentry, triaged-by-mr6, auto-qa, from-mr2, from-mr7,
                         weekly-build, sync-conflict, mr2-ready, mr2-blocked,
                         in-progress, sprint-2/3/4/5, size-S/M/L
Branch protection claude/main mobile : 404 "Branch not protected"
Issues ouvertes mobile : 0
PRs ouvertes mobile    : 0
```

---

## Statut d'activation par routine

### MR3 Visual QA — ✅ Activable
Tous les pré-requis techniques (Node, Playwright, Expo Web) sont OK localement. **À re-tester côté code.claude.ai** (cf. §"Vérification résiduelle") avant CronCreate.
**Note :** la routine tournera à vide tant qu'aucune PR avec label `auto-qa` n'est ouverte. C'est attendu — sortira 0 sans erreur.

### MR4 Code Review — ✅ Activable
Aucun pré-requis externe. Skills `apex-mobile-security-review` + `apex-mobile-dev` chargés via le prompt YAML.
**Note :** tournera à vide tant qu'aucune PR n'est ouverte. Attendu, sortie propre.

### MR5 EAS Build — ✅ Débloquée (2026-05-17)
- ✅ `npx eas-cli` fonctionne (18.13.0)
- ✅ `EXPO_TOKEN` créé sur expo.dev, persisté dans `~/.bashrc` de l'env Cowork via one-shot trigger `setup-expo-token-once` (compte Expo `aziiz.bnb`)
- ✅ `eas.json` profile `preview` valide
- ✅ Toute routine future tournant dans `env_011CULFvjZDpUYFSdXFdGcm1` héritera de `EXPO_TOKEN` automatiquement (pas besoin de l'inclure dans le prompt MR5)
**Note technique :** la variable correcte est `EXPO_TOKEN` (pas `EAS_TOKEN` comme indiqué initialement dans le plan — l'EAS CLI lit `EXPO_TOKEN`).
**Action restante :** supprimer le trigger `setup-expo-token-once` (id `trig_014ELE4zhSYGYgKgNPCL4tZF`) via UI claude.ai → Routines → Delete. Config déjà nettoyée mais autant le retirer.

### MR6 Sentry Triage — ✅ Activable
- ✅ `gh` OK
- ✅ Label `sentry` existant (couleur `#C2E0C6`)
- ✅ Label `triaged-by-mr6` existant (couleur `#B60205`)
**Note :** 0 issue avec label `sentry` actuellement → MR6 sortira "✅ Aucune issue Sentry à triager" au premier run. C'est attendu (Sentry mobile sera wiré en S4-T12).
**Recommandation Phase 1 :** créer une issue dummy `[P3] Test MR6 — TypeError sur écran inexistant` avec label `sentry` pour valider le format du commentaire, puis la fermer après validation.

### MR7 Web Sync — ✅ Activable
- ✅ Repo web `Azizbnb/Apex-Coach` (PRIVATE) accessible via `git ls-remote` avec token gh actuel (scope `repo` confirmé)
- ✅ Espace disque OK (201 GB libre)
- ✅ Labels `auto-qa`, `from-mr7`, `sync-conflict` existants
**Note :** la routine fait un `git clone` du web à chaque run. Coût réseau négligeable. **Variable `WEB_REPO_TOKEN` non nécessaire** si l'env `code.claude.ai` a déjà un token gh avec scope `repo` sur l'org/user `Azizbnb`. À confirmer en Phase 4.2.

---

## Branch protection sur `claude/main` (mobile) — ⚠️ Recommandée

**Statut actuel :** non configurée (HTTP 404 "Branch not protected").

**Impact :** MR8 (auto-merger déjà actif) peut merger sans review humaine. En phase pilote MR3/MR4 c'est tolérable (MR8 a son propre cap interne de 5 PR/run + skip si pas de verdict MR4 ✅). Avant ouverture publique du repo ou production, à activer :

```bash
gh api -X PUT repos/Azizbnb/Apex-Coach-mobile/branches/claude/main/protection \
  -F required_status_checks=null \
  -F enforce_admins=false \
  -F 'required_pull_request_reviews[required_approving_review_count]=0' \
  -F restrictions=null
# Variante stricte : exiger 1 approval (humain ou bot)
```

**Décision en Phase 0 :** ne PAS bloquer l'activation MR3/MR4. Documenter et revoir avant Phase 5 (observation continue).

---

## Vérification résiduelle côté code.claude.ai

Avant chaque CronCreate, exécuter un **trigger one-shot test** (sans schedule récurrent) avec le prompt suivant adapté à chaque routine, pour confirmer que les binaires sont dispo côté code.claude.ai :

```
# Test MR3 (avant CronCreate Phase 3)
node --version && npx playwright --version && npx expo --version
# Attendu : 3 lignes versions, pas d'erreur

# Test MR4 (avant CronCreate Phase 2)
gh pr list --repo Azizbnb/Apex-Coach-mobile --state open --limit 5
# Attendu : 0 lignes (pas de PR ouverte) ou liste

# Test MR5 (après EAS_TOKEN configuré, avant Phase 4.1)
npx eas-cli whoami
# Attendu : login Expo

# Test MR6 (avant CronCreate Phase 1)
gh issue list --repo Azizbnb/Apex-Coach-mobile --label sentry --state open
# Attendu : liste ou vide

# Test MR7 (avant CronCreate Phase 4.2)
git clone --depth 1 https://github.com/Azizbnb/Apex-Coach.git /tmp/web-test && \
ls /tmp/web-test/types/index.ts && rm -rf /tmp/web-test
# Attendu : clone OK + fichier accessible
```

Si l'un de ces tests échoue côté code.claude.ai, escalader avant CronCreate.

---

## Décision phasage suite à Phase 0

Ordre de Phase recommandé **inchangé** par rapport au plan :

| Phase | Routine | Statut pré-requis | Décision |
|---|---|---|---|
| Phase 1 | MR6 | ✅ | **Activer** dès validation Phase 0 par Aziz |
| Phase 2 | MR4 | ✅ | **Activer** après 48h observation MR6 |
| Phase 3 | MR3 | ✅ (à re-tester code.claude.ai) | **Activer** après 1 semaine MR4 |
| Phase 4.1 | MR5 | ✅ `EXPO_TOKEN` persisté (2026-05-17) | **Activable** — débloquée |
| Phase 4.2 | MR7 | ✅ | **Activer** indépendamment de MR5 |
| Phase 5 | observation | — | Démarre après les 4 actives (sans MR5 si token toujours absent) |

---

## Actions immédiates pour Aziz

1. ~~Confirmer la matrice~~ ✅ Fait 2026-05-17.
2. ~~Configurer `EXPO_TOKEN` côté Cowork~~ ✅ Fait 2026-05-17 via one-shot `setup-expo-token-once`.
3. **Supprimer le trigger `setup-expo-token-once`** via UI claude.ai (`Routines → ⋯ → Delete`).
4. **Décider sur branch protection `claude/main` mobile** : laisser ouvert pendant pilote (recommandé), activer avant Phase 5.
5. **Donner go pour Phase 1 (MR6 Sentry Triage)** → enregistrement CronCreate.
