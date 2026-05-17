# Plan — Activation routines MR3-MR7 via RemoteTrigger code.claude.ai

## Contexte

L'écosystème mobile Apex Coach utilise une chaîne de 8 routines (`MR1`→`MR8`) documentées dans `docs/routines/`. **3 routines sont actives** côté `code.claude.ai` (MR1 Sprint Planner, MR2 Auto-Implementer, MR8 Auto-Merger) — la chaîne plan → code → merge fonctionne en autonomie depuis 04/05/2026.

Les **5 routines manquantes** (MR3 Visual QA, MR4 Code Review, MR5 EAS Build, MR6 Sentry Triage, MR7 Web Sync) sont documentées avec leur prompt complet mais n'ont **pas encore été enregistrées** comme triggers récurrents. Sans elles :
- Les PRs MR2 sont mergées par MR8 sans audit sécurité/qualité (MR8 lit le commentaire MR4 → si MR4 absent, MR8 skip ou merge sans verdict)
- Aucune capture visuelle automatique des écrans nouveaux/modifiés
- Aucun build EAS hebdomadaire pour test physique
- Aucun triage automatique des issues Sentry mobile
- Drift silencieux possible entre fichiers partagés web ↔ mobile

**Décisions de cadrage validées avec Aziz :**
- **Trigger mechanism** : RemoteTrigger côté `code.claude.ai` (cohérent avec MR1/MR2/MR8 actuelles), pas GitHub Actions.
- **Scope de la session actuelle** : **plan détaillé uniquement**, **pas d'activation effective**. L'enregistrement effectif des triggers (CronCreate / RemoteTrigger) se fera dans une session dédiée après ton OK sur le plan.
- **Pré-requis externes** : aucun n'est confirmé à date — le plan doit inclure une phase explicite de vérification avant chaque activation.

---

## Architecture cible

Chaque routine MR{N} devient un trigger côté `code.claude.ai` avec :
- **Cron schedule** UTC (ex : `0 6 * * 1-5` = lundi-vendredi 06:00 UTC)
- **Prompt** = bloc `ROUTINE PROMPT` du fichier `docs/routines/routine-mr{N}-*.md` (déjà rédigé, prêt à coller)
- **Trigger ID** retourné par RemoteTrigger (à archiver dans le frontmatter du fichier routine, comme MR2 le fait déjà : `trig_01Te1wdd1Dvic766TAiqGgDz`)
- **Modèle Claude** : `claude-opus-4-7[1m]` pour MR4 + MR8 (raisonnement TS/TSX), `claude-sonnet-4-6` pour les autres (read-mostly).

### Spécificité event-driven (MR3, MR4)

MR3 et MR4 sont conceptuellement "event-driven" (sur ouverture de PR avec label `auto-qa`), mais RemoteTrigger ne supporte que le cron. **Adaptation** : ces 2 routines scannent les PRs ouvertes au moment du run, ignorent celles déjà commentées (signature `[MR3 v1.0]` / `[MR4 v1.0]` dans le commentaire), et traitent uniquement les nouvelles.

| Routine | Schedule UTC | Schedule Paris | Rationale |
|---------|-------------|----------------|-----------|
| MR3 | `0 7,15 * * 1-5` | 09:00 + 17:00 | 1h après chaque MR2, après ouverture PRs |
| MR4 | `30 6,14 * * 1-5` | 08:30 + 16:30 | 30 min après chaque MR2 (déjà spécifié dans la routine doc) |
| MR5 | `0 17 * * 5` | 19:00 vendredi | Hebdo, après semaine de merges |
| MR6 | `0 6 * * *` | 08:00 quotidien | Avant la 1ère passe MR2 du jour |
| MR7 | `0 21 * * 0` | 23:00 dimanche | Veille de lundi MR1 |

---

## Phases d'activation (ordre de risque croissant)

### Phase 0 — Vérification pré-requis (read-only, 1h)

**Objectif :** confirmer que l'environnement `code.claude.ai` peut exécuter chaque routine avant de l'enregistrer.

Commandes à exécuter (read-only, ne modifient rien) :

```bash
# 0.1 — Pré-requis MR3 (Playwright + Expo Web)
which npx && npx --version           # Node disponible
which playwright || npm i -D playwright  # juste --version, pas install global
# Vérifier que `npx expo start --web --port 8081` démarre dans l'env

# 0.2 — Pré-requis MR5 (EAS CLI + token)
which eas && eas --version
eas whoami 2>&1 | head -3            # Si "Not logged in" → EAS_TOKEN manquant

# 0.3 — Pré-requis MR6 (gh + label sentry existant)
gh label list --repo Azizbnb/Apex-Coach-mobile --search sentry

# 0.4 — Pré-requis MR7 (repo web clonable)
gh repo view Azizbnb/Apex-Coach --json visibility,defaultBranchRef
git ls-remote https://github.com/Azizbnb/Apex-Coach.git HEAD

# 0.5 — Branch protection
gh api repos/Azizbnb/Apex-Coach-mobile/branches/claude/main/protection 2>&1 | head
```

**Sortie attendue :** matrice `pré-requis × routine` avec statut OK / KO / action manuelle requise. Documentée dans `docs/routines/PREREQUISITES_CHECK.md` (nouveau fichier) ou dans une issue GitHub `[OPS] Pré-requis routines MR3-MR7`.

**Si un pré-requis bloque une routine** :
- EAS_TOKEN manquant → bloque MR5 (skipper Phase 4.1, reprendre quand token configuré)
- Repo web non clonable → bloque MR7 (skipper Phase 4.2)
- Pas de branch protection → activable quand même mais MR8 ne pourra pas appliquer la règle "merge auto seulement si MR3+MR4 ✅"
- Playwright non dispo → MR3 doit installer en début de run (lent) ou fallback "pas d'impact UI détecté"

### Phase 1 — Pilote MR6 (faible risque, 48h observation)

**Pourquoi en premier :** MR6 ne modifie aucun fichier, ne touche pas le code, écrit uniquement des **commentaires** sur des issues GitHub. Si elle hallucine, l'impact est cosmétique (commentaire incorrect à corriger manuellement).

**Pré-requis durs :**
- `gh` authentifié dans l'env ✓ (déjà OK pour MR1/MR2)
- Au moins 1 issue GitHub avec label `sentry` existante (sinon, MR6 sort 0 = pas d'erreur, juste pas de travail)

**Activation :**
1. Vérifier qu'au moins 1 label `sentry` existe : `gh label list --repo Azizbnb/Apex-Coach-mobile --search sentry` (sinon créer manuellement : `gh label create sentry --color FF0000`)
2. Si zéro issue Sentry : créer une issue dummy `[P3] Test MR6` pour valider que la routine la commente bien
3. CronCreate / RemoteTrigger avec :
   - Prompt = bloc `ROUTINE PROMPT` de `docs/routines/routine-mr6-sentry-triage.md`
   - Schedule : `0 6 * * *` (quotidien 08:00 Paris)
   - Model : `claude-sonnet-4-6`
   - Allowed permissions : Bash (gh), Read, Edit (rarement), Grep
4. Observation 48h : 2 runs (J+1, J+2), valider les commentaires postés
5. Si OK → archiver `trigger_id` dans le frontmatter de `routine-mr6-sentry-triage.md`

**Critère de réussite :** au moins 1 commentaire MR6 posté sur une issue Sentry, avec sections H1/H2 (hypothèses), fichiers candidats grep, et signature `[MR6 v1.0]`. Aucune issue corrompue / aucun faux positif sur le code.

### Phase 2 — MR4 Code Review (review-only, sur PRs ouvertes)

**Pourquoi en deuxième :** MR4 ne modifie pas le code, écrit uniquement des commentaires HIGH/MED/LOW sur les PRs. Risque limité au mauvais verdict (MR8 lit ce verdict pour décider du merge — un verdict raté peut faire merger une PR fautive).

**Pré-requis durs :**
- Skills `apex-mobile-security-review` + `apex-mobile-dev` accessibles dans l'env ✓ (chargés par RemoteTrigger via le bloc YAML frontmatter du prompt)
- Au moins 1 PR ouverte pour tester (sinon MR4 sort 0)

**Activation :**
1. Vérifier les permissions Bash + Read + Grep dans l'env
2. CronCreate avec :
   - Prompt = bloc `ROUTINE PROMPT` de `docs/routines/routine-mr4-code-review.md`
   - Schedule : `30 6,14 * * 1-5` (lun-ven 08:30 + 16:30 Paris)
   - Model : `claude-opus-4-7[1m]` (raisonnement TS/TSX)
3. Observation : 1 semaine (10 runs). Lire chaque commentaire MR4 manuellement pour valider :
   - Findings HIGH justifiés (pas de faux positif type "Netflix violation" sur du texte légitime)
   - Findings MED actionnables (MR8 doit pouvoir les fixer inline)
   - Format respecté (sections HIGH / MED / LOW + verdict merge)
4. **Réajustement MR8** : tant que MR4 n'est pas activée, MR8 doit skipper le merge auto. Vérifier qu'MR8 v1.0 a bien la garde-fou `"Si pas de commentaire [MR4 v1.0] → label human-review + skip"` (déjà documenté).
5. Archiver `trigger_id` dans le frontmatter de `routine-mr4-code-review.md`

**Critère de réussite :** 5 PR consécutives reviewées sans faux positif HIGH. Verdict cohérent avec ce qu'un humain produirait.

### Phase 3 — MR3 Visual QA (capture + checklist design, sur PRs `auto-qa`)

**Pourquoi en troisième :** plus complexe techniquement (Expo Web + Playwright headless). Si Playwright n'est pas dispo dans l'env code.claude.ai, fallback "Pas d'impact UI détecté" mais on perd l'utilité.

**Pré-requis durs :**
- `npx playwright` exécutable dans l'env (à vérifier en Phase 0)
- `npx expo start --web` démarrable (port 8081 dispo, build Expo Web fonctionnel)
- Test manuel : démarrer Expo Web sur la branche actuelle + screenshot d'1 route via Playwright avant de wirer la routine

**Activation :**
1. Test manuel hors trigger : exécuter le bloc ROUTINE PROMPT MR3 sur une PR ouverte test → vérifier que les screenshots sont générés
2. Si Playwright OK : CronCreate
   - Prompt = bloc `ROUTINE PROMPT` de `docs/routines/routine-mr3-visual-qa.md`
   - Schedule : `0 7,15 * * 1-5` (lun-ven 09:00 + 17:00 Paris, 1h après MR2)
   - Model : `claude-sonnet-4-6`
3. Si Playwright KO : skipper Phase 3, créer issue GitHub `[OPS] Installer Playwright dans env code.claude.ai`. MR3 sera activée plus tard.
4. Observation : 1 semaine. Vérifier que les commentaires MR3 incluent au moins 1 screenshot 375×812 par écran touché.
5. Archiver `trigger_id`

**Critère de réussite :** 3 PRs `auto-qa` consécutives avec commentaire MR3 contenant screenshots ET checklist design (couleurs, fonts, dark mode).

### Phase 4 — Routines opérationnelles (MR5 EAS Build, MR7 Web Sync)

#### Phase 4.1 — MR5 EAS Build hebdo

**Pré-requis durs :**
- `EAS_TOKEN` dans l'env code.claude.ai (à demander à Aziz si absent — Expo dashboard → Account settings → Access tokens)
- `eas.json` profile `preview` configuré ✓ (vérifié dans Sprint 1)
- `eas whoami` retourne le user Expo

**Activation :**
1. Si `EAS_TOKEN` absent → demander à Aziz de le configurer côté code.claude.ai. **Bloquant.**
2. Test manuel hors trigger : `eas build --profile preview --platform ios --non-interactive` sur la branche actuelle → vérifier que le build démarre + drop l'URL artifact
3. CronCreate
   - Prompt = bloc `ROUTINE PROMPT` de `docs/routines/routine-mr5-eas-build.md`
   - Schedule : `0 17 * * 5` (vendredi 19:00 Paris)
   - Model : `claude-sonnet-4-6`
   - Permissions Bash élargies pour `eas` CLI
4. Observation : 1 build hebdo. Vérifier qu'une issue `weekly-build` est créée avec les liens iOS + Android et le SHA du commit.
5. Archiver `trigger_id`

**Critère de réussite :** 1 build EAS preview iOS + Android par semaine, sans dépasser le quota Free Tier (30 builds/mois). Lien artifact accessible.

#### Phase 4.2 — MR7 Web Sync hebdo

**Pré-requis durs :**
- Repo `Azizbnb/Apex-Coach` (web) clonable depuis l'env code.claude.ai (le repo est public mais l'env doit avoir le réseau + assez d'espace disque pour 2 repos côte à côte)
- Token GitHub avec accès au repo web pour `git clone` (si privé) → `WEB_REPO_TOKEN` mentionné dans le brief REFONTE
- Liste des fichiers partagés à jour dans `routine-mr7-web-sync.md` (déjà documentée, à vérifier au regard de `docs/AUDIT_PHASE_0.md`)

**Activation :**
1. Test manuel : `git clone https://github.com/Azizbnb/Apex-Coach.git /tmp/web-test` → vérifier que ça passe. Si privé, configurer `WEB_REPO_TOKEN`.
2. Test diff dry-run : exécuter Step 1 et Step 2 du prompt MR7 manuellement → identifier les drifts actuels (si oui, première PR `chore: sync from web` manuelle avant d'automatiser)
3. CronCreate
   - Prompt = bloc `ROUTINE PROMPT` de `docs/routines/routine-mr7-web-sync.md`
   - Schedule : `0 21 * * 0` (dimanche 23:00 Paris, veille de MR1)
   - Model : `claude-sonnet-4-6`
4. Observation : 2 semaines (2 runs). Si une PR `chore: sync from web` est créée, l'auditer manuellement avant merge la 1ʳᵉ fois.
5. Archiver `trigger_id`

**Critère de réussite :** drift détecté = PR créée avec label `auto-qa` (ou `sync-conflict` si tsc échoue), TypeScript reste vert après le sync.

### Phase 5 — Observation continue (1 sprint complet)

Une fois les 5 routines activées, observer le cycle complet sur **1 sprint mobile** (Sprint 2 reprise après les 9 todos restants : `S2-T13`, `T14`, `T19-T25`). Critères :

- Pas d'emballement (PRs ouvertes ≤ 5, MR2 cap respecté)
- Pas de boucle (MR4 commente, MR8 fix les MED, re-MR4 ne re-fixe pas les mêmes)
- Pas de drift silencieux (MR7 attrape les sync manqués)
- Pas de bug régressé (MR6 triage les nouvelles issues Sentry sans en rater)
- Budget EAS respecté (MR5 = 1 build/semaine max)

Si un sprint complet passe sans incident → l'écosystème est stable. Documenter le retour d'expérience dans `docs/routines/POSTMORTEM_ACTIVATION.md`.

---

## Fichiers à modifier

| Fichier | Action | Phase |
|---------|--------|-------|
| `docs/routines/PREREQUISITES_CHECK.md` | **Créer** : matrice pré-requis × routine | Phase 0 |
| `docs/routines/routine-mr6-sentry-triage.md` | Frontmatter : ajouter `trigger_id: trig_...` | Phase 1 |
| `docs/routines/routine-mr4-code-review.md` | Frontmatter : ajouter `trigger_id` | Phase 2 |
| `docs/routines/routine-mr3-visual-qa.md` | Frontmatter : ajouter `trigger_id` | Phase 3 |
| `docs/routines/routine-mr5-eas-build.md` | Frontmatter : ajouter `trigger_id` | Phase 4.1 |
| `docs/routines/routine-mr7-web-sync.md` | Frontmatter : ajouter `trigger_id` | Phase 4.2 |
| `docs/routines/README.md` | §"Pré-requis techniques" : marquer ✓ / ✗ après Phase 0, MAJ §"Phasage de l'activation" pour refléter le nouveau ordre | À chaque phase |
| `CLAUDE.md` | §11.bis bumper la liste de routines actives (MR1, MR2, MR4, MR6, MR8 → MR1-MR8) | À la fin |
| `docs/routines/POSTMORTEM_ACTIVATION.md` | **Créer** : retour d'expérience après Phase 5 | Phase 5 |

**Aucun code applicatif touché. Aucune migration. Aucun changement au backlog Sprint 2-5.**

---

## Garde-fous & rollback

**Anti-emballement (par routine) :**
- MR3 : cap 5 PRs / run (déjà dans la routine doc)
- MR4 : cap 10 PRs / run
- MR5 : 1 build / plateforme / semaine + skip si pas de PR mergée depuis lundi
- MR6 : cap 5 issues / run
- MR7 : skip si conflit tsc → label `sync-conflict` (humain valide)

**Rollback d'une routine :**
- `CronDelete trigger_id` → la routine cesse de se déclencher
- Le code/PR déjà créés par la routine ne sont pas affectés (PR ouverte reste ouverte)
- Re-activation : nouveau CronCreate avec le même prompt

**Rollback global :**
- Si emballement détecté → désactiver MR2 d'abord (source des PRs), puis MR3/MR4 (review), puis MR8 (merger)
- MR5/MR6/MR7 peuvent rester actives (faible risque)

---

## Vérification end-to-end

À la fin de **chaque phase** :

1. **Phase 0** : matrice pré-requis remplie, statut OK/KO pour chaque routine, action manuelle listée pour les KO.
2. **Phase 1 (MR6)** : `gh issue list --label triaged-by-mr6` retourne ≥1 issue, contenu du commentaire = format documenté.
3. **Phase 2 (MR4)** : `gh pr list --comments-author copilot OR app-bot` (selon comment l'env signe) retourne ≥5 PRs commentées, format HIGH/MED/LOW respecté.
4. **Phase 3 (MR3)** : screenshot accessible dans les commentaires MR3, checklist design valide.
5. **Phase 4.1 (MR5)** : `gh issue list --label weekly-build` retourne ≥1 issue avec URLs EAS iOS+Android.
6. **Phase 4.2 (MR7)** : `gh pr list --search "chore: sync from web"` retourne ≥1 PR (ou ≥1 commentaire "Aucun drift" dans une issue ops).
7. **Phase 5** : 1 sprint complet sans incident, écosystème stable.

À la **fin du plan complet** :

- 5 routines actives côté code.claude.ai (vérification : `CronList` retourne 8 entries — MR1, MR2, MR3, MR4, MR5, MR6, MR7, MR8)
- Cycle vertueux fonctionnel : `MR1 → MR2 → MR3 + MR4 → MR8 → (option) MR5 préview`, avec MR6 et MR7 en parallèle
- 0 PR mergée par MR8 sans verdict MR3+MR4 ✅
- 0 emballement (PRs ouvertes ≤ 5)

---

## Risques & points d'attention

1. **RemoteTrigger ne supporte pas les events GitHub natifs** (PR opened). MR3/MR4 sont donc forcés en cron, avec un délai max de 1h entre l'ouverture d'une PR et son audit. Acceptable.

2. **Pré-requis EAS_TOKEN** : si pas disponible côté code.claude.ai, MR5 reste inactive. Workaround : MR5 manuelle (toi qui lance `eas build` chaque vendredi). Pas bloquant pour l'écosystème global.

3. **Pré-requis Playwright** : si manquant, MR3 dégrade en "pas d'impact UI détecté". On perd la valeur ajoutée mais MR4 + revue humaine restent suffisants pour merger une PR.

4. **Drift docs/routines/README.md vs réalité** : à chaque activation, le README doit refléter l'état (déjà partiellement obsolète : MR8 est active mais le phasage README ne le mentionne pas). À synchroniser à chaque phase.

5. **Coûts API Anthropic** : 5 nouvelles routines ajoutent des appels Claude. Estimation : MR3+MR4 = ~2 runs × 5 jours × 2 = 20 runs/sem (chacun ~30k tokens entrée + 5k sortie sur Opus). Budget à valider avant Phase 2.

6. **Branch protection `claude/main`** : si pas configurée, MR8 peut merger sans review humaine (cap interne MR8 = 5 PR/run). Pas critique en phase pilote mais à activer avant production.

7. **MR6 dépend de Sentry mobile (Sprint 4 S4-T12)** : MR6 peut tourner à vide tant que Sentry mobile n'est pas wiré. Activer quand même en Phase 1 — MR6 retournera "✅ Aucune issue Sentry à triager" et c'est OK.
