# Sprint 3 — Onboarding + Trial + Questionnaire 24 micro-steps + Codes Promo + Paywall info + Tutoriel

> **Source de vérité :** `docs/sprints/WEB_FLOW_AUDIT.md` (sections 5.1 à 5.13 + 6.6 et 6.7 + 7.6 et 8.1 à 8.5)
> **Livrable :** flow complet App ouverte → welcome non-connecté → (signup browser OU questionnaire 24 micro-steps + trial 7j gratuit + set-password deep link) → dashboard. Trial expiré → paywall **info-only** vers `apexcoach.app` (modèle Netflix : zéro IAP, zéro prix affiché).
> **Total tickets :** 26 (numérotation séquentielle T01 → T26)

> **Décision Netflix model (04/05/2026 finale) :** App 100% gratuite. Aucun paiement in-app, aucun prix affiché. Toute conversion payante → `WebBrowser.openBrowserAsync('https://www.apexcoach.app/checkout?utm_source=ios_app|android_app')`. Cette règle s'applique à **tous** les tickets de ce sprint.

---

## A — Welcome non-connecté + entrée onboarding

> Web : il n'existe pas d'écran "welcome" web équivalent (la landing est `app/page.tsx`, hors scope mobile). C'est un écran **propre au mobile**, qui sert de pont entre l'install et soit la conversion (browser) soit le login.

### S3-T01: Écran `welcome-unauthenticated.tsx` + CTA browser

- **Statut :** todo
- **Estimation :** M (~150 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `app/index.tsx` (logique guard auth), `app/(auth)/welcome.tsx` (nouveau), `components/auth/UnauthenticatedHero.tsx`, `lib/web-browser.ts` (helper UTM)
- **Critères d'acceptance :**
  - [ ] Si `useAuth().session === null` et pas en flow onboarding → afficher hero "Bienvenue sur Apex Coach"
  - [ ] Texte : « Crée ton compte sur apexcoach.app pour commencer ton essai gratuit. »
  - [ ] CTA primaire : « Démarrer mon essai gratuit » → `WebBrowser.openBrowserAsync('https://www.apexcoach.app/?utm_source=ios_app|android_app&utm_campaign=signup')`
  - [ ] CTA secondaire : « J'ai déjà un compte » → `app/(auth)/login`
  - [ ] CTA tertiaire : « J'ai un code promo » → `app/(onboarding)/redeem`
  - [ ] **Aucun prix affiché**, **aucun bouton "S'abonner X €"**
  - [ ] Helper `lib/web-browser.ts` injecte automatiquement les UTM `source=ios_app|android_app` sur toute redirection externe
  - [ ] 2 tests (rendu + tap CTA déclenche `openBrowserAsync` avec UTM)
- **Mirror web :** pas de mirror direct. La copy s'inspire de `landing/StickyCTA.tsx` mais reformulée pour mobile.
- **Notes :** entrée principale de l'app mobile. **Critique** : un user qui ouvre l'app sans compte doit comprendre en 5s qu'il faut passer par le site pour démarrer.

---

## B — Auth flows (mirror `(auth)/*` et `auth/*` web)

### S3-T02: Login polish + redirect vers welcome si signout (mirror `/login`)

- **Statut :** todo (polish — base livrée Sprint 1)
- **Estimation :** S (~80 LOC, low)
- **Dépendances :** S3-T01
- **Fichiers :** `app/(auth)/login.tsx`
- **Critères d'acceptance :**
  - [ ] Lien "Mot de passe oublié ?" → `app/(auth)/forgot-password`
  - [ ] Lien "Pas encore de compte ?" → `app/(auth)/welcome` (pas vers signup mobile direct)
  - [ ] Après signout, redirect → `app/(auth)/welcome` (pas vers login)
  - [ ] Toast d'erreur clair en cas de credentials invalides
- **Mirror web :** `app/(auth)/login/page.tsx` (cf. WEB_FLOW_AUDIT §5.1)

### S3-T03: Écran `(auth)/set-password.tsx` (mirror `/auth/set-password`)

- **Statut :** todo
- **Estimation :** M (~180 LOC, med)
- **Dépendances :** S3-T21 (deep linking)
- **Fichiers :** `app/(auth)/set-password.tsx`, `lib/auth/set-password-flow.ts`
- **Critères d'acceptance :**
  - [ ] Récupère `token` et `flow` (promo|trial) depuis deep link `apexcoach://auth/set-password?token=...`
  - [ ] **Flow Stripe non géré** (côté mobile l'utilisateur ne voit jamais ce flow — le paiement se fait dans le browser)
  - [ ] Vérifie le token : `POST /api/auth/verify-promo-token` (flow promo) ou identifier le flow trial via la session pending
  - [ ] Form mot de passe + confirmation + indicateur force (faible/moyen/fort)
  - [ ] Submit → `POST /api/auth/set-initial-password` → stocke tokens dans `useAuthStore` → redirect selon le plan résultant : si `subscription.plan_id === 'coaching_pro'` (peut arriver via un promo Pro ou un trial Pro 7j) → `/(onboarding)/nutrition-preferences` (S3-T24) ; sinon → `/(tabs)/programme`. Le flow Stripe (mobile reçoit un user déjà payant Pro) **n'est jamais déclenché depuis l'app** — il revient via deep link `apexcoach://auth/set-password?session_id=...` seulement après checkout browser
  - [ ] Toast erreur si token expiré + CTA "Demander un nouveau lien"
  - [ ] 2 tests (rendu form + submit avec mock API)
- **Mirror web :** `app/auth/set-password/page.tsx` (cf. WEB_FLOW_AUDIT §5.5)

### S3-T04: Écran `(auth)/reset-password.tsx` (mirror `/auth/reset-password`)

- **Statut :** todo
- **Estimation :** M (~150 LOC, med)
- **Dépendances :** S3-T21
- **Fichiers :** `app/(auth)/reset-password.tsx`
- **Critères d'acceptance :**
  - [ ] Récupéré via deep link Supabase recovery (`apexcoach://auth/reset-password?type=recovery`)
  - [ ] Vérifie `supabase.auth.getUser()` (recovery token actif) ; sinon redirect `/(auth)/forgot-password` avec param `expired=true`
  - [ ] Form nouveau mot de passe + confirmation + indicateur force
  - [ ] Submit → `supabase.auth.updateUser({ password })` puis `POST /api/auth/log-password-change` → redirect `/programme`
  - [ ] 2 tests (rendu + submit OK + erreur)
- **Mirror web :** `app/auth/reset-password/page.tsx` (cf. WEB_FLOW_AUDIT §5.6)

### S3-T05: Écran `(auth)/confirm-email.tsx` (mirror `/auth/confirm-email`)

- **Statut :** todo
- **Estimation :** S (~80 LOC, low)
- **Dépendances :** S3-T21
- **Fichiers :** `app/(auth)/confirm-email.tsx`
- **Critères d'acceptance :**
  - [ ] Affiché via deep link `apexcoach://auth/confirm-email` (Supabase a déjà traité le lien email)
  - [ ] Écran de succès : "Email confirmé ✓" + CTA "Se connecter" → `/(auth)/login`
  - [ ] Si erreur (lien expiré) : CTA "Renvoyer l'email" → `POST /api/auth/resend-confirmation`
- **Mirror web :** `app/auth/confirm-email/page.tsx` (cf. WEB_FLOW_AUDIT §5.4)

---

## C — Onboarding questionnaire (mirror `/questionnaire` → `recap` → `success`)

> Web : `app/questionnaire/page.tsx` orchestre 24 micro-steps via `QuestionnaireFlow` + `QuestionnaireContext`. Validation Zod par cluster (steps 1-6 déjà copiés mobile sous `lib/validations/`). Animations : `ImmersiveBackground` + `MilestoneCelebration`. Submit final → server action → `/questionnaire/success` avec polling.

### S3-T06: Layout + orchestrateur `QuestionnaireFlow`

- **Statut :** todo
- **Estimation :** M (~200 LOC, med)
- **Dépendances :** S3-T01
- **Fichiers :** `app/(onboarding)/questionnaire/_layout.tsx`, `app/(onboarding)/questionnaire/index.tsx`, `components/questionnaire/QuestionnaireFlow.tsx`, `components/questionnaire/QuestionnaireContext.tsx`, `stores/questionnaire.ts`
- **Critères d'acceptance :**
  - [ ] `_layout.tsx` : header avec progress bar (mirror `ImmersiveProgress`) + bouton retour
  - [ ] `QuestionnaireFlow` orchestre la séquence des 24 steps en fonction de l'index actuel
  - [ ] State persisté dans `stores/questionnaire.ts` + Supabase (server action `createPendingQuestionnaire`) à chaque step pour survivre au crash app
  - [ ] Animation transition entre steps via `react-native-reanimated` (slide horizontal 300ms)
  - [ ] `ImmersiveBackground` adaptatif (mirror dégradé Framer Motion → Reanimated)
  - [ ] Boutons "Précédent" / "Suivant" / "Passer" (selon step optionnel)
- **Mirror web :** `app/questionnaire/page.tsx` + `components/questionnaire-v2/{QuestionnaireFlow,QuestionnaireContext,ImmersiveBackground,ImmersiveProgress,NavigationControls}.tsx`
- **Notes :** la validation Zod réutilise `lib/validations/step{1..6}.ts` déjà copiés du web (Sprint 1).

### S3-T07: Cluster Profil — 5 micro-steps (Name, Age, Height, Weight, Sex)

- **Statut :** todo
- **Estimation :** L (~280 LOC, low)
- **Dépendances :** S3-T06
- **Fichiers :** `components/questionnaire/steps/Profile{Name,Age,Height,Weight,Sex}Step.tsx`, `__tests__/components/questionnaire/profile.test.tsx`
- **Critères d'acceptance :**
  - [ ] Mirror UX web : 1 question par écran, input/select adapté à RN (TextInput, Picker, slider de taille)
  - [ ] Validation via `lib/validations/step1.ts` (déjà copié)
  - [ ] Persiste réponse dans store à chaque "Suivant"
  - [ ] Préload du composant du step suivant (`import()` dynamique ou prefetch) pour éviter le flash blanc à la transition
  - [ ] 1 test par step (5 tests)
- **Mirror web :** `components/questionnaire-v2/steps/Profile{Name,Age,Height,Weight,Sex}Step.tsx`

### S3-T08: Cluster Expérience — 3 micro-steps (Level, History, Validation)

- **Statut :** todo
- **Estimation :** M (~180 LOC, low)
- **Dépendances :** S3-T06
- **Fichiers :** `components/questionnaire/steps/Experience{Level,History,Validation}Step.tsx`
- **Critères d'acceptance :**
  - [ ] Mirror cluster Experience web (radio cards animées via `SelectionQuestion` + `AnimatedCard`)
  - [ ] Validation `lib/validations/step2.ts`
  - [ ] `ExperienceValidationStep` affiche le résumé conditionnel selon level + history
- **Mirror web :** `components/questionnaire-v2/steps/Experience*Step.tsx`

### S3-T09: Cluster Objectifs — 4 micro-steps (Primary, Secondary, Conditional, SportGoals)

- **Statut :** todo
- **Estimation :** L (~280 LOC, med)
- **Dépendances :** S3-T06
- **Fichiers :** `components/questionnaire/steps/Goals{Primary,Secondary,Conditional,Sport}Step.tsx`
- **Critères d'acceptance :**
  - [ ] `GoalsPrimaryStep` : 4 options (muscle / sèche / force / endurance) — radio cards
  - [ ] `GoalsSecondaryStep` : multi-sélection conditionnelle
  - [ ] `GoalsConditionalStep` : question dynamique selon le choix primaire
  - [ ] `SportGoalsStep` : si "performance sport" → sélection sport + date événement
  - [ ] Validation `lib/validations/step3.ts`
- **Mirror web :** `components/questionnaire-v2/steps/Goals*Step.tsx` + `SportGoalsStep.tsx`

### S3-T10: Cluster Disponibilité — 3 micro-steps (Frequency, Duration, Location)

- **Statut :** todo
- **Estimation :** M (~200 LOC, low)
- **Dépendances :** S3-T06
- **Fichiers :** `components/questionnaire/steps/Availability{Frequency,Duration,Location}Step.tsx`
- **Critères d'acceptance :**
  - [ ] `Frequency` : 2 à 6 jours/semaine
  - [ ] `Duration` : 30 / 45 / 60 / 75 / 90 min par séance
  - [ ] `Location` : home / gym / both
  - [ ] Validation `lib/validations/step4.ts`
- **Mirror web :** `components/questionnaire-v2/steps/Availability*Step.tsx`

### S3-T11: Cluster Équipement + Préférences exos — 3 micro-steps

- **Statut :** todo
- **Estimation :** M (~220 LOC, low)
- **Dépendances :** S3-T06
- **Fichiers :** `components/questionnaire/steps/Equipment{Selection,Preferences}Step.tsx`, `ExercisePreferencesStep.tsx`
- **Critères d'acceptance :**
  - [ ] `EquipmentSelection` : multi-checkbox (haltères, barres, machines, câbles, élastiques, kettlebells)
  - [ ] `EquipmentPreferences` : préférences détaillées (poids dispo, kettlebell poids, etc.)
  - [ ] `ExercisePreferences` : types préférés (compound / isolation / cardio / mobilité)
  - [ ] Validation `lib/validations/step6.ts`
- **Mirror web :** `components/questionnaire-v2/steps/Equipment*Step.tsx` + `ExercisePreferencesStep.tsx`

### S3-T12: Cluster Lifestyle + Fasting — 2 micro-steps

- **Statut :** todo
- **Estimation :** M (~180 LOC, low)
- **Dépendances :** S3-T06
- **Fichiers :** `components/questionnaire/steps/{Lifestyle,Fasting}Step.tsx`
- **Critères d'acceptance :**
  - [ ] `LifestyleStep` : sliders sommeil / stress / alcool
  - [ ] `FastingStep` : opt-in jeûne intermittent + créneau (12h / 14h / 16h)
  - [ ] Validation correspondante (créer schema si manque)
- **Mirror web :** `components/questionnaire-v2/steps/{LifestyleStep,FastingStep}.tsx`

### S3-T13: Cluster Santé — 4 micro-steps + `HealthDataConsentModal`

- **Statut :** todo
- **Estimation :** L (~320 LOC, high)
- **Dépendances :** S3-T06
- **Fichiers :** `components/questionnaire/steps/Health{Disclaimer,Conditions,Medications}Step.tsx`, `PastInjuriesStep.tsx`, `components/questionnaire/HealthDataConsentModal.tsx`
- **Critères d'acceptance :**
  - [ ] `HealthDataConsentModal` (cf. WEB_FLOW_AUDIT §6.6) : 4 checkboxes RGPD obligatoires + scroll-to-bottom requis avant validation
  - [ ] `HealthDisclaimerStep` : message disclaimer santé + acceptation
  - [ ] `HealthConditionsStep` : multi-checkbox (asthme, hypertension, diabète, etc.)
  - [ ] `HealthMedicationsStep` : textarea (médicaments actuels)
  - [ ] `PastInjuriesStep` : multi-checkbox + détails optionnels
  - [ ] **Chiffrement des données santé côté serveur** : le frontend envoie en clair via HTTPS, l'API route `/api/questionnaire/submit` stocke chiffré en DB (clé `HEALTH_DATA_ENCRYPTION_KEY` côté serveur). **Ne JAMAIS stocker les données santé en clair localement** (SecureStore ou AsyncStorage exclus)
  - [ ] Validation `lib/validations/step5.ts`
  - [ ] 4 tests (un par step + 1 pour le consent modal scroll-to-bottom)
- **Mirror web :** `components/questionnaire-v2/steps/Health*Step.tsx` + `HealthDataConsentModal.tsx`
- **Notes :** RGPD critique — ne pas court-circuiter le consent.

### S3-T14: `MilestoneCelebration` entre clusters

- **Statut :** todo
- **Estimation :** S (~120 LOC, low)
- **Dépendances :** S3-T06
- **Fichiers :** `components/questionnaire/MilestoneCelebration.tsx`
- **Critères d'acceptance :**
  - [ ] Écran de transition après chaque cluster (Profil ✓ / Expérience ✓ / Objectifs ✓ ...)
  - [ ] Animation confetti via `react-native-confetti-cannon` ou équivalent
  - [ ] Message motivationnel personnalisé (mirror copy web)
  - [ ] Auto-dismiss après 2s ou tap pour skip
- **Mirror web :** `components/questionnaire-v2/MilestoneCelebration.tsx`

### S3-T15: Récap + edit par section + submit final

- **Statut :** todo
- **Estimation :** M (~220 LOC, high)
- **Dépendances :** S3-T07 → S3-T13, S3-T16 (device fingerprint)
- **Fichiers :** `app/(onboarding)/questionnaire/recap.tsx`
- **Critères d'acceptance :**
  - [ ] Récap des réponses regroupé par cluster (Profil, Expérience, Objectifs, Dispo, Équipement, Santé, Lifestyle)
  - [ ] Bouton "Modifier" par section → ré-ouvre le cluster en mode édition
  - [ ] Champ email + acceptation CGU (lien browser vers `/legal/terms`)
  - [ ] CTA "Valider et générer mon programme" → `POST /api/auth/create-trial-account` avec questionnaire + device fingerprint
  - [ ] Stocke tokens dans `useAuthStore`
  - [ ] Redirige vers `/questionnaire/success` (loader génération)
  - [ ] Gestion erreur anti-abus (toast clair)
- **Mirror web :** `app/questionnaire/recap/page.tsx` (cf. WEB_FLOW_AUDIT §5.8)

### S3-T16: `lib/device-fingerprint.ts` (anti-abus mobile)

- **Statut :** todo
- **Estimation :** M (~120 LOC, high)
- **Dépendances :** aucune
- **Fichiers :** `lib/device-fingerprint.ts` + test
- **Critères d'acceptance :**
  - [ ] Combine `expo-device` (model, OS, locale) + `expo-crypto` (hash stable) + IP côté serveur
  - [ ] Fonction `getDeviceFingerprint()` async qui retourne `{ fingerprint, deviceInfo }`
  - [ ] Stable entre sessions (même fingerprint sur le même device)
  - [ ] Test : 2 appels successifs retournent le même fingerprint
- **Notes :** anti-abus contre la création multiple de trials depuis le même device. Combinaison `expo-device` (modèle + OS + locale) + `expo-crypto` (SHA-256 d'un seed local persistant) pour obtenir un identifiant stable mais non-trackable cross-app. Le serveur recoupe avec l'IP au moment du `POST /api/auth/create-trial-account` (limite : 1 trial / fingerprint / 90j).

### S3-T17: Écran `/questionnaire/success` (loader génération + polling)

- **Statut :** todo
- **Estimation :** M (~180 LOC, med)
- **Dépendances :** S3-T15
- **Fichiers :** `app/(onboarding)/questionnaire/success.tsx`, `components/programme/ProgramGenerationProgress.tsx`
- **Critères d'acceptance :**
  - [ ] Loader full-screen avec animation (mirror `ProgramGenerationProgress` web)
  - [ ] Polling Supabase `programs.status` toutes les 3s (max 90s)
  - [ ] Message évolutif : "Analyse de tes réponses..." → "Création de ton programme..." → "Prêt !"
  - [ ] Si Pro → enchaîne sur génération nutrition (autre polling) avant de quitter l'écran
  - [ ] Succès → redirect `/(tabs)/programme`
  - [ ] Échec (timeout ou status `failed`) → toast + CTA "Réessayer"
- **Mirror web :** `app/questionnaire/success/page.tsx` + `components/programme/ProgramGenerationProgress.tsx`

---

## D — Redeem code promo (mirror `/redeem`)

### S3-T18: Écran `(onboarding)/redeem.tsx`

- **Statut :** todo
- **Estimation :** M (~180 LOC, med)
- **Dépendances :** S3-T19
- **Fichiers :** `app/(onboarding)/redeem.tsx`
- **Critères d'acceptance :**
  - [ ] Input code (6-12 chars upper) + validation regex côté client
  - [ ] Submit → `POST /api/promo/validate` → affiche détails offre si valide (plan, durée, partenaire)
  - [ ] CTA "Démarrer mon onboarding" → enchaîne sur questionnaire → set-password flow promo
  - [ ] Gestion erreurs (code invalide / expiré / déjà utilisé) avec toast clair
  - [ ] Tap "J'ai déjà un compte" → `/(auth)/login`
- **Mirror web :** `app/redeem/page.tsx` (cf. WEB_FLOW_AUDIT §5.10)
- **Notes :** signup gratuit — Apple OK (Netflix model).

### S3-T19: `lib/validations/promo-code.ts`

- **Statut :** todo
- **Estimation :** S (~50 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `lib/validations/promo-code.ts` + test
- **Notes :** copier de `Apex-Coach/lib/validations/promo-code.ts` (déjà existant côté web).

---

## E — Paywall info-only (mirror `TrialPaywall` + `PaywallCard`, version Netflix)

### S3-T20: Modal `(modals)/paywall.tsx` (info-only, zéro IAP)

- **Statut :** todo
- **Estimation :** M (~200 LOC, low)
- **Dépendances :** S3-T23 (helper UTM)
- **Fichiers :** `app/(modals)/paywall.tsx`, `components/subscription/PaywallInformational.tsx`
- **Critères d'acceptance :**
  - [ ] Visuel valorisant (image + texte) — **aucun prix affiché**, **aucun bouton "S'abonner X €"**
  - [ ] Texte type : « Continue ton aventure Apex Coach » + bénéfices clés (programme IA / progression / nutrition Pro)
  - [ ] CTA principal : « Continuer sur le web » → `openExternalWithUTM('https://www.apexcoach.app/checkout?utm_source=ios_app|android_app&utm_campaign=paywall_trial_expired')`
  - [ ] CTA secondaire : « Plus tard » (ferme le modal)
  - [ ] Triggers : tap feature locked (TrialBanner J-0 / PromoExpiryBanner J-1 / tap tab gated quand subscription !active)
  - [ ] Tracking : `paywall_viewed` event (Sentry context tag `trigger`)
  - [ ] **Aucun appel à `expo-in-app-purchases` ou `react-native-iap` dans le repo**
- **Mirror web :** `components/subscription/{TrialPaywall,PaywallCard}.tsx` (cf. WEB_FLOW_AUDIT §7.5)
- **Notes :** **bloquant App Store si non respecté**. Voir REFONTE_BRIEF point 6 : « Toute conversion = WebBrowser ».

---

## F — Deep linking + attribution stores

### S3-T21: Configuration deep links Universal/App Links

- **Statut :** todo
- **Estimation :** M (~80 LOC, high)
- **Dépendances :** aucune
- **Fichiers :** `app.json` (intent filters Android, associated domains iOS), `lib/deep-linking.ts`
- **Critères d'acceptance :**
  - [ ] `scheme: 'apexcoach'` + `associatedDomains: ['applinks:apexcoach.app']`
  - [ ] Routes deep linkables :
    - `apexcoach://auth/confirm-email`
    - `apexcoach://auth/reset-password?type=recovery`
    - `apexcoach://auth/set-password?token=...&flow=promo|trial`
    - `apexcoach://redeem?code=...`
  - [ ] `lib/deep-linking.ts` : helper de parsing + dispatcher vers route Expo Router
  - [ ] Tests : 3 deep links simulés → routes correctes
- **Notes :** prérequis pour les tickets auth (S3-T03 set-password, S3-T04 reset, S3-T05 confirm).

### S3-T22: Hook `useAppAttribution` (Apple Search Ads + Play Install Referrer)

- **Statut :** todo
- **Estimation :** M (~180 LOC, med)
- **Dépendances :** aucune
- **Fichiers :** `hooks/useAppAttribution.ts`, `lib/attribution/{apple,google}.ts`
- **Critères d'acceptance :**
  - [ ] iOS : Apple Ads Attribution API (`AdAttributionKit` ou `AAAttribution.attributionToken`). Fallback ATT prompt + IDFA si user accepte
  - [ ] Android : Play Install Referrer API (`react-native-play-install-referrer`)
  - [ ] Persiste les params d'attribution dans le profile Supabase au signup (POST `/api/user/attribution`)
  - [ ] Tests : 2 mocks (iOS attribution token reçu, Android referrer reçu)
- **Notes :** ATT prompt iOS — au moment opportun (après 1ʳᵉ valeur démontrée, pas au lancement).

### S3-T23: Helper `lib/web-browser.ts` (injection UTM systématique)

- **Statut :** todo
- **Estimation :** S (~80 LOC, low)
- **Dépendances :** S3-T22 (optionnel, pour ajouter aussi `attribution_token`)
- **Fichiers :** `lib/web-browser.ts`
- **Critères d'acceptance :**
  - [ ] Fonction `openExternalWithUTM(url, params?)` qui :
    - Détecte la plateforme (`Platform.OS`)
    - Injecte `utm_source=ios_app|android_app` automatiquement
    - Permet d'ajouter `utm_campaign`, `utm_medium`, etc.
    - Appelle `WebBrowser.openBrowserAsync(finalUrl)`
  - [ ] Tests : 2 cas (iOS + Android) → URL finale correcte
- **Notes :** **tous** les CTA "continuer sur le web" du codebase doivent passer par ce helper.

---

## G — Nutrition Preferences post-signup Pro (mirror `/nutrition/preferences`)

### S3-T24: Écran `(onboarding)/nutrition-preferences.tsx`

- **Statut :** todo
- **Estimation :** M (~250 LOC, med)
- **Dépendances :** S3-T03 (set-password flow)
- **Fichiers :** `app/(onboarding)/nutrition-preferences.tsx`, `components/nutrition/PreferencesForm.tsx`
- **Critères d'acceptance :**
  - [ ] Affiché uniquement si le user vient de set-password en flow Pro (sinon skip vers `/programme`)
  - [ ] Form : régime (omnivore / végétarien / végan / autre), allergies (multi-checkbox), dégoûts (chips), calories cible (optional), repas/jour (3-5)
  - [ ] Validation Zod via `lib/validations/nutrition-preferences.ts` (déjà copié)
  - [ ] Submit → server action UPSERT `user_nutrition_preferences` → redirect `/(tabs)/programme` (déclenche la génération nutrition en background)
  - [ ] Skip possible avec valeurs par défaut
- **Mirror web :** `app/nutrition/preferences/page.tsx` (cf. WEB_FLOW_AUDIT §5.13)

---

## H — Tutoriel post-premier-login

### S3-T25: Onboarding tutoriel 5 tabs (coachmarks séquentiels)

- **Statut :** todo
- **Estimation :** M (~220 LOC, low)
- **Dépendances :** S2-T05 (tab Programme livré)
- **Fichiers :** `components/onboarding/TabsTour.tsx`, `app/_layout.tsx` (wrap après auth)
- **Critères d'acceptance :**
  - [ ] Détecte `is_first_login` via flag `useSettings().tutorialSeen === false`
  - [ ] 5 tooltips séquentiels sur chaque tab (Programme, Entraînement, Nutrition, Bilan, Profil) avec mini-description et highlight
  - [ ] Skip à tout moment + "Ne plus afficher" (set flag persistant via SecureStore)
  - [ ] Animation fluide via `react-native-reanimated`
  - [ ] Re-déclenchable depuis Profil → "Revoir le tutoriel"
  - [ ] 2 tests (rendu first-login + skip persiste)
- **Mirror web :** pas d'équivalent (le web onboarding suffit). Spécifique mobile.

---

## I — Banners trigger paywall info (mirror logique web)

### S3-T26: Connecter `TrialBanner` + `PromoExpiryBanner` au modal paywall

- **Statut :** todo
- **Estimation :** S (~60 LOC, low)
- **Dépendances :** S2-T13, S2-T14, S3-T20
- **Fichiers :** `components/subscription/TrialBanner.tsx`, `components/subscription/PromoExpiryBanner.tsx`
- **Critères d'acceptance :**
  - [ ] Tap sur `TrialBanner` ou `PromoExpiryBanner` → ouvre `(modals)/paywall` avec trigger `trial_expired` ou `promo_expiring`
  - [ ] Trigger automatique du paywall à J-0 du trial (si user actif dans l'app)
  - [ ] Tests : tap déclenche bien la navigation
- **Mirror web :** `components/subscription/{TrialExpiryBanner,PromoExpiryBanner}.tsx`

---

## Récap des dépendances clés

```
S3-T01 (Welcome) ──► S3-T02 (Login polish), S3-T06 (Layout questionnaire), S3-T18 (Redeem via T19)
S3-T06 (Layout questionnaire) ──► S3-T07 à S3-T13 (clusters) + S3-T14 (celebration)
S3-T07 → S3-T13 + S3-T16 (fingerprint) ──► S3-T15 (Recap) ──► S3-T17 (Success polling)
S3-T21 (Deep links) ──► S3-T03 (Set-password), S3-T04 (Reset), S3-T05 (Confirm)
S3-T22 (Attribution) + S3-T23 (UTM helper) ──► S3-T20 (Paywall info)
S3-T03 (Set-password) ──► S3-T24 (Nutrition prefs Pro)
S3-T19 (Validation promo) ──► S3-T18 (Redeem)
S3-T25 (Tutoriel) — dépend de S2-T05 seulement
S3-T26 (Banner trigger) ──► dépend de S2-T13, S2-T14, S3-T20
```

## Vérification end-of-sprint

1. **Onboarding bout-en-bout** : ouvrir l'app fraîchement installée → tap "Démarrer mon essai gratuit" → browser → revenir via deep link `set-password?token=...&flow=trial` → set-password (S3-T03) → questionnaire 24 micro-steps (S3-T06→S3-T13) → recap (S3-T15) → success polling (S3-T17) → arriver sur Tab Programme
2. **Redeem** : tap "J'ai un code promo" → entrer code (S3-T18) → validate (S3-T19) → questionnaire → recap → set-password promo → arriver sur Tab Programme
3. **Paywall info** : forcer trial expiré (`isActive: false`) → tap n'importe quel tab → modal paywall info (S3-T20) → tap "Continuer sur le web" → browser ouvre `apexcoach.app/checkout?utm_source=ios_app&utm_campaign=paywall_trial_expired`
4. **Grep** : `S'abonner`, `€/mois`, `IAP`, `RevenueCat`, `react-native-iap`, `expo-in-app-purchases` → **0 résultat** dans `app/`, `components/`, `lib/`
5. **Reset password** : forgot-password → email → cliquer lien → deep link app → reset-password screen (S3-T04) → submit → arriver sur Tab Programme
6. **Tutoriel** : après le premier login (`tutorialSeen === false`) → coachmarks sur les 5 tabs (S3-T25) → fin → flag persisté
