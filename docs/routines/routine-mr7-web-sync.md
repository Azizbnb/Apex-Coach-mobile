# Claude Code Routine MR7 — Web Sync Detector Mobile

> **Version :** 1.0.0 — 04/05/2026
> **Schedule :** dimanche 22:00 (Europe/Paris) — `0 22 * * 0`
> **Routine name :** `apex-mobile-web-sync`
> **Output :** 1 PR `chore: sync from web — {YEAR}-W{WEEK}` si drift détecté entre les fichiers partagés web/mobile, ou récap "no drift" si rien à faire.
> **Architecture :** Bash + git diff + cp de fichiers web → mobile + tsc/eslint vérif. Multi-fichiers fragmentés (1 commit par fichier touché pour traçabilité).

---

## ROUTINE PROMPT

```
Tu exécutes la routine MR7 Web Sync Detector v1.0.
Aujourd'hui : {CURRENT_DATE} (dimanche soir).

Mode strict :
- NE JAMAIS modifier le projet web — uniquement copier les fichiers vers le mobile.
- NE JAMAIS toucher aux fichiers mobile-only (`hooks/`, `stores/`, `app/`, `components/`).
- ALWAYS lancer `tsc --noEmit` après le sync pour vérifier la compilation.
- Si tsc échoue → ouvrir une PR de toute façon avec label `sync-conflict` pour input humain.

---

## STEP 0 — Setup

cd /repos
# Cloner web et mobile côte à côte
[ -d apex-coach ] || git clone https://github.com/{OWNER}/apex-coach.git
[ -d apex-coach-mobile ] || git clone https://github.com/{OWNER}/apex-coach-mobile.git

cd apex-coach && git fetch origin && git checkout main && git pull --ff-only && cd ..
cd apex-coach-mobile && git fetch origin && git checkout claude/main && git pull --ff-only

---

## STEP 1 — Liste des fichiers à synchroniser

Source de vérité : `docs/AUDIT_PHASE_0.md` §1 fichiers partagés. Voici la liste canonique :

| Mobile (cible) | Web (source) |
|----------------|-------------|
| `apex-coach-mobile/types/index.ts` | `Apex-Coach/types/index.ts` |
| `apex-coach-mobile/lib/validations/step1.ts` | `Apex-Coach/lib/validations/step1.ts` |
| `apex-coach-mobile/lib/validations/step2.ts` | `Apex-Coach/lib/validations/step2.ts` |
| `apex-coach-mobile/lib/validations/step3.ts` | `Apex-Coach/lib/validations/step3.ts` |
| `apex-coach-mobile/lib/validations/step4.ts` | `Apex-Coach/lib/validations/step4.ts` |
| `apex-coach-mobile/lib/validations/step5.ts` | `Apex-Coach/lib/validations/step5.ts` |
| `apex-coach-mobile/lib/validations/step6.ts` | `Apex-Coach/lib/validations/step6.ts` |
| `apex-coach-mobile/lib/validations/review.ts` | `Apex-Coach/lib/validations/review.ts` |
| `apex-coach-mobile/lib/validations/nutrition-preferences.ts` | id |
| `apex-coach-mobile/lib/validations/promo-code.ts` (Sprint 3) | id |
| `apex-coach-mobile/lib/config/pricing.ts` (sans Stripe IDs) | `Apex-Coach/lib/config/pricing.ts` |
| `apex-coach-mobile/lib/subscription/progressive-unlock.ts` | id |
| `apex-coach-mobile/lib/fasting/date-calculation.ts` | id |
| `apex-coach-mobile/lib/affiliate/equipment-catalog.ts` | id |
| `apex-coach-mobile/lib/affiliate/supplement-catalog.ts` | id |
| `apex-coach-mobile/lib/affiliate/url-builder.ts` | id |
| `apex-coach-mobile/lib/programs/schemas.ts` | id |

---

## STEP 2 — Détecter les drifts

Pour chaque fichier de la liste :

  diff -q ../apex-coach/{web_path} ./{mobile_path}

Si différent → ajouter à la liste de fichiers à synchroniser.

Cas spécial `pricing.ts` : retirer les Stripe Price IDs avant copy (les SKU mobile n'en ont pas). Utiliser un script de transformation `scripts/sync-pricing.sh`.

Si aucun drift → output "✅ Aucun drift web↔mobile cette semaine." et sortir 0.

---

## STEP 3 — Créer une branche et copier les fichiers

git checkout -b chore/sync-from-web-{YEAR}-W{WEEK}

Pour chaque fichier différent :
  cp ../apex-coach/{web_path} ./{mobile_path}

Cas pricing : `bash scripts/sync-pricing.sh ../apex-coach/lib/config/pricing.ts ./lib/config/pricing.ts`

---

## STEP 4 — Vérifications

npx tsc --noEmit > /tmp/tsc.log 2>&1; TSC=$?
npx eslint . --ext .ts,.tsx > /tmp/eslint.log 2>&1; ESLINT=$?

Si TSC ≠ 0 :
- Output les erreurs
- Continue (ouvrir la PR avec label `sync-conflict`)

---

## STEP 5 — Commit + PR

# 1 commit par fichier pour traçabilité
for file in {liste fichiers}; do
  git add $file
  git commit -m "sync(mobile): $file from web @ $(cd ../apex-coach && git rev-parse --short HEAD)"
done

git push origin chore/sync-from-web-{YEAR}-W{WEEK}

PR_LABEL="auto-qa"
[ $TSC -ne 0 ] && PR_LABEL="sync-conflict"

gh pr create \
  --repo {OWNER}/apex-coach-mobile \
  --base claude/main \
  --head chore/sync-from-web-{YEAR}-W{WEEK} \
  --title "chore: sync from web — {YEAR}-W{WEEK}" \
  --label "$PR_LABEL,from-mr7" \
  --body-file - <<EOF
## Sync web → mobile {YEAR}-W{WEEK}

Web SHA source : $(cd ../apex-coach && git rev-parse --short HEAD)

### Fichiers synchronisés
{liste avec diff stats}

### Vérifications
- tsc --noEmit : {✅|❌}
- eslint : {✅|❌}

### Action requise
{✅ Aucune — auto-merge si MR3+MR4 vert | ❌ Conflit de types — review humaine}

---
*Sync auto par MR7 v1.0.*
EOF

---

## STEP 6 — Récap

Output :

  🔄 MR7 v1.0 — {DATE}
  Drifts détectés : {N} fichier(s)
  PR créée : #{number}
  Conflit tsc : {oui|non}
  Sortie : ✅
```

---

## CONTRAINTES DURES

- **Read-only sur le repo web** : MR7 ne push jamais vers `apex-coach`.
- **Idempotence** : si une PR `chore/sync-from-web-{YEAR}-W{WEEK}` existe déjà, SKIP.
- **Pricing transformé** : `lib/config/pricing.ts` mobile NE contient PAS les Stripe IDs côté serveur (script `scripts/sync-pricing.sh` à créer une fois Sprint 2 démarré).
- **Pas de fix automatique** sur conflit tsc : labelliser `sync-conflict` et laisser l'humain résoudre.
- **1 commit par fichier** pour `git blame` lisible.

---

## SETUP — pré-requis avant la 1re activation

1. **Repo web cloné** côté code.claude.ai (`/repos/apex-coach`)
2. **Token GitHub** avec scope read sur `apex-coach` + write sur `apex-coach-mobile`
3. **Script `scripts/sync-pricing.sh`** dans le repo mobile (à créer Sprint 2 — retire les Stripe IDs avant copy)
