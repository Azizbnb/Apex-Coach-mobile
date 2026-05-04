# Claude Code Routine MR3 — Visual QA Mobile

> **Version :** 1.0.0 — 04/05/2026
> **Schedule :** déclenchée sur ouverture de PR avec label `auto-qa` (workflow GitHub Actions ou webhook RemoteTrigger). Pas de cron périodique.
> **Routine name :** `apex-mobile-visual-qa`
> **Output :** 1 commentaire structuré sur la PR, avec captures Expo Web + checklist design system + diff visuel.
> **Architecture :** Bash + Expo Web (`npx expo start --web`) + Playwright headless pour screenshots. Multi-fichiers fragmentés (1 commentaire concis + assets en pièces jointes).
> **Précède :** merge auto si MR3 + MR4 valident.

---

## ROUTINE PROMPT

```
Tu exécutes la routine MR3 Visual QA v1.0 pour une PR Apex Coach Mobile.
PR cible : #{PR_NUMBER}.

Mode strict :
- NE JAMAIS bloquer une PR — uniquement commenter avec ✅ ou ⚠️.
- NE JAMAIS modifier le code de la PR.
- LIMITATION : pas de simulateur iOS/Android dans l'env code.claude.ai. Fallback : Expo Web (npx expo start --web) qui couvre design system + flow logique mais PAS le rendu natif iOS/Android fin.
- ALWAYS poster en français.

---

## STEP 0 — Setup

cd /repos/apex-coach-mobile
git fetch origin
git checkout origin/{HEAD_BRANCH}  # checkout direct de la branche PR
npm ci

---

## STEP 1 — Identifier les écrans touchés par la PR

git diff --name-only origin/claude/main...HEAD | grep -E '^(app|components|hooks)/' > /tmp/touched.txt

Si vide (pas de fichier UI touché) → MR3 commente "Pas d'impact UI détecté — Visual QA non requis." et sort 0.

Pour chaque fichier touché :
- Si app/(auth)/* → screen auth
- Si app/(tabs)/* → screen dashboard
- Si app/(modals)/* → modal
- Si components/* → identifier les écrans qui l'utilisent (grep)

---

## STEP 2 — Démarrer Expo Web

npx expo start --web --port 8081 --no-dev > /tmp/expo.log 2>&1 &
EXPO_PID=$!
sleep 30  # warmup
curl -f http://localhost:8081 || (kill $EXPO_PID; exit 1)

---

## STEP 3 — Captures Playwright

Pour chaque écran identifié, faire un screenshot via Playwright headless :

npx playwright screenshot --viewport-size=375,812 \
  http://localhost:8081/{route} \
  /tmp/screenshots/{slug}-iphone.png

Tailles à couvrir :
- iPhone 13 mini : 375×812
- iPhone 15 Pro Max : 430×932
- Pixel 7 : 412×915

---

## STEP 4 — Checklist design system

Pour chaque écran, vérifier (via inspection DOM Playwright + grep du code) :

- [ ] Fond `#0A0E1A` (dark mode) → `getComputedStyle(document.body).backgroundColor === 'rgb(10, 14, 26)'`
- [ ] Aucune couleur hex hardcodée hors tokens (grep dans les fichiers touchés)
- [ ] Tous les textes utilisent `Text` component (grep `<Text` brut sans `from '@/components/ui'`)
- [ ] Aucun `StyleSheet.create` dans les fichiers touchés (grep)
- [ ] Aucun prix affiché (grep `€`, `EUR`, `\$`, `14,90`, `24,90`, etc.) → modèle Netflix
- [ ] Tous les `TouchableOpacity` ont `accessibilityLabel`
- [ ] Tous les targets < 44px ont `hitSlop`

Compter les ✅ et ⚠️.

---

## STEP 5 — Diff visuel (si la PR modifie un écran existant)

Pour chaque écran modifié :
- Capture avant (depuis claude/main)
- Capture après (depuis la PR)
- Diff via Playwright (`pixelmatch` ou inspection visuelle)

Si différence détectée → annoter dans le commentaire (mais ne pas bloquer).

---

## STEP 6 — Commenter la PR

gh pr comment ${PR_NUMBER} --repo {OWNER}/apex-coach-mobile --body-file - <<EOF
## [MR3 v1.0] Visual QA

### Écrans testés
- {liste des routes}

### Captures Expo Web
{embed images via gh issue/pr attach ou lien S3 si configuré}

### Checklist design system
- {✅|⚠️} Fond dark `#0A0E1A`
- {✅|⚠️} Couleurs via tokens (pas de hex hardcoded)
- {✅|⚠️} Composant Text utilisé
- {✅|⚠️} Pas de StyleSheet.create
- {✅|⚠️} **Modèle Netflix : aucun prix affiché**
- {✅|⚠️} Accessibilité (labels + hitSlop)

**Score :** {N}/6 ✅

### Verdict
{✅ Visual QA OK | ⚠️ Ajustements suggérés (non bloquants)}

---
*Note : Expo Web ne reproduit pas exactement le rendu iOS/Android natif. Validation finale par EAS Build preview (MR5 vendredi).*

*Commenté automatiquement par MR3 v1.0.*
EOF

---

## STEP 7 — Cleanup

kill $EXPO_PID 2>/dev/null || true
rm -rf /tmp/screenshots /tmp/expo.log
```

---

## CONTRAINTES DURES

- **Non bloquant** : MR3 ne refuse jamais une PR. Au pire ⚠️ avec suggestions.
- **Fallback Expo Web** : explicitement annoncé dans le commentaire (pas du rendu natif).
- **Pas de modif code** : MR3 lit, screenshote, commente — point.
- **Idempotence** : si MR3 a déjà commenté sur cette PR (signature `[MR3 v1.0]`), refaire le commentaire écrase l'ancien (utiliser `gh pr comment --edit-last` si possible).
- **Timeout** : si Expo Web ne démarre pas en 60s → fallback "Visual QA non disponible — checker manuel requis." sans bloquer.
