# Claude Code Routine MR4 — Code Review Mobile

> **Version :** 1.3.0 — 08/05/2026 (v1.2 → v1.3 : ajout du vendredi, synchronisé avec MR2 v1.1.0)
> **Schedule :** `30 6,14 * * 1-5` — Lun→Ven 06:30 + 14:30 UTC (= 08:30 + 16:30 Paris CEST). 30 min après chaque cron MR2 pour reviewer la PR fraîchement ouverte.
> **Fréquence :** 10 runs/semaine (5 jours × 2 runs).
> **Latence max** : ~30-60 min entre l'ouverture de PR par MR2 et le commentaire MR4.
> **Routine name :** `apex-mobile-code-review`
> **Output :** 1 commentaire structuré "Audit MR4" sur la PR, sections HIGH / MED / LOW, recommandation merge.
> **Architecture :** Bash + git diff + skills sécurité/dev. Multi-fichiers fragmentés (1 commentaire avec sections concises).
> **Précède :** merge auto si MR3 ✅ + MR4 ✅ (chaîne vertueuse).

---

## ROUTINE PROMPT

```
Tu exécutes la routine MR4 Code Review v1.0 pour la PR Apex Coach Mobile #{PR_NUMBER}.
Aujourd'hui : {CURRENT_DATE}.

Mode strict :
- NE JAMAIS modifier le code de la PR.
- NE JAMAIS bloquer une PR — uniquement signaler les findings.
- ALWAYS charger les skills `apex-mobile-security-review` + `apex-mobile-dev`.
- ALWAYS commenter en français.
- TOUJOURS distinguer HIGH (bloque le merge si automatique) / MED (reco) / LOW (suggestion).

---

## STEP 0 — Setup

cd /repos/apex-coach-mobile
git fetch origin
git checkout origin/{HEAD_BRANCH}

---

## STEP 1 — Lire le diff complet

git diff --stat origin/claude/main...HEAD > /tmp/diff_stat.txt
git diff origin/claude/main...HEAD > /tmp/diff_full.txt

Identifier :
- Fichiers modifiés / créés / supprimés
- Volume LOC (objectif : < 300 LOC effectives, hors tests)

---

## STEP 2 — Audit checklist (skill `apex-mobile-security-review`)

Pour chaque catégorie, lister les findings dans le diff :

### A. Modèle Netflix (HIGH si violé)
- grep `€|EUR|\$|14,90|24,90|S'abonner|Acheter|Pay|Subscribe` dans les nouveaux strings → si trouvé → HIGH
- grep `IAP|in-app|expo-iap|StoreKit|BillingClient` → si trouvé → HIGH (interdit)

### B. SecureStore vs AsyncStorage (HIGH)
- grep `AsyncStorage` dans le diff → HIGH si utilisé pour des données sensibles (token, session, JWT)

### C. `as any` (HIGH)
- grep `as any` → HIGH

### D. Validation Zod (HIGH si entrée user non validée)
- Toute API route ou form handler qui ne passe pas par un schema → HIGH

### E. Sync fichiers partagés (MED)
- Si modif `lib/validations/`, `lib/config/pricing.ts`, `types/index.ts`, `lib/subscription/progressive-unlock.ts` côté mobile → vérifier que le web a aussi été modifié (sinon drift). MR7 attrapera mais signaler ici.

### F. NativeWind (MED)
- grep `StyleSheet.create` dans les fichiers touchés → MED

### G. Path alias (LOW)
- grep `\.\./\.\./` → LOW (préférer `@/`)

### H. Anti-troncature (MED)
- Pour chaque nouveau fichier : `wc -l {file}`. Si > 150 lignes ET le mainteneur a utilisé Write (pas Edit) → MED "Préférer une décomposition en sous-composants".

### I. Messages FR (MED)
- grep des strings affichés (`<Text>...</Text>`, alert, toast) — détecter l'anglais "Loading..." "Submit" "Cancel" → MED

### J. Tests présents (LOW si manquants)
- Si la PR ajoute un composant ou un hook sans test correspondant dans `__tests__/` → LOW

### K. Audit log côté serveur (HIGH si opération sensible sans audit)
- Si la PR ajoute un appel POST `/api/auth/*`, `/api/subscription/*`, `/api/user/delete-*` sans audit log → HIGH (à wirer côté serveur, signal au mainteneur)

### L. Accessibilité (MED si TouchableOpacity sans label)
- grep `<TouchableOpacity` sans `accessibilityLabel` proche → MED

---

## STEP 3 — Vérifications mécaniques

cd /repos/apex-coach-mobile
git checkout origin/{HEAD_BRANCH}
npm ci
npx tsc --noEmit > /tmp/tsc.log 2>&1; TSC=$?
npx eslint . --ext .ts,.tsx > /tmp/eslint.log 2>&1; ESLINT=$?  # v1.1 : pas de --max-warnings 0
npx jest --silent > /tmp/jest.log 2>&1; JEST=$?

Si TSC ≠ 0 → HIGH "tsc échoue, voir log"
Si ESLINT ≠ 0 → HIGH (vraies erreurs uniquement, warnings tolérés depuis v1.1)
Si JEST ≠ 0 → HIGH

> **v1.1 — note ESLint :** les warnings sur les fichiers partagés web (`lib/affiliate/*.ts`, `types/index.ts`, etc.) ne sont plus escaladés en HIGH. Ces fichiers sont copiés du web et seront re-synchronisés par MR7 quand le web aura été corrigé.

---

## STEP 4 — Commenter la PR

gh pr comment ${PR_NUMBER} --repo {OWNER}/apex-coach-mobile --body-file - <<EOF
## [MR4 v1.0] Audit Code Review

**Volume :** {N} fichiers, {LOC} LOC effectives ({hors_tests} hors tests)
**Vérifs mécaniques :** tsc {✅|❌}, eslint {✅|❌}, jest {✅|❌}

### 🔴 HIGH ({n_high})
{liste avec fichier:ligne et règle violée}

### 🟡 MED ({n_med})
{liste}

### 🟢 LOW ({n_low})
{liste}

### Verdict
{✅ Auto-merge OK (HIGH = 0 et vérifs vertes) | ⚠️ Attente correction des HIGH | ❌ HIGH bloquants}

---
*Reviewé automatiquement par MR4 v1.0. Skill source : apex-mobile-security-review + apex-mobile-dev.*
EOF

---

## STEP 5 — Si verdict ✅ et MR3 a aussi ✅ → auto-merge optionnel

if [ "$VERDICT" = "ok" ] && gh pr view ${PR_NUMBER} --json comments | grep -q "MR3.*Visual QA OK"; then
  # Auto-merge si autorisé (à activer après stabilisation)
  echo "Conditions auto-merge réunies — décision humaine pour l'instant"
  # gh pr merge ${PR_NUMBER} --squash --delete-branch
fi
```

> Auto-merge **désactivé en v1.0**. Validation humaine pour les premières semaines. Activable plus tard via flag.

---

## CONTRAINTES DURES

- **HIGH ≠ block automatique** en v1.0 : MR4 signale, l'humain décide. Auto-merge sera activé v1.1 après confiance bâtie.
- **Pas de modif code** : MR4 commente, ne push pas.
- **Idempotence** : 1 seul commentaire MR4 par PR (édition si nécessaire via `gh pr comment --edit-last`).
- **Confidence-based filtering** : ne lister que les findings dont tu es sûr (>80%). Une fausse alerte coûte plus que 1 vrai miss à ce stade.
- **Skill `apex-mobile-security-review` injecté** dans le contexte au démarrage.
