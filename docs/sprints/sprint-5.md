# Sprint 5 — Publication App Store + Google Play

> **Spec source :** `Apex-Coach/docs/MOBILE_APP_TECHNICAL_SPEC_v2.md` §18 Sprint 5 (Jours 29-32, ~4j + buffer review)
> **Livrable :** app soumise et publiée sur les stores.
> **Total tickets :** 8
> **Note :** ce sprint est essentiellement humain (validations stores). Routines mobile (MR2/MR5) préparent les artefacts mais ne soumettent pas.

---

### S5-T01: Configuration `eas.json` profils production

- **Statut :** todo
- **Estimation :** S (~50 LOC, med)
- **Dépendances :** aucune
- **Fichiers :** `eas.json`
- **Critères d'acceptance :**
  - [ ] Profile `production` iOS + Android distinct de `preview`
  - [ ] Auto-increment build numbers
  - [ ] Variables d'env production injectées

### S5-T02: Page `.well-known/apple-app-site-association` (côté web)

- **Statut :** todo
- **Estimation :** S (~30 LOC, med)
- **Dépendances :** S3-T15
- **Fichiers :** `Apex-Coach/public/.well-known/apple-app-site-association`
- **Notes :** **Hors scope MR2 mobile** — côté web. JSON listant les paths Universal Links (`/payment-success`, `/redeem`).

### S5-T03: Page `.well-known/assetlinks.json` (côté web)

- **Statut :** todo
- **Estimation :** S (~30 LOC, med)
- **Dépendances :** S3-T15
- **Fichiers :** `Apex-Coach/public/.well-known/assetlinks.json`
- **Notes :** **Hors scope MR2 mobile** — côté web. Configuration Android App Links (SHA256 fingerprint Play Console).

### S5-T04: ASO — Métadonnées App Store iOS

- **Statut :** todo
- **Estimation :** M (~doc + assets, low)
- **Dépendances :** S5-T01
- **Fichiers :** `docs/aso/ios/{title,subtitle,description,keywords}.md` + screenshots
- **Critères d'acceptance :**
  - [ ] Titre + sous-titre + description optimisés FR
  - [ ] 100 mots-clés (séparés virgules, max 100 chars)
  - [ ] 8 screenshots iPhone 6.7" + iPad si déclaré
  - [ ] Vidéo preview (optionnel)

### S5-T05: ASO — Métadonnées Google Play

- **Statut :** todo
- **Estimation :** M (~doc + assets, low)
- **Dépendances :** S5-T01
- **Fichiers :** `docs/aso/android/{title,short-description,full-description}.md` + assets
- **Critères d'acceptance :**
  - [ ] Titre 30 chars + court 80 + long 4000
  - [ ] Icône 512×512 + bannière 1024×500
  - [ ] 8 screenshots phone

### S5-T06: Build production iOS + soumission TestFlight

- **Statut :** todo
- **Estimation :** S (manuel, high)
- **Dépendances :** S5-T01, S5-T04
- **Fichiers :** —
- **Notes :** **Manuel par toi** (App Store Connect API key requise). MR5 ne fait QUE preview. Commande : `eas build --profile production --platform ios && eas submit --platform ios`.

### S5-T07: Build production Android + soumission Play Internal Testing

- **Statut :** todo
- **Estimation :** S (manuel, high)
- **Dépendances :** S5-T01, S5-T05
- **Fichiers :** —
- **Notes :** **Manuel par toi** (Google Play service account JSON requis). Commande : `eas build --profile production --platform android && eas submit --platform android`.

### S5-T08: Buffer review Apple/Google + résolution éventuels rejets

- **Statut :** todo
- **Estimation :** L (1-3j, high)
- **Dépendances :** S5-T06, S5-T07
- **Fichiers :** —
- **Notes :** **Manuel + réactif**. Risque principal : Reader model — ne JAMAIS mentionner le prix dans l'app, juste "S'abonner sur le web". Si rejet, créer ticket de fix immédiat.
