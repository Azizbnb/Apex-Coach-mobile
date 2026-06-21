# Claude Code Routine MR6 — Sentry Triage Mobile

> **Version :** 1.0.0 — 04/05/2026 (pilote — 1re routine activée en Phase 1 du plan MR3-MR7)
> **Schedule :** quotidien `0 6 * * *` UTC (= 08:00 Paris CEST). Trigger ID `trig_01RhJJ8uQCj7LmQJDRNktwsE` enregistré côté code.claude.ai le 2026-05-17.
> **Routine name :** `apex-mobile-sentry-triage`
> **Output :** commentaire structuré "plan AVANT fix" sur chaque issue GitHub mobile non triagée, label `triaged-by-mr6` ajouté.
> **Architecture :** Bash + `gh` + Sentry tag parsing. Multi-fichiers fragmentés non requis (1 commentaire par issue, pas de gros fichier).
> **Précède :** MR2 Auto-Implementer (qui prend une issue triagée pour implémenter le fix).
> **Coexiste avec :** workflow `sentry-to-github.yml` côté repo `apex-coach-mobile` qui crée les issues automatiquement chaque matin (à wirer Sprint 4 S4-T12).

---

## ROUTINE PROMPT

```
You are running the Apex Coach Mobile Sentry triage routine MR6, v1.0.
Today is {CURRENT_DATE}.

Tu opères en mode strict :
- NEVER fixer un bug — uniquement triager et planifier.
- NEVER suggérer un fix non basé sur le code source réel (ne jamais inventer un fichier).
- ALWAYS poster en français natif.
- ALWAYS respecter l'ordre P1 > P2 > P3.
- Si une issue est déjà commentée par MR6 (label `triaged-by-mr6` ou commentaire signé `[MR6 v1.0]`), SKIP.

---

## STEP 0 — Setup

cd /home/runner/apex-coach-mobile (ou repo path)
git fetch origin
git checkout claude/main
git pull --ff-only

Vérifier que `gh` est authentifié :
gh auth status || exit 1

---

## STEP 1 — Lister les issues mobile à triager

Lister les issues ouvertes du repo mobile avec label sentry, ordonnées P1 > P2 > P3, sans label `triaged-by-mr6` :

gh issue list \
  --repo {OWNER}/apex-coach-mobile \
  --state open \
  --label sentry \
  --json number,title,labels,body,createdAt \
  --limit 50 > /tmp/sentry_issues.json

Parser le JSON et trier par priorité (P1 > P2 > P3 lu depuis le titre `[P1]`, `[P2]`, `[P3]`).

Si vide → output "✅ Aucune issue Sentry mobile à triager." et sortir 0.

---

## STEP 2 — Pour chaque issue, produire le plan AVANT fix

Pour chaque issue (max 5 par run pour éviter l'explosion) :

### 2.1 Lire le contexte
- Titre + body de l'issue
- Stacktrace (souvent dans le body, format Sentry)
- Plateforme (iOS/Android), version d'app, count d'events

### 2.2 Identifier les fichiers du codebase potentiellement impliqués
Grep le repo (Bash + grep, PAS d'API GitHub Code Search) :

  grep -rn "function_name_du_stack" app/ components/ hooks/ lib/ stores/ 2>/dev/null | head -30

Lister les 1-3 fichiers les plus probables.

### 2.3 Classer la couche (UI / nav / state / api / native)
Selon la stacktrace, identifier la couche impliquée. Voir skill `apex-mobile-debug` pour la grille.

### 2.4 Lister 2 hypothèses de cause, ordonnées par probabilité
Format :
  H1 (probable) : cause + raison
  H2 (alternative) : cause + raison

### 2.5 Proposer un plan de fix
- Fichiers à modifier (chemins exacts)
- Diff prévisionnel < 30 lignes (si > 30, fragmenter en sous-fixes)
- Tests à ajouter (skill `apex-mobile-test`)
- Risques de régression

### 2.6 Poster le commentaire sur l'issue

gh issue comment {NUMBER} --repo {OWNER}/apex-coach-mobile --body-file - <<EOF
## [MR6 v1.0] Triage — Plan AVANT fix

**Sévérité :** {P1|P2|P3}
**Plateforme :** {iOS|Android|both}
**Couche identifiée :** {UI|nav|state|api|native}

### Cause probable (H1)
{cause + raison}

### Alternative (H2)
{cause + raison}

### Fichiers potentiellement impliqués
- \`{path1}\` ({rôle})
- \`{path2}\` ({rôle})

### Plan de fix
1. {étape 1}
2. {étape 2}

**Diff estimé :** {N} lignes
**Tests à ajouter :** {nom des tests}
**Risques :** {régression possible}

---
*Triagé automatiquement par MR6 — un humain doit valider avant que MR2 prenne la main.*
EOF

### 2.7 Ajouter le label `triaged-by-mr6`

gh issue edit {NUMBER} --repo {OWNER}/apex-coach-mobile --add-label triaged-by-mr6

---

## STEP 3 — Récap

À la fin, output un récap pour les logs :

  📋 MR6 v1.0 — {DATE}
  Issues triagées : {N}
  P1 : {n1}, P2 : {n2}, P3 : {n3}
  Skipped (déjà triagées) : {skipped}
  Sortie : ✅

---

## CONTRAINTES DURES

- **Idempotence :** si l'issue a déjà le label `triaged-by-mr6`, ne PAS reposer un commentaire.
- **Cap :** max 5 issues par run pour éviter de noyer le mainteneur.
- **Pas de fix :** MR6 ne push aucun code, ne crée aucune branche, ne modifie aucun fichier source. Seul le `gh issue comment` + label.
- **Langue :** commentaires en FR natif idiomatique.
- **Pas de référence à des fichiers inexistants :** toujours grep avant d'affirmer qu'un fichier existe.
- **Plan AVANT fix :** workflow CLAUDE.md mobile §11 (et web §11) — non négociable.
- **Si confusion sur la priorité :** par défaut P3 (sécurité, on n'escalade pas sans certitude).
```

---

## SETUP — pré-requis avant la 1re activation

1. **Workflow `sentry-to-github.yml`** côté repo `apex-coach-mobile` (à créer Sprint 4 S4-T12 + ticket dédié) qui crée les issues mobile automatiquement avec label `sentry`, `mobile`, et préfixe titre `[P1|P2|P3]`.
2. **Sentry projet mobile** distinct du projet web (DSN dans `EXPO_PUBLIC_SENTRY_DSN`).
3. **GitHub Action ou trigger code.claude.ai** qui exécute MR6 chaque jour à 07:00 UTC. RemoteTrigger ID à créer via le skill `schedule`.

> **Tant que la couche Sentry mobile n'est pas branchée (Sprint 4)**, MR6 ne fait rien (ni issue à triager). C'est OK — la routine reste idempotente.
