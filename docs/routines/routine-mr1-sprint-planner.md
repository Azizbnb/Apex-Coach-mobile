# Claude Code Routine MR1 — Sprint Planner Mobile

> **Version :** 1.0.0 — 04/05/2026
> **Schedule :** lundi 05:00 (Europe/Paris) — `0 5 * * 1`
> **Routine name :** `apex-mobile-sprint-planner`
> **Output :** `docs/sprints/{YEAR}-W{WEEK}/_plan.md` (PR dédié) + N issues GitHub fragmentées (1 issue = 1 ticket = 1 PR < 300 LOC).
> **Architecture :** Bash + `gh` + parsing Markdown. Lit `docs/sprints/backlog.md` + `docs/sprints/sprint-{N}.md`. Multi-fichiers fragmentés (1 fichier `_plan.md` + 1 `gh issue create` par ticket).
> **Alimente :** MR2 Auto-Implementer (qui prend ces issues une par une).

---

## ROUTINE PROMPT

```
Tu exécutes la routine MR1 Sprint Planner v1.0 pour Apex Coach Mobile.
Aujourd'hui : {CURRENT_DATE}, semaine ISO {YEAR}-W{WEEK}.

Mode strict :
- NE JAMAIS modifier les fichiers `docs/sprints/sprint-{N}.md` (source de vérité, lue seulement).
- NE JAMAIS créer plus de 5 issues par run (cap anti-emballement).
- NE JAMAIS prendre un ticket dont les dépendances ne sont pas mergées.
- TOUJOURS suivre l'ordre du backlog : P bloqueurs → verticalité → high risk → 1 seul L en parallèle.
- TOUJOURS poster en français natif.

---

## STEP 0 — Setup

cd /repos/apex-coach-mobile
git fetch origin && git checkout claude/main && git pull --ff-only
gh auth status || exit 1

---

## STEP 1 — Identifier le sprint actif

Lire `docs/sprints/backlog.md` et trouver le sprint où le statut n'est pas "Terminé" et qui a le plus petit numéro.
- Si Sprint 2 a au moins 1 ticket "todo" → sprint actif = 2
- Sinon Sprint 3, etc.

---

## STEP 2 — Lister les tickets éligibles du sprint actif

Lire `docs/sprints/sprint-{N}.md` et extraire la liste des tickets avec :
- Statut = `todo`
- Toutes les dépendances ont statut `done` (ou `aucune`)

Trier par règles (cf. backlog.md §"Règles de priorité") :
1. Bloqueurs (dont dépendent d'autres tickets) en premier
2. Verticalité (terminer un flow complet)
3. High risk décroissant
4. Pas plus d'1 ticket `L` en parallèle

Limiter à 5 tickets pour ce run.

Si liste vide → output "✅ Aucun ticket éligible cette semaine. Sprint en attente." et sortir 0.

---

## STEP 3 — Vérifier l'état des PR ouvertes

gh pr list --repo {OWNER}/apex-coach-mobile --state open --json number,title,labels --limit 20 > /tmp/open_prs.json

Si > 5 PR ouvertes (cap MR2) → output "⚠️ Trop de PR ouvertes ({count}) — MR1 attend que la queue se vide." et sortir 0.

---

## STEP 4 — Créer le plan hebdomadaire fragmenté

mkdir -p docs/sprints/{YEAR}-W{WEEK}
écrire `docs/sprints/{YEAR}-W{WEEK}/_plan.md` :

```markdown
# Plan Sprint {N} — Semaine {YEAR}-W{WEEK}

> Généré par MR1 v1.0 le {DATE}.
> Sprint actif : {N}. Tickets éligibles : {count}.

## Tickets planifiés cette semaine

| ID | Titre | Estimation | Dépendances | Issue GitHub |
|----|-------|-----------|-------------|--------------|
| S{n}-T{nn} | ... | S/M/L | ... | #{number} |
...

## Tickets en attente (dépendances non mergées)

| ID | Bloqué par |
|----|-----------|
...

## Récap

- Tickets nouveaux (issues créées) : {N}
- Tickets reportés : {M}
- Estimation totale : {S+M+L count}
```

---

## STEP 5 — Créer les issues GitHub (1 par ticket)

Pour chaque ticket éligible :

gh issue create \
  --repo {OWNER}/apex-coach-mobile \
  --title "[S{n}-T{nn}] {titre}" \
  --label "sprint-{n},mr2-ready,size-{S|M|L}" \
  --body-file - <<EOF
## Ticket source
\`docs/sprints/sprint-{n}.md#s{n}-t{nn}\`

## Critères d'acceptance

(copie depuis sprint-{n}.md)

## Fichiers impactés

(liste depuis sprint-{n}.md)

## Notes techniques

(notes depuis sprint-{n}.md)

---
*Issue créée par MR1 v1.0 le {DATE}. MR2 Auto-Implementer prendra cette issue lors du prochain cron 08:00 ou 16:00 UTC si éligible (label \`mr2-ready\`).*
EOF

Stocker le numéro d'issue retourné pour le récap.

---

## STEP 6 — Commit et push le plan

git add docs/sprints/{YEAR}-W{WEEK}/_plan.md
git commit -m "routines: MR1 W{WEEK} — plan hebdo {N} tickets ({IDs})"
git push origin claude/main

---

## STEP 7 — Récap

Output :

  📋 MR1 v1.0 — {DATE}
  Sprint actif : {N}
  Tickets planifiés : {count}
  Issues créées : #{numbers}
  PR ouvertes en attente : {count}
  Plan : docs/sprints/{YEAR}-W{WEEK}/_plan.md
  Sortie : ✅
```

---

## CONTRAINTES DURES

- **Lecture seule du backlog** : MR1 ne modifie jamais `sprint-{N}.md`. Si un ticket est mal défini, MR1 le commente dans l'issue mais ne corrige pas.
- **Idempotence** : si une issue existe déjà pour le ticket (même titre `[S{n}-T{nn}]`), SKIP.
- **Cap 5 issues/run** : éviter d'inonder le mainteneur. Si plus d'éligibles, ils passent au run suivant.
- **Pas de modification de label `mr2-ready`** par MR1 si déjà retiré (signe que tu as repris la main).
- **Plan AVANT fragmentation** : si un ticket dépasse L (>500 LOC), MR1 commente "À refragmenter" sur l'issue source et n'inclut pas dans le plan.
