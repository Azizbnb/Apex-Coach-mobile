# Sprint 5 — Publication App Store + Google Play

> **Source de vérité :** `docs/sprints/WEB_FLOW_AUDIT.md` (sections 8 et 9 — flow + écarts intentionnels Netflix model)
> **Livrable :** app soumise et publiée sur TestFlight + Play Internal Testing, ASO finalisé, deep links validés, buffer de buffer pour rejets éventuels.
> **Total tickets :** 8
> **Note :** sprint majoritairement humain (validation stores). Routines mobile (MR2 / MR5) préparent les artefacts mais **ne soumettent pas**.

> **Risque #1 — Reader model App Store :** ne JAMAIS mentionner un prix dans l'app, ne JAMAIS proposer un bouton "S'abonner X €". Apple a une catégorie d'apps "Reader" qui permet de pointer vers le web pour la conversion **uniquement** si l'app n'affiche aucun montant à l'écran. Cf. WEB_FLOW_AUDIT §9 + REFONTE_BRIEF point 6.

---

### S5-T01: Configuration `eas.json` profils production

- **Statut :** todo
- **Estimation :** S (~50 LOC, med)
- **Dépendances :** aucune
- **Fichiers :** `eas.json`
- **Critères d'acceptance :**
  - [ ] Profile `production` iOS + Android distinct de `preview` (et de `development`)
  - [ ] iOS : `bundleIdentifier` final + `buildNumber` auto-incrémenté
  - [ ] Android : `applicationId` final + `versionCode` auto-incrémenté
  - [ ] Variables d'env production injectées : `EXPO_PUBLIC_SUPABASE_URL` (prod), `EXPO_PUBLIC_SUPABASE_ANON_KEY` (prod), `EXPO_PUBLIC_API_URL=https://apexcoach.app`, `EXPO_PUBLIC_SENTRY_DSN` (prod)
  - [ ] Submit config : App Store Connect API key path (iOS) + Play service account JSON path (Android)
- **Notes :** valider que les secrets sont stockés via `eas secret` (pas dans le repo).

### S5-T02: `.well-known/apple-app-site-association` (côté web)

- **Statut :** todo
- **Estimation :** S (~30 LOC, med)
- **Dépendances :** S3-T21 (deep links configurés)
- **Fichiers :** `Apex-Coach/public/.well-known/apple-app-site-association`
- **Critères d'acceptance :**
  - [ ] JSON conforme Apple : `{ applinks: { details: [{ appIDs: ['TEAM_ID.com.apexcoach.app'], paths: [...] }] } }`
  - [ ] Paths inclus : `/auth/confirm-email`, `/auth/reset-password`, `/auth/set-password`, `/redeem`
  - [ ] Content-Type `application/json` servi par Next.js
  - [ ] Validation via Apple AASA Validator (`branch.io/resources/aasa-validator`)
- **Notes :** **Hors scope routine MR2 mobile** — à coder côté web. À déployer **avant** la soumission iOS.

### S5-T03: `.well-known/assetlinks.json` (côté web — Android App Links)

- **Statut :** todo
- **Estimation :** S (~30 LOC, med)
- **Dépendances :** S3-T21
- **Fichiers :** `Apex-Coach/public/.well-known/assetlinks.json`
- **Critères d'acceptance :**
  - [ ] JSON conforme Android : `[{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: 'com.apexcoach.app', sha256_cert_fingerprints: [...] } }]`
  - [ ] SHA256 fingerprint de la clé de signature Play Console (debug + release)
  - [ ] Validation via `https://developers.google.com/digital-asset-links/tools/generator`
- **Notes :** **Hors scope routine MR2 mobile**. À déployer **avant** la soumission Android.

### S5-T04: ASO — Métadonnées App Store iOS

- **Statut :** todo
- **Estimation :** M (~doc + assets, low)
- **Dépendances :** S5-T01
- **Fichiers :** `docs/aso/ios/{title,subtitle,description,keywords}.md` + screenshots
- **Critères d'acceptance :**
  - [ ] Titre 30 chars : « Apex Coach » (ou variante optimisée mots-clés)
  - [ ] Sous-titre 30 chars : « Coaching IA Personnalisé »
  - [ ] Description longue FR (4000 chars) — **AUCUNE mention de prix**, format Reader model
  - [ ] 100 mots-clés (séparés virgules, max 100 chars total)
  - [ ] 8 screenshots iPhone 6.7" (login → questionnaire → programme → entraînement actif → bilan → analytics → profil → recap)
  - [ ] iPad screenshots si déclaré (skippable phase 1)
  - [ ] Vidéo preview optionnelle (15-30s, montrer la valeur)
- **Notes :** **vérifier conformité Reader model** avant submit — la description ne doit jamais dire "14,90€/mois" ou "S'abonner".

### S5-T05: ASO — Métadonnées Google Play

- **Statut :** todo
- **Estimation :** M (~doc + assets, low)
- **Dépendances :** S5-T01
- **Fichiers :** `docs/aso/android/{title,short-description,full-description}.md` + assets
- **Critères d'acceptance :**
  - [ ] Titre 30 chars
  - [ ] Description courte 80 chars
  - [ ] Description longue 4000 chars (**aucun prix mentionné**)
  - [ ] Icône 512×512 + bannière 1024×500
  - [ ] 8 screenshots phone + tablet (optional)
  - [ ] Vidéo YouTube preview (optionnel)
- **Notes :** Google Play est plus permissif que Apple sur les liens externes mais on garde la cohérence Netflix model.

### S5-T06: Build production iOS + soumission TestFlight

- **Statut :** todo
- **Estimation :** S (manuel, high)
- **Dépendances :** S5-T01, S5-T04, S5-T02 (deployed côté web)
- **Fichiers :** —
- **Critères d'acceptance :**
  - [ ] `eas build --profile production --platform ios` réussit
  - [ ] `eas submit --platform ios --latest` réussit
  - [ ] Build visible dans TestFlight
  - [ ] Beta testers ajoutés (au moins toi + 1 utilisateur externe pour 1ère validation)
  - [ ] Build testé via TestFlight (login + 1 flow critique)
- **Notes :** **Manuel par toi** (App Store Connect API key requise). MR5 ne fait QUE preview.

### S5-T07: Build production Android + soumission Play Internal Testing

- **Statut :** todo
- **Estimation :** S (manuel, high)
- **Dépendances :** S5-T01, S5-T05, S5-T03 (deployed côté web)
- **Fichiers :** —
- **Critères d'acceptance :**
  - [ ] `eas build --profile production --platform android` réussit
  - [ ] `eas submit --platform android --latest` réussit
  - [ ] Build visible dans Play Console (Internal Testing track)
  - [ ] Testers ajoutés à la liste internal
  - [ ] Build testé via Play Store (login + 1 flow critique)
- **Notes :** **Manuel par toi** (Google Play service account JSON requis).

### S5-T08: Buffer review Apple/Google + résolution rejets éventuels

- **Statut :** todo
- **Estimation :** L (1-3j, high)
- **Dépendances :** S5-T06, S5-T07
- **Fichiers :** dépend des rejets
- **Critères d'acceptance :**
  - [ ] Soumission depuis TestFlight → Apple Review
  - [ ] Soumission depuis Internal Testing → Production Track Google Play
  - [ ] Si rejet Apple (le plus probable) : analyser le rejection notes, créer ticket de fix immédiat, redéployer
  - [ ] Si rejet Google : idem, mais plus rare
  - [ ] App publiée sur les 2 stores
- **Notes :** **Manuel + réactif**. Risques principaux :
  - **Reader model violation** : prix mentionné dans l'app → fix instantané + re-submit
  - **Demande de comptes test** : fournir credentials via App Store Connect → "App Review Information"
  - **In-App Purchase obligation (Apple §3.1.1)** : argumenter Reader category (apps de coaching, formation, presse, vidéo, livres, musique sont exemptées si elles respectent les règles)
  - **Health data declaration (App Privacy)** : remplir le formulaire App Privacy en cochant les vraies pratiques (collecte santé chiffrée, etc.)
- **Mitigation :** préparer un dossier prêt à l'envoi avec : (a) preuve du modèle Reader, (b) credentials testeur Apple, (c) lien support contact.

---

## Récap des dépendances clés

```
S5-T01 (eas.json) ──► S5-T04 + S5-T05 (ASO) ──► S5-T06 + S5-T07 (Builds + Submit)
S3-T21 (deep links) ──► S5-T02 + S5-T03 (.well-known web) ──► S5-T06 + S5-T07
S5-T06 + S5-T07 ──► S5-T08 (Buffer review)
```

## Vérification end-of-sprint

1. **Builds production** dispos sur EAS dashboard + TestFlight + Play Console
2. **Deep links** validés : tester via Apple AASA Validator + Google Digital Asset Links tool
3. **App testée bout-en-bout** sur TestFlight et Play Internal par au moins 1 user externe
4. **Conformité Reader model** : audit final du code (grep `S'abonner`, `€`, `EUR`, `IAP`, `RevenueCat`, `react-native-iap`, `expo-in-app-purchases` → 0 résultat) + audit des copy ASO
5. **App publiée** sur App Store + Google Play (ou en attente review documentée)
