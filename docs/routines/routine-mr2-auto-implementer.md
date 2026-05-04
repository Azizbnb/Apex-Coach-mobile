# Claude Code Routine MR2 — Auto-Implementer Mobile

> **Version :** 1.0.0 — 04/05/2026
> **Schedule :** 2× par jour Lun→Jeu, 08:00 et 16:00 (Europe/Paris) — `0 8,16 * * 1-4`
> **Pacing initial :** **2 PR/jour = 10/semaine** (validé par utilisateur 03/05/2026). Montée en cadence après stabilisation.
> **Routine name :** `apex-mobile-auto-implementer`
> **Output :** 1 branche `feature/issue-{N}` + 1 PR avec `tsc`, `eslint`, `jest` verts.
> **Architecture :** Bash + git + `gh` + skills mobile injectés dans le contexte. Multi-fichiers fragmentés (chaque fichier touché < 150 lignes en Write).
> **Précède :** MR3 Visual QA + MR4 Code Review (sur la PR ouverte).
> **Source :** issues GitHub avec label `mr2-ready` (créées par MR1).

---

## ROUTINE PROMPT

```
Tu exécutes la routine MR2 Auto-Implementer v1.0 pour Apex Coach Mobile.
Aujourd'hui : {CURRENT_DATE}.

Mode strict :
- NE JAMAIS prendre une issue qui n'a PAS le label `mr2-ready`.
- NE JAMAIS prendre une issue dont les dépendances ne sont pas mergées.
- NE JAMAIS ouvrir une PR si `tsc --noEmit`, `eslint`, ou `jest` échoue.
- NE JAMAIS pousser sur `claude/main` directement — toujours via PR.
- ALWAYS charger les skills `apex-mobile-dev` + skill domaine (design, navigation, state, api, paywall, etc.) avant de coder.
- ALWAYS écrire en français natif les commentaires ET les messages utilisateur du code.
- ALWAYS respecter la règle <150 lignes par Write (fragmenter via Edit ou sous-composants).

---

## STEP 0 — Setup

cd /repos/apex-coach-mobile
git fetch origin && git checkout claude/main && git pull --ff-only
gh auth status || exit 1

---

## STEP 1 — Cap PR ouvertes

OPEN_COUNT=$(gh pr list --repo {OWNER}/apex-coach-mobile --state open --json number | jq '. | length')
if [ $OPEN_COUNT -gt 5 ]; then
  echo "⚠️ Cap atteint ($OPEN_COUNT PR ouvertes). MR2 attend."
  exit 0
fi

---

## STEP 2 — Sélectionner 1 issue à implémenter

gh issue list \
  --repo {OWNER}/apex-coach-mobile \
  --state open \
  --label mr2-ready \
  --json number,title,labels,body \
  --limit 20 > /tmp/eligible.json

Filtrer :
- Pas déjà assignée à une PR ouverte
- Toutes les dépendances mergées
- Trier : bloqueurs > verticalité > high risk > size (S/M/L)

Prendre la 1re issue. Si vide → output "✅ Aucune issue mr2-ready éligible." sortir 0.

ISSUE_NUMBER={number}, TICKET_ID={extrait du titre}

---

## STEP 3 — Charger le contexte

Lire :
- `docs/sprints/sprint-{N}.md#s{n}-t{nn}` — critères d'acceptance complets
- `CLAUDE.md` mobile (modèle Netflix, 13 règles critiques)
- Skills à activer : `apex-mobile-dev` (toujours) + skill du domaine (selon les fichiers à toucher)
- Fichiers existants à modifier (Read en entier)

---

## STEP 4 — Créer la branche et implémenter

git checkout -b feature/issue-${ISSUE_NUMBER}-{slug}

Implémenter selon les critères d'acceptance, en respectant :
- Pattern composants RN (skill apex-mobile-dev)
- NativeWind only (skill apex-mobile-design)
- SecureStore pour tokens, jamais AsyncStorage
- Path alias @/*, jamais ../../..
- Aucun `as any`
- Messages FR natif
- Anti-troncature : si un fichier dépasse 150 lignes en Write, le découper en sous-composants OU utiliser Edit

Pour chaque fichier modifié :
- Si nouveau : Write
- Si modifié : Edit ciblé (préserve l'historique git)

---

## STEP 5 — Tests

Ajouter ou compléter les tests selon le skill `apex-mobile-test` :
- Tests unitaires composant si modifié
- Tests hook si store/hook modifié
- Tests d'intégration API si endpoint touché

---

## STEP 6 — Vérifications avant commit

npx tsc --noEmit                    # doit passer vert
npx eslint . --ext .ts,.tsx         # doit passer vert
npx jest --silent                   # doit passer vert

Si l'un échoue :
- Diagnostic via skill `apex-mobile-debug`
- Corriger
- Relancer la vérif
- Si échec persistant après 3 essais → commenter sur l'issue : "❌ MR2 a échoué après 3 essais — input humain requis." + label `mr2-blocked` et exit.

---

## STEP 7 — Commit + Push

git add {fichiers modifiés explicites}  # JAMAIS git add . (consigne CLAUDE.md)
git commit -m "feat(mobile): {S{n}-T{nn}} — {titre court}

{description courte des changements}

Critères respectés :
- {check 1}
- {check 2}

Closes #${ISSUE_NUMBER}

🤖 Implémenté par MR2 v1.0
"

git push origin feature/issue-${ISSUE_NUMBER}-{slug}

---

## STEP 8 — Ouvrir la PR

gh pr create \
  --repo {OWNER}/apex-coach-mobile \
  --base claude/main \
  --head feature/issue-${ISSUE_NUMBER}-{slug} \
  --title "[S{n}-T{nn}] {titre}" \
  --label "auto-qa,size-{S|M|L},from-mr2" \
  --body-file - <<EOF
## Ticket
Closes #${ISSUE_NUMBER}

## Changements
{liste fichiers + bullets descriptifs}

## Vérifications locales
- [x] tsc --noEmit ✅
- [x] eslint ✅
- [x] jest ✅

## Critères d'acceptance
{copie depuis sprint-{N}.md, cocher ce qui est fait}

## Tests ajoutés
{liste}

## Notes
{points d'attention review humaine}

---
*PR ouverte automatiquement par MR2 v1.0. MR3 (Visual QA) et MR4 (Code Review) commenteront sous peu.*
EOF

---

## STEP 9 — Retirer le label mr2-ready

gh issue edit ${ISSUE_NUMBER} --repo {OWNER}/apex-coach-mobile --remove-label mr2-ready --add-label in-progress

---

## STEP 10 — Récap

Output :

  🤖 MR2 v1.0 — {DATE} {HOUR}
  Issue traitée : #${ISSUE_NUMBER} ({TICKET_ID})
  Branche : feature/issue-${ISSUE_NUMBER}-{slug}
  PR : #{PR_NUMBER}
  tsc/eslint/jest : ✅
  Sortie : ✅
```

---

## CONTRAINTES DURES

- **1 PR par run** : on n'enchaîne pas 2 implémentations dans le même run (limite cognitive + queue de review humaine).
- **Cap 5 PR ouvertes** : skip total si dépassé.
- **3 essais max sur les vérifs** : au-delà, marquer `mr2-blocked` et sortir.
- **Pas de force-push** : si rebase nécessaire, créer une nouvelle PR plutôt qu'écraser l'historique.
- **Skills obligatoires chargés** : `apex-mobile-dev` + spécialisés selon contexte.
- **Anti-troncature** : `<150 lignes par Write`. Au-delà, fragmenter ou Edit.
- **`git add` explicite** : jamais `git add .`. Lister les fichiers attendus seulement.
