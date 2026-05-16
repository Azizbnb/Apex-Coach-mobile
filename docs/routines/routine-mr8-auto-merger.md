# Claude Code Routine MR8 — Auto-Merger Mobile

> **Version :** 1.0.0 — 16/05/2026
> **Schedule :** `0 17 * * 1-5` — Lun→Ven 17:00 UTC (= 19:00 Paris CEST). 2h30 après la dernière passe MR4 (14:30 UTC) pour laisser le temps aux commentaires et à toute revue humaine partielle.
> **Routine name :** `apex-mobile-auto-merger`
> **Modèle :** `claude-opus-4-7[1m]` — les fix inline MED demandent du raisonnement précis sur du code TS/TSX.
> **Output :** PRs `feature/*` mergées automatiquement après application des fixes inline pour les MED de la review MR4. Aucune intervention humaine requise si la PR est saine.
> **Architecture :** Bash + git + gh + Read/Write/Edit (env code.claude.ai natif). Multi-fichiers fragmentés (chaque fix inline < 30 LOC ajoutées).
> **Précède :** rien — c'est le dernier maillon de la chaîne MR1 → MR2 → MR4 → MR8.

## Rôle dans le cycle

MR8 absorbe la review humaine que je faisais manuellement après chaque vague de PRs MR2 (sessions 2026-05-07 et 2026-05-16) : lecture du verdict MR4, fix inline des MED documentés par MR4, rebase, merge squash. Sans MR8, la chaîne se bloque dès que 5 PRs s'accumulent (cap MR2), même si chaque PR est correctement reviewée.

## Garde-fous (anti-emballement)

| Condition | Action |
|-----------|--------|
| HIGH > 0 dans le commentaire MR4 | Skip + label `human-review` + commentaire d'escalade |
| Diff PR > 500 LOC ajoutées | Skip + label `human-review` |
| Fix inline d'un MED > 30 LOC ajoutées | Skip ce MED, commenter sur la PR, label `human-review` |
| tsc/eslint/jest échoue après fix | Revert le fix, push, label `mr8-failed`, commenter |
| Conflit lors du rebase | Skip + label `merge-conflict` + commentaire |
| `mergeStateStatus` ≠ `CLEAN` | Skip cette PR |
| Plus de 5 PRs traitées dans un run | Skip les suivantes (cap) |

## Distinction avec MR4

- **MR4** lit, signale, ne touche pas au code.
- **MR8** lit le commentaire MR4, applique les fixes proposés, re-teste, merge.

MR8 ne re-fait jamais le travail de MR4 (pas de re-audit). Il dépend du verdict MR4 et fait confiance aux fix suggérés.

---

## ROUTINE PROMPT

```
Tu exécutes la routine MR8 Auto-Merger v1.0 pour Apex Coach Mobile.
Pour la date : run `date -u +%Y-%m-%dT%H:%M`.

OWNER = Azizbnb
REPO = Azizbnb/Apex-Coach-mobile
DEFAULT_BRANCH = claude/main

Mode strict :
- NE JAMAIS merger une PR avec HIGH > 0 dans la review MR4.
- NE JAMAIS appliquer un fix inline > 30 LOC ajoutées (escalade humaine).
- NE JAMAIS push --force sans --force-with-lease.
- NE JAMAIS skipper les vérifs mécaniques (tsc, eslint, jest).
- ALWAYS lire `.claude/skills/apex-mobile-dev/SKILL.md` AVANT tout fix inline (Patterns RN, NativeWind, dark mode, FR natif).
- ALWAYS rebaser sur `origin/claude/main` avant le merge.
- ALWAYS utiliser `gh pr merge --squash --delete-branch`.
- ALWAYS commenter en français natif idiomatique.

## STEP 0 — Setup

git fetch origin && git checkout claude/main && git pull --ff-only
gh auth status || (echo 'gh non authentifié' && exit 1)
npm ci

## STEP 1 — Lister les PRs éligibles

gh pr list --repo Azizbnb/Apex-Coach-mobile \
  --state open \
  --json number,title,headRefName,mergeable,mergeStateStatus,additions,labels \
  --limit 20 > /tmp/open_prs.json

Filtrer en local (jq) :
  - mergeable == "MERGEABLE"
  - mergeStateStatus == "CLEAN"
  - additions <= 500
  - PAS de label `dnm`, `human-review`, `mr8-failed`, `mr2-blocked`
  - PAS de label `auto-merged` (idempotence)
  - PRÉSENCE d'un commentaire MR4 (signature `[MR4 v1.`)

Si liste vide → output '✅ MR8 — aucune PR éligible.' et exit 0.

Cap : max 5 PRs traitées par run. Trier par ancienneté (createdAt asc).

## STEP 2 — Pour chaque PR éligible

### 2.1 Lire le dernier commentaire MR4

gh pr view ${PR_NUMBER} --repo Azizbnb/Apex-Coach-mobile \
  --json comments \
  --jq '[.comments[] | select(.body | startswith("## [MR4"))] | last | .body' > /tmp/mr4.md

### 2.2 Parser le verdict

Extraire :
- HIGH_COUNT : nombre dans la section `🔴 HIGH (N)`
- MED_COUNT : nombre dans la section `🟡 MED (N)`
- VERDICT : ligne commençant par `### Verdict`

Si HIGH_COUNT > 0 :
  gh pr comment ${PR_NUMBER} --body "🚨 [MR8 v1.0] Skip — ${HIGH_COUNT} HIGH non résolu. Review humaine requise."
  gh issue edit ... --add-label human-review  # via gh pr edit
  CONTINUE (PR suivante)

### 2.3 Si MED_COUNT > 0 → fix inline

Pour chaque MED :
  - Extraire fichier:ligne + bloc de code "Fix suggéré"
  - Lire le fichier cible (Read complet)
  - Appliquer le fix via Edit (old_string = code actuel, new_string = code suggéré)
  - Si le fix nécessite > 30 LOC ajoutées : SKIP ce MED + label `human-review` + commenter

### 2.4 Vérifs post-fix

git checkout origin/${HEAD_BRANCH}
# appliquer les fix sur la branche source
# (note : checkout par la branche, pas commit detaché, pour pouvoir push après)

git checkout -B ${HEAD_BRANCH} origin/${HEAD_BRANCH}

# Appliquer les fixes maintenant que la branche est checkout
# (les Edit ci-dessus auront été appliqués au workspace)

npx tsc --noEmit > /tmp/tsc.log 2>&1; TSC=$?
npx eslint . --ext .ts,.tsx > /tmp/eslint.log 2>&1; ESLINT=$?
npx jest --silent > /tmp/jest.log 2>&1; JEST=$?

Si TSC != 0 OU JEST != 0 :
  git checkout -- .  # revert le fix
  gh pr comment ${PR_NUMBER} --body "❌ [MR8 v1.0] Fix MED a cassé tsc/jest — revert + escalade humaine. Voir logs : tsc(${TSC}) jest(${JEST})."
  gh pr edit ${PR_NUMBER} --add-label mr8-failed
  CONTINUE

# Note : ESLINT warnings tolérés (cohérent avec MR4 v1.1)

### 2.5 Commit + push

Si des fixes ont été appliqués :
  git add <fichiers modifiés explicites>
  git commit -m "fix({ticket}): MR8 auto-fix MED de la review MR4

${LISTE_MED_RESOLUS}

🤖 Auto-fixé par MR8 v1.0"
  git push --force-with-lease origin ${HEAD_BRANCH}

### 2.6 Rebase + merge

git fetch origin
git rebase origin/claude/main
# Si conflit :
if [ $? -ne 0 ]; then
  git rebase --abort
  gh pr comment ${PR_NUMBER} --body "⚠️ [MR8 v1.0] Rebase sur claude/main a généré un conflit — résolution manuelle requise."
  gh pr edit ${PR_NUMBER} --add-label merge-conflict
  CONTINUE
fi
git push --force-with-lease

# Re-check mergeable post-rebase (latence GitHub)
sleep 5
MERGE_STATE=$(gh pr view ${PR_NUMBER} --json mergeStateStatus --jq .mergeStateStatus)
if [ "$MERGE_STATE" != "CLEAN" ]; then
  gh pr comment ${PR_NUMBER} --body "⚠️ [MR8 v1.0] mergeStateStatus=${MERGE_STATE} après rebase — skip ce run."
  CONTINUE
fi

gh pr merge ${PR_NUMBER} --squash --delete-branch

### 2.7 Récap par PR

Output local :
  🤖 MR8 — PR #${PR_NUMBER} ({TICKET})
  MED résolus : ${N}
  tsc/jest : ✅
  Merged : ✅

## STEP 3 — Récap final

Output :
  🤖 MR8 v1.0 — {DATE} {HOUR}
  PRs traitées : {count} / 5
  Merges réussis : {merges}
  Escalades human-review : {humans}
  Rebases échoués : {conflicts}
  Sortie : ✅

## CONTRAINTES DURES

- HIGH > 0 → JAMAIS merger.
- Fix > 30 LOC → JAMAIS appliquer (escalade).
- tsc/jest fail post-fix → ALWAYS revert + escalade.
- ALWAYS --force-with-lease (jamais --force pur).
- ALWAYS --squash --delete-branch au merge.
- Cap 5 PRs / run.
- Idempotence : skip toute PR labélisée `auto-merged` (label posé automatiquement après merge réussi — mais le `--delete-branch` rend la branche absente donc OK aussi par défaut).
- v1.0 : pas de re-audit. Confiance totale dans le verdict MR4. Si MR4 dit "Auto-merge OK", on merge même si MED.

## Note de version v1.0

Routine créée le 16/05/2026 pour résoudre le blocage observé en W19/W20 :
- W19 (PRs #7-#10) : merge bloqué 3 jours, débloqué manuellement le 07/05.
- W20 (PRs #24-#28) : merge bloqué 4 jours, débloqué manuellement le 16/05.

Sans MR8, la chaîne MR2 plafonne au cap 5 PRs et arrête de produire. Avec MR8, le flux est continu.
```
