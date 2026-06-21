# Claude Code Routine MR5 — EAS Build Preview Mobile

> **Version :** 1.0.0 — 04/05/2026 (activée en Phase 4.1 du plan MR3-MR7, anticipée)
> **Schedule :** vendredi `0 17 * * 5` UTC (= 19:00 Paris CEST). Trigger ID `trig_015wK9NkikC6aRkVyGYJDGF6` enregistré côté code.claude.ai le 2026-05-17.
> **Routine name :** `apex-mobile-eas-build`
> **Token :** `EXPO_TOKEN` chargé depuis `~/.bashrc` de l'env Cowork (persisté le 2026-05-17 via one-shot `setup-expo-token-once`).
> **Output :** 1 build EAS preview iOS + 1 build EAS preview Android, lien drop dans une issue GitHub label `weekly-build`.
> **Architecture :** Bash + EAS CLI (`eas build`) + `gh issue create`. Pas de fichier code modifié.
> **Cap budget :** **1 build/semaine max**, profile `preview` uniquement. Submit TestFlight/Play **manuel par toi** — MR5 ne soumet jamais.

---

## ROUTINE PROMPT

```
Tu exécutes la routine MR5 EAS Build v1.0 pour Apex Coach Mobile.
Aujourd'hui : {CURRENT_DATE} (vendredi).

Mode strict :
- NE JAMAIS faire `eas build --profile production` — uniquement `preview`.
- NE JAMAIS faire `eas submit` — submission TestFlight/Play est manuelle.
- NE JAMAIS dépasser 1 build/plateforme/semaine (cap budget Free Tier EAS = 30 builds/mois).
- Si la branche `claude/main` n'a aucune PR mergée depuis lundi → SKIP (pas de nouveauté à builder).

---

## STEP 0 — Setup

cd /repos/apex-coach-mobile
git fetch origin && git checkout claude/main && git pull --ff-only

# Vérifier EAS auth
eas whoami || (echo "❌ EAS non authentifié. Set EAS_TOKEN env var." && exit 1)

---

## STEP 1 — Vérifier qu'il y a eu des changements depuis le dernier build

LAST_BUILD_SHA=$(gh issue list --label weekly-build --json body --limit 1 --jq '.[0].body' | grep -oP 'SHA: \K[a-f0-9]+' || echo "")
CURRENT_SHA=$(git rev-parse HEAD)

if [ "$LAST_BUILD_SHA" = "$CURRENT_SHA" ]; then
  echo "✅ Aucun changement depuis le dernier build ($LAST_BUILD_SHA). SKIP."
  exit 0
fi

PRS_MERGED=$(gh pr list --state merged --base claude/main --limit 20 --json mergedAt --jq '[.[] | select(.mergedAt > (now - 7*86400 | todate))] | length')
if [ "$PRS_MERGED" -eq 0 ]; then
  echo "✅ Aucune PR mergée cette semaine. SKIP."
  exit 0
fi

---

## STEP 2 — Build iOS preview

eas build \
  --platform ios \
  --profile preview \
  --non-interactive \
  --message "MR5 weekly preview — SHA $CURRENT_SHA" \
  --json > /tmp/eas_ios.json

IOS_URL=$(jq -r '.[].artifacts.buildUrl' /tmp/eas_ios.json)
IOS_BUILD_ID=$(jq -r '.[].id' /tmp/eas_ios.json)

---

## STEP 3 — Build Android preview

eas build \
  --platform android \
  --profile preview \
  --non-interactive \
  --message "MR5 weekly preview — SHA $CURRENT_SHA" \
  --json > /tmp/eas_android.json

ANDROID_URL=$(jq -r '.[].artifacts.buildUrl' /tmp/eas_android.json)
ANDROID_BUILD_ID=$(jq -r '.[].id' /tmp/eas_android.json)

---

## STEP 4 — Drop dans une issue GitHub

gh issue create \
  --repo {OWNER}/apex-coach-mobile \
  --title "Weekly EAS Build — {YEAR}-W{WEEK}" \
  --label "weekly-build" \
  --body-file - <<EOF
## Build EAS Preview — Semaine {YEAR}-W{WEEK}

**Date :** ${CURRENT_DATE}
**SHA :** ${CURRENT_SHA}
**PR mergées cette semaine :** ${PRS_MERGED}

### iOS (preview)
- Build ID : \`${IOS_BUILD_ID}\`
- Lien : ${IOS_URL}
- À tester sur device iOS via Expo Go ou TestFlight (manuel)

### Android (preview)
- Build ID : \`${ANDROID_BUILD_ID}\`
- Lien : ${ANDROID_URL}
- APK installable directement (sideload)

### Checklist QA manuelle
- [ ] Login + signup fonctionnent
- [ ] Programme s'affiche
- [ ] Workout actif (si Sprint 2 livré)
- [ ] Paywall info redirige correctement vers apexcoach.app
- [ ] Aucun crash au lancement
- [ ] Aucun prix affiché (modèle Netflix)
- [ ] Deep links fonctionnent (apexcoach://redeem?code=TEST)

### Submission TestFlight / Play (manuel)
\`\`\`bash
eas submit --platform ios   # demande App Store Connect API key
eas submit --platform android # demande Google Play service account JSON
\`\`\`

---
*Build généré automatiquement par MR5 v1.0. Submit TestFlight/Play : décision humaine.*
EOF

---

## STEP 5 — Récap

Output :

  📦 MR5 v1.0 — {DATE}
  iOS build : ${IOS_BUILD_ID} → ${IOS_URL}
  Android build : ${ANDROID_BUILD_ID} → ${ANDROID_URL}
  Issue créée : #{number}
  Submit : MANUEL (par l'utilisateur)
  Sortie : ✅
```

---

## CONTRAINTES DURES

- **Profile = preview uniquement** : jamais `production`.
- **Aucun submit** : MR5 ne touche pas à TestFlight ni Play Store.
- **Cap 1 build/semaine** : skip si déjà buildé sur le même SHA.
- **Skip si rien à builder** : pas de PR mergée cette semaine = pas de build.
- **EAS_TOKEN dans env** : configuration côté code.claude.ai (pas dans le repo).
- **Erreur EAS = retry 1×** : si la première tentative échoue (réseau, timeout), retry 1 fois puis fail proprement.

---

## SETUP — pré-requis avant la 1re activation

1. **EAS account configuré** + token dans `EAS_TOKEN` côté code.claude.ai
2. **eas.json** profile `preview` configuré (S5-T01)
3. **App Store Connect / Google Play Console** comptes créés (pour le submit manuel — pas requis pour le build preview)
4. **Issue label `weekly-build`** créé sur le repo
