# Sprint 3 — Onboarding + Trial + Questionnaire 27 steps + Codes Promo + Paywall info + Tutoriel

> **Spec source :** `Apex-Coach/docs/MOBILE_APP_TECHNICAL_SPEC_v2.md` §18 Sprint 3 (Jours 13-20, ~8j révisé +2j) — **modèle paiement final 04/05/2026 : App gratuite Netflix, paiement uniquement web Stripe**
> **Livrable :** flow App Store install → welcome → (signup + questionnaire + trial 7j gratuit dans l'app) → dashboard. Trial expiré → paywall informational vers apexcoach.app. Tutoriel post-premier-login.
> **Total tickets :** 17 (suppression 5 tickets IAP + 1 ticket page web checkout, refonte 2 tickets, ajout 2 tickets Netflix model)

---

### S3-T01: Welcome slides (3 écrans, modèle Netflix)

- **Statut :** todo
- **Estimation :** M (~150 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `app/(onboarding)/welcome.tsx` + composants `Slide{1,2,3}.tsx`
- **Critères d'acceptance :**
  - [ ] 3 slides (valeur prop : programme IA / progression / résultats)
  - [ ] Indicateur de slide en bas
  - [ ] Swipe + tap "Suivant" + skip
  - [ ] Slide 3 : 2 CTA — « Démarrer mon essai gratuit » (déclenche le questionnaire mobile, S3-T03+) + « J'ai déjà un compte » (vers `(auth)/login`)
  - [ ] **Aucune mention de prix** dans les 3 slides (modèle Netflix : app gratuite à l'install)

### S3-T02: Layout questionnaire `(onboarding)/questionnaire/_layout.tsx`

- **Statut :** todo
- **Estimation :** S (~80 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `app/(onboarding)/questionnaire/_layout.tsx`
- **Notes :** progress bar + bouton retour + persist état dans store. Anim entre micro-steps via `react-native-reanimated`.

### S3-T03 → S3-T08: Questionnaire Step 1 à 6 (27 micro-steps)

> Fragmenter en 6 tickets, 1 par step. Chaque step = ~150-250 LOC.

- **S3-T03 Step 1 (Profil)** : ~5 micro-steps (genre, âge, taille, poids, ville)
- **S3-T04 Step 2 (Objectifs)** : ~4 micro-steps
- **S3-T05 Step 3 (Expérience)** : ~5 micro-steps
- **S3-T06 Step 4 (Disponibilité + jeûne)** : ~4 micro-steps
- **S3-T07 Step 5 (Santé)** : ~5 micro-steps (chiffrement délégué au serveur, Spec §10)
- **S3-T08 Step 6 (Équipement)** : ~4 micro-steps
- **Critères d'acceptance communs :**
  - [ ] Préload step suivant (Spec §19 mitigation latence)
  - [ ] Validation Zod via `lib/validations/step{N}.ts`
  - [ ] Persist état questionnaire dans store
  - [ ] Skeletons + empty states

### S3-T09: Récap + création compte trial

- **Statut :** todo
- **Estimation :** M (~200 LOC, high)
- **Dépendances :** S3-T03 à S3-T08, S3-T10
- **Fichiers :** `app/(onboarding)/questionnaire/recap.tsx`
- **Critères d'acceptance :**
  - [ ] Récap des réponses (groupé par section)
  - [ ] Champ email + acceptation CGU
  - [ ] POST `/api/auth/create-trial-account` avec questionnaire + fingerprint
  - [ ] Gestion erreur anti-abus (toast clair)
  - [ ] Stocke session retournée dans `useAuthStore`
  - [ ] Redirige vers `(tabs)/programme`

### S3-T10: `lib/device-fingerprint.ts` (anti-abus mobile)

- **Statut :** todo
- **Estimation :** M (~120 LOC, high)
- **Dépendances :** aucune
- **Fichiers :** `lib/device-fingerprint.ts` + test
- **Notes :** combiner `expo-device` (modèle, OS, locale) + `expo-crypto` (hash stable) + IP côté serveur. Voir Spec §5.6.

### S3-T11: Écran `(auth)/redeem.tsx` (rédemption code promo)

- **Statut :** todo
- **Estimation :** M (~180 LOC, med)
- **Dépendances :** S3-T12
- **Fichiers :** `app/(auth)/redeem.tsx`
- **Critères d'acceptance :**
  - [ ] Saisie code (6-12 chars upper)
  - [ ] Validation côté client (regex) puis serveur (POST `/api/promo/validate`)
  - [ ] Affiche détails offre si valide (plan, durée, partenaire)
  - [ ] CTA "Continuer le questionnaire"
  - [ ] Gestion erreurs (code invalide / expiré / déjà utilisé)

### S3-T12: `lib/validations/promo-code.ts`

- **Statut :** todo
- **Estimation :** S (~50 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `lib/validations/promo-code.ts` + test
- **Notes :** copier du web `Apex-Coach/lib/validations/promo-code.ts` puis adapter (zéro changement attendu).

### S3-T13: Modal `(modals)/paywall.tsx` (PaywallInformational, modèle Netflix)

- **Statut :** todo
- **Estimation :** M (~180 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `app/(modals)/paywall.tsx`, `components/subscription/PaywallInformational.tsx`
- **Critères d'acceptance :**
  - [ ] Visuel valorisant (image + texte) — **aucun prix affiché** (Apple/Google n'autorise pas les CTA d'achat externes affichant un prix)
  - [ ] Texte type : « Continue ton aventure Apex Coach » + bénéfices clés
  - [ ] CTA principal : « Continuer sur le web » → `WebBrowser.openBrowserAsync('https://www.apexcoach.app/pricing?utm_source=ios_app&utm_campaign=paywall_trial_expired')`
  - [ ] CTA secondaire : « Plus tard » (ferme la modal)
  - [ ] Trigger : trial expiré, tap feature locked, J-1 avant expiration
  - [ ] Tracking : événement analytics `paywall_viewed` avec trigger

### ~~S3-T14: Page web `/checkout/mobile`~~ **SUPPRIMÉ 03/05/2026**

> Le passage à l'IAP natif élimine le besoin d'une page web de checkout. Stripe reste utilisé côté web uniquement.

### S3-T15: Configuration deep links Universal/App Links (simplifié IAP)

- **Statut :** todo
- **Estimation :** M (~80 LOC, high)
- **Dépendances :** aucune
- **Fichiers :** `app.json` (intent filters Android, associated domains iOS), `lib/deep-linking.ts`
- **Notes :** scheme `apexcoach://` + `applinks:apexcoach.app`. Routes : `/redeem` (uniquement — payment-success n'existe plus, IAP géré inline). Voir Spec §14.

### ~~S3-T16: Écran `(payment)/checkout.tsx` (retour browser)~~ **SUPPRIMÉ 03/05/2026**

> IAP géré inline dans le paywall, pas de retour browser à intercepter.

### S3-T17: Écran `(auth)/set-password.tsx` (post-trial / promo)

- **Statut :** todo
- **Estimation :** M (~140 LOC, low)
- **Dépendances :** S3-T15
- **Fichiers :** `app/(auth)/set-password.tsx` (à compléter — placeholder Sprint 1)
- **Critères d'acceptance :**
  - [ ] Récupère token depuis deep link `apexcoach://set-password?token=X`
  - [ ] Form mot de passe + confirmation
  - [ ] POST `/api/auth/update-password` puis auto-login

### S3-T18: Composant `FeatureGate` (gate accès fonctionnalité)

- **Statut :** todo
- **Estimation :** S (~80 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/subscription/FeatureGate.tsx`
- **Notes :** wrap children, affiche CTA upgrade si plan insuffisant. Trigger paywall.

---

## Tickets ajoutés 04/05/2026 (modèle Netflix + tutoriel)

### S3-T19: Welcome non-connecté + CTA browser vers apexcoach.app

- **Statut :** todo
- **Estimation :** S (~120 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `app/(auth)/_layout.tsx` ou `app/index.tsx` (logique guard auth), `components/auth/UnauthenticatedHero.tsx`
- **Critères d'acceptance :**
  - [ ] Si `useAuth().session === null` ET pas en flow d'onboarding → afficher hero "Bienvenue sur Apex Coach"
  - [ ] Texte : « Crée ton compte sur apexcoach.app pour commencer ton essai gratuit. Déjà inscrit ? Connecte-toi. »
  - [ ] CTA primaire : « Créer mon compte » → `WebBrowser.openBrowserAsync('https://www.apexcoach.app/?utm_source=ios_app&utm_medium=app&utm_campaign=signup')`
  - [ ] CTA secondaire : « J'ai déjà un compte » → `(auth)/login`
  - [ ] Lien tertiaire : « J'ai un code promo » → `(auth)/redeem`
- **Notes :** ce ticket est complémentaire à S3-T01. S3-T01 = welcome slides après tap "Démarrer mon essai gratuit" depuis ce hero, ou directement après install. À designer ensemble.

### S3-T20: Hook `useAppAttribution` (Apple Search Ads + UTM)

- **Statut :** todo
- **Estimation :** M (~150 LOC, med)
- **Dépendances :** aucune
- **Fichiers :** `hooks/useAppAttribution.ts`, `lib/attribution/{apple,google}.ts`
- **Critères d'acceptance :**
  - [ ] iOS : Apple Ads Attribution API (AdAttributionKit ou AAAttribution.attributionToken). Fallback ATT prompt + IDFA si user accepte.
  - [ ] Android : Play Install Referrer API (`react-native-play-install-referrer`)
  - [ ] Persistance des params attribution dans le profile Supabase au signup
  - [ ] UTM `source=ios_app|android_app` automatiquement injecté dans tous les `WebBrowser.openBrowserAsync` du codebase (helper `lib/web-browser.ts`)
- **Notes :** ATT (App Tracking Transparency) prompt iOS — demander permission au moment opportun (après valeur démontrée, pas au lancement). Voir Spec §19.

### S3-T24: Onboarding tutoriel 5 tabs post-premier-login

- **Statut :** todo
- **Estimation :** M (~200 LOC, low)
- **Dépendances :** S2-T05
- **Fichiers :** `components/onboarding/TabsTour.tsx`, `app/_layout.tsx` (wrap après auth)
- **Critères d'acceptance :**
  - [ ] Détecte `is_first_login` via flag `useSettings().tutorialSeen` ou date `created_at` de la session
  - [ ] Affiche 5 tooltips coachmarks séquentiels sur chaque tab (Programme, Workout, Nutrition, Progrès, Profil)
  - [ ] Skip à tout moment + "Plus afficher" (set flag persistant)
  - [ ] Animation fluide via `react-native-reanimated`
  - [ ] Re-déclenchable depuis Profil → "Revoir le tutoriel"
- **Notes :** différent du Welcome (S3-T01) qui se passe AVANT signup. Ici c'est APRÈS le premier login, dans le dashboard.
