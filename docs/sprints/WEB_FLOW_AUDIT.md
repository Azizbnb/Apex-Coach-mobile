# Audit du flow web Apex Coach — référence pour la refonte sprints mobile

> **Date :** 2026-05-16
> **Source :** code web actuel (`C:\Users\benta\Apex-Coach`), audit produit par 3 agents Explore en parallèle.
> **Statut :** source de vérité pour la refonte sprints mobile S2 → S5. **Aucun ticket mobile ne doit décrire un écran qui n'apparaît pas dans ce document.**
> **Mise à jour :** manuelle quand le web évolue (à arbitrer côté `Apex-Coach`).

---

## 1. Vue d'ensemble

### 1.1 Stack web (rappel)

| Catégorie | Tech |
|-----------|------|
| Framework | Next.js 15 (App Router) |
| React | 19 |
| Auth | Supabase Auth + middleware Next |
| Données | Supabase RLS (lectures dashboard) + API routes Next (mutations critiques) |
| UI | shadcn/ui (Radix primitives) + Tailwind + Framer Motion |
| Payment | Stripe (Reader model côté mobile = redirection navigateur uniquement) |

### 1.2 Convention routing App Router

- `app/(groupe)/...` = route group, ne s'imprime pas dans l'URL.
- `app/segment/...` = segment imprimé dans l'URL.
- Layouts en cascade : `app/layout.tsx` (root) → `app/(dashboard)/layout.tsx` (guard) → page enfant.
- Pages `Server Component` par défaut, `"use client"` quand state/effet.
- Recherche : `<Suspense>` pour streaming, `redirect()` / `notFound()` côté serveur.

### 1.3 Périmètre couvert / exclus

| Couvert | Exclus |
|---------|--------|
| `(auth)/login` `(auth)/signup` `(auth)/forgot-password` | `admin/*` (back-office, hors scope mobile) |
| `auth/confirm-email` `auth/set-password` `auth/reset-password` | `app/page.tsx` (landing publique) |
| `(dashboard)/programme` `(dashboard)/entrainement` `entrainement/session/[sessionId]` | `about`, `contact`, `legal/*` |
| `(dashboard)/nutrition` `nutrition/preferences` | `blog/*`, `programmes/*`, `pricing`, `reviews/*` |
| `(dashboard)/bilan` `bilan/formulaire` `(dashboard)/analytics` | Landing CTA, `landing/*` composants |
| `(dashboard)/profil` `(dashboard)/settings` | PWA install / Cookies (web-only) |
| `questionnaire`, `questionnaire/recap`, `questionnaire/success` | Trustpilot prompts, reviews list publique |
| `redeem`, `checkout`, `checkout/success` | |

> **Raison de l'exclusion** : ces écrans soit n'ont pas d'équivalent mobile (landing, blog), soit sont pris en charge **uniquement via le navigateur externe** (`WebBrowser.openBrowserAsync` vers `apexcoach.app`) dans le modèle Netflix de l'app mobile.

---

## 2. Index des routes (mapping web → mobile)

| Route web | Fichier | Rôle 1-ligne | Mobile target |
|-----------|---------|--------------|---------------|
| `/login` | `app/(auth)/login/page.tsx` | Email/password login | `app/(auth)/login.tsx` (existe) |
| `/signup` | `app/(auth)/signup/page.tsx` | Stub mobile : redirige vers le browser pour signup web | `app/(auth)/signup.tsx` (stub → browser) |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Demande de reset par email avec cooldown 60s | `app/(auth)/forgot-password.tsx` (existe) |
| `/auth/confirm-email` | `app/auth/confirm-email/page.tsx` | Page de confirmation après clic email | Deep link `apexcoach://auth/confirm-email` |
| `/auth/set-password` | `app/auth/set-password/page.tsx` | Initialise mot de passe (3 flows : Stripe / promo / trial) | Deep link `apexcoach://auth/set-password?token=...` → écran mobile dédié |
| `/auth/reset-password` | `app/auth/reset-password/page.tsx` | Nouveau mot de passe via recovery token | Deep link `apexcoach://auth/reset-password` → écran mobile dédié |
| `/questionnaire` | `app/questionnaire/page.tsx` | Onboarding 27 micro-steps (QuestionnaireFlow v2) | `app/(onboarding)/questionnaire/index.tsx` |
| `/questionnaire/recap` | `app/questionnaire/recap/page.tsx` | Récap complet avant submit + édition par section | `app/(onboarding)/questionnaire/recap.tsx` |
| `/questionnaire/success` | `app/questionnaire/success/page.tsx` | Loader "Génération en cours" avec polling | `app/(onboarding)/questionnaire/success.tsx` |
| `/redeem` | `app/redeem/page.tsx` | Saisie d'un code promo (partenariat / trial étendu) | `app/(onboarding)/redeem.tsx` (signup gratuit, Apple OK) |
| `/checkout` | `app/checkout/page.tsx` | Sélection plan + redirection Stripe Checkout | **Pas de mirror mobile** : redirection `WebBrowser → apexcoach.app/checkout?utm_source=ios_app` |
| `/checkout/success` | `app/checkout/success/page.tsx` | Confirmation paiement (côté navigateur uniquement) | **Pas de mirror** : utilisateur revient à l'app via deep link |
| `/nutrition/preferences` | `app/nutrition/preferences/page.tsx` | Préférences alimentaires (Pro post-signup) | `app/(onboarding)/nutrition-preferences.tsx` |
| `/programme` | `app/(dashboard)/programme/page.tsx` | Semaine en cours, sessions, progressive unlock | `app/(tabs)/programme/index.tsx` (existe, polish) |
| `/entrainement` | `app/(dashboard)/entrainement/page.tsx` | Sélection session + auto-start via query string | `app/(tabs)/entrainement/index.tsx` (existe, livré PR #31) |
| `/entrainement/session/[sessionId]` | `app/(dashboard)/entrainement/session/[sessionId]/page.tsx` | Legacy redirect → `/entrainement?week=X&session=Y&autostart=true` | Géré par navigation mobile (params route) |
| `/nutrition` | `app/(dashboard)/nutrition/page.tsx` | Plan repas + macros + shopping list (Pro only) | `app/(tabs)/nutrition/index.tsx` (existe, gated Pro) |
| `/bilan` | `app/(dashboard)/bilan/page.tsx` | Vue progression : historique des bilans + stats (PAS le formulaire) | `app/(tabs)/bilan/index.tsx` (contenu Tab Bilan, fusionné avec `/analytics`) |
| `/bilan/formulaire` | `app/(dashboard)/bilan/formulaire/page.tsx` | Formulaire de bilan hebdo (déclenche adaptation IA) | `app/(modals)/bilan-formulaire.tsx` (modal plein écran) |
| `/analytics` | `app/(dashboard)/analytics/page.tsx` | Stats long-terme (Pro, ≥4 bilans) | `app/(tabs)/bilan/index.tsx` (tab dédié bilan) |
| `/profil` | `app/(dashboard)/profil/page.tsx` | Nom + stats personnelles (lecture seule + édition nom) | `app/(tabs)/profile/index.tsx` (existe, polish) |
| `/settings` | `app/(dashboard)/settings/page.tsx` | Abonnement, mdp, RGPD, suppression, PWA, logout | `app/(tabs)/profile/settings.tsx` ou modals dédiés |

**Légende état mobile :** *existe* = déjà livré (Sprint 1 ou via PRs #29-#31), *stub* = page placeholder à enrichir, *—* = à créer.

---

## 3. Index des modals / overlays

| Modal web | Fichier | Déclencheur | API | Mobile target |
|-----------|---------|-------------|-----|---------------|
| **SessionDetailModal** | `components/programme/SessionDetailModal.tsx` | `/programme` → clic carte session | — (affichage) | `app/(modals)/session-detail.tsx` (existe) |
| **ExerciseVideoModal** | `components/entrainement/ExerciseVideoModal.tsx` | Clic démo dans `ExerciseView` / `ExerciseCard` | Fetch vidéo via `useExerciseVideo` | `app/(modals)/exercise-video.tsx` (à créer, `expo-video`) |
| **RestTimerModal** *(legacy)* | `components/entrainement/RestTimerModal.tsx` | Ancien flow (remplacé par `RestTimerFullscreen`) | — | Ne pas mirrorer (legacy web) |
| **RestTimerFullscreen** | `components/entrainement/RestTimerFullscreen.tsx` | Phase `resting` de `ActiveWorkout` | — | Intégré dans le flow workout mobile (existe) |
| **WorkoutModal** | `components/entrainement/WorkoutModal.tsx` | Wrapper de la session active web | Dépend du contenu | Pas de mirror direct (mobile = écran tab) |
| **DayModal** (nutrition) | `components/nutrition/DayModal.tsx` | `/nutrition` → clic jour de la semaine | — | `components/nutrition/MealDetail.tsx` (existe, à enrichir) |
| **ChangeObjectiveDialog** | `components/settings/ChangeObjectiveDialog.tsx` | `/settings` → bouton "Changer objectif" | `POST /api/user/change-objective` | `app/(modals)/change-objective.tsx` |
| **HealthDataConsentModal** | `components/questionnaire-v2/HealthDataConsentModal.tsx` | Step santé du questionnaire | — (validé au submit final) | Étape du flow onboarding mobile |
| **MilestoneCelebration** | `components/questionnaire-v2/MilestoneCelebration.tsx` | Entre étapes clés du questionnaire | — | Composant onboarding mobile |
| **PWAInstallModal** | `components/pwa/PWAInstallModal.tsx` | Auto-trigger layout dashboard | — | **Non mirrorer** (web-only) |
| **WhatsNewModal** | `components/whats-new/WhatsNewModal.tsx` | Auto-trigger layout dashboard | — | **Non mirrorer** (web-only, équivalent = banners mobile) |
| **CookieConsent** | `components/cookies/CookieConsent.tsx` | Auto-trigger layout root | — | **Non mirrorer** (mobile = ATT prompt Apple + GDPR consent natif) |

---

## 4. Index des API consommées par les pages auditées

| Endpoint | Méthode | Appelé par | Payload entrée | Réponse | Notes mobile |
|----------|---------|------------|----------------|---------|--------------|
| `/api/auth/send-password-reset` | POST | `/forgot-password` | `{ email }` | `{ success: true }` (anti-enum) | Mirror obligatoire pour mobile |
| `/api/auth/verify-checkout-session` | POST | `/auth/set-password` (Stripe flow) | `{ sessionId }` | `{ valid, user }` | Mobile : pas utilisé (paiement en browser) |
| `/api/auth/verify-promo-token` | POST | `/auth/set-password` (promo flow) | `{ token }` | `{ valid, planId }` | Mirror obligatoire (mobile reçoit token via deep link) |
| `/api/auth/set-initial-password` | POST | `/auth/set-password` | `{ password, flow }` | `{ accessToken, refreshToken, redirectTo }` | Mirror obligatoire |
| `/api/auth/log-password-change` | POST | `/auth/reset-password` | Pas de body | 204 | Mirror obligatoire (audit) |
| `/api/auth/signout` | POST | `/settings` (form) | — | Redirect | Mobile : `supabase.auth.signOut()` direct |
| `/api/auth/create-trial-account` | POST | Welcome non-connecté + `/redeem` | `{ email, password, source? }` | `{ accessToken, refreshToken }` | **Critique mobile** : seul moyen de créer un compte trial depuis l'app |
| `/api/promo/validate` | POST | `/redeem` | `{ code }` | `{ valid, discount, planId, ... }` | Mirror obligatoire |
| `/api/checkout/create-session` | POST | `/checkout` | `{ planId, billingInterval }` | `{ url }` (Stripe redirect) | **Pas mirror mobile** (paiement = WebBrowser uniquement) |
| `/api/programs/retry-nutrition` | POST | `/nutrition` (état "génération échouée") | — | `{ jobId }` | Mirror obligatoire (UX retry) |
| `/api/session/complete` | GET | `/bilan` (chargement form) | Query `?week=N` | `{ completion_percent }` | Mirror obligatoire |
| `/api/session/skips` | GET | `/bilan` | Query `?week=N` | `{ skipped: Exercise[] }` | Mirror obligatoire |
| `/api/workout/complete-session` | POST | Phase `completed` du workout | `{ sessionId, sets, duration }` | `{ success }` | Mirror obligatoire (déjà tracé PR #31) |
| `/api/feedback` | POST | `/bilan` submit | Form bilan complet | `{ feedbackId }` | Mirror obligatoire |
| `/api/program/adapt` | POST | Déclenché après `/api/feedback` | `{ feedbackId }` | `{ jobId }` (asynchrone) | Mirror obligatoire (UX polling) |
| `/api/profile/name` | PATCH | `/profil` | `{ name }` | `{ success }` | Mirror obligatoire |
| `/api/user/change-objective` | POST | `ChangeObjectiveDialog` | `{ primaryObjective, ... }` | `{ success }` (régen ~2 min) | Mirror obligatoire |
| `/api/reviews` (cf. backend) | GET / POST | Prompt review post-bilan | Lecture user reviews / création | — | Mirror obligatoire (Sprint 4) |
| `/api/gdpr/export` (cf. backend) | POST | `GdprExportButton` | — | Email avec lien d'archive | Mirror obligatoire |
| `/api/account/delete` (cf. backend) | POST | `DeleteAccountButton` | `{ confirm: true }` | Logout + redirect | Mirror obligatoire |
| `/api/affiliate/click` | POST | Composants affiliés | `{ productId, source }` | `{ success }` | Mirror obligatoire (tracking ROI) |

**Appels Supabase RN direct (sans API route)** — protégés par RLS :
- Lecture `programs`, `subscriptions`, `questionnaire_responses`, `user_profiles`, `program_feedback`, `user_nutrition_plans`, `meal_plans`, `session_completions`, `exercises`.
- INSERT/UPDATE `program_feedback` via formulaire bilan (côté serveur via `/api/feedback`, RLS POLICY côté insert sécurise).

---

## 5. Détails par page

> Pour chaque page : fichier source, type Server/Client, composants enfants principaux, données consommées, transitions sortantes, et **notes mobile** (adaptation attendue).

### 5.1 `/login`
- **Fichier :** `app/(auth)/login/page.tsx` (Client)
- **Composants enfants :** `LoginForm` (intégré), liens vers `/forgot-password` et `/signup`.
- **Données :** `supabase.auth.signInWithPassword({ email, password })`.
- **Transitions :** succès → `/programme` (ou redirect cible si stockée). Erreur → toast + reset password.
- **Notes mobile :** déjà livré. Adapter si le web ajoute du 2FA.

### 5.2 `/signup`
- **Fichier :** `app/(auth)/signup/page.tsx` (Client)
- **Composants enfants :** formulaire email + password + acceptation CGU, redirige vers `/auth/set-password` après création.
- **Données :** `POST /api/auth/create-trial-account`.
- **Transitions :** succès → `/auth/set-password?flow=trial`.
- **Notes mobile :** **stub** dans l'app. Le brief Netflix laisse cette route accessible (signup gratuit Apple-OK), mais en pratique on dirige `welcome non-connecté` vers le browser pour éviter de dupliquer la logique. Si on garde un mirror natif, c'est ici.

### 5.3 `/forgot-password`
- **Fichier :** `app/(auth)/forgot-password/page.tsx` (Client)
- **Composants enfants :** input email, cooldown 60s, message succès (anti-enumération : toujours OK).
- **Données :** `POST /api/auth/send-password-reset`.
- **Transitions :** succès → état "email envoyé" sur la même page, lien retour login.
- **Notes mobile :** déjà livré. Cooldown identique côté mobile.

### 5.4 `/auth/confirm-email`
- **Fichier :** `app/auth/confirm-email/page.tsx` (Server)
- **Composants :** message de succès, CTA retour login.
- **Données :** aucune (Supabase a déjà traité le lien email).
- **Notes mobile :** géré par deep link `apexcoach://auth/confirm-email`. Affiche un écran de confirmation puis redirige.

### 5.5 `/auth/set-password`
- **Fichier :** `app/auth/set-password/page.tsx` (Client, Suspense)
- **Composants enfants :** détection de flow (Stripe / promo / trial), `PasswordForm`, indicateur de chargement.
- **Données :**
  - Stripe : `POST /api/auth/verify-checkout-session` avec backoff (6 retries, ~35s).
  - Promo / Trial : `POST /api/auth/verify-promo-token`.
  - Submit : `POST /api/auth/set-initial-password` → auto-login + redirect (`/nutrition/preferences` si Pro, sinon `/programme`).
- **Notes mobile :** deep link `apexcoach://auth/set-password?token=...`. Pour le flow Stripe l'app n'est jamais utilisée (paiement = browser). Mirror **les flows promo + trial uniquement** côté mobile.

### 5.6 `/auth/reset-password`
- **Fichier :** `app/auth/reset-password/page.tsx` (Client)
- **Composants enfants :** `PasswordResetForm`, indicateur force, validation match.
- **Données :** `supabase.auth.updateUser({ password })` + `POST /api/auth/log-password-change` + redirect `/programme`.
- **Notes mobile :** deep link `apexcoach://auth/reset-password` (Supabase fournit déjà ce mode de redirection via param `?type=recovery`). Mirror exact.

### 5.7 `/questionnaire`
- **Fichier :** `app/questionnaire/page.tsx` (Client)
- **Composants enfants :** `QuestionnaireFlow` + `QuestionnaireContext` + `ImmersiveBackground` + `ImmersiveProgress` + `NavigationControls` + 24 `*Step` (cf. tableau composants ci-dessous), `MilestoneCelebration`, `HealthDataConsentModal`, `CoherenceWarning`.
- **Données :** state local + persist Supabase (server action `createPendingQuestionnaire`).
- **Transitions :** chaque step → suivant, dernier step → `/questionnaire/recap`.
- **Notes mobile :** Mirror obligatoire. Les 24 steps deviennent autant d'écrans mobile (ou un seul écran avec `Animated.View` qui transitionne). Conserver l'animation de fond et le compteur immersif. `HealthDataConsentModal` reste un modal RN. Voir aussi : `Apex-Coach/lib/validations/step1.ts..step6.ts` déjà copiés côté mobile (Sprint 1).

### 5.8 `/questionnaire/recap`
- **Fichier :** `app/questionnaire/recap/page.tsx` (Client)
- **Composants enfants :** sections récapitulatives (1 par groupe : profil, expérience, objectifs, dispo, équipement, santé, jeûne, lifestyle), bouton "Modifier" par section, CTA final "Valider et générer mon programme".
- **Données :** lecture state context + submit final via server action `redeemPromoAndCreateAccount` (si promo) ou `createProgram`.
- **Transitions :** validation → `/questionnaire/success` ; "Modifier" → retour au step concerné.
- **Notes mobile :** Mirror identique. Sur tap "Modifier", navigation vers le step concerné en mode édition.

### 5.9 `/questionnaire/success`
- **Fichier :** `app/questionnaire/success/page.tsx` (Client)
- **Composants enfants :** `ProgramGenerationProgress` (loader animé), polling de statut.
- **Données :** poll Supabase `programs.status` jusqu'à `ready`, ou `/api/programs/status?jobId=...` selon implémentation actuelle.
- **Transitions :** programme prêt → redirect `/programme` ; échec → toast + retry.
- **Notes mobile :** Mirror : loader full-screen + polling périodique (3-5s). Affiche un message de patience (génération IA peut prendre ~30-60s). Si Pro, enchaîner sur génération nutrition après.

### 5.10 `/redeem`
- **Fichier :** `app/redeem/page.tsx` (Client)
- **Composants enfants :** input code, état "code valide" / "expiré" / "invalide", CTA pour démarrer le questionnaire.
- **Données :** `POST /api/promo/validate`.
- **Transitions :** code valide → enchaînement signup gratuit (server action `redeemPromoAndCreateAccount`) → `/auth/set-password?flow=promo&token=...`.
- **Notes mobile :** **Apple-OK** car signup gratuit (Netflix model). Mirror obligatoire.

### 5.11 `/checkout`
- **Fichier :** `app/checkout/page.tsx` (Client)
- **Composants enfants :** sélection plan (Coaching / Coaching Pro), toggle billing (monthly / yearly), CTA "Payer avec Stripe".
- **Données :** `POST /api/checkout/create-session` → redirect URL Stripe.
- **Notes mobile :** **Pas de mirror.** L'app mobile n'affiche jamais cette page : tout flux conversion = `WebBrowser.openBrowserAsync('https://apexcoach.app/checkout?utm_source=ios_app|android_app')`.

### 5.12 `/checkout/success`
- **Fichier :** `app/checkout/success/page.tsx` (Server)
- **Composants enfants :** confirmation + auto-redirect vers `/auth/set-password?session_id=...`.
- **Notes mobile :** **Pas de mirror.** L'utilisateur revient à l'app via deep link une fois le paiement validé.

### 5.13 `/nutrition/preferences`
- **Fichier :** `app/nutrition/preferences/page.tsx` (Client)
- **Composants enfants :** formulaire NutritionPreferences (régime, allergies, dégouts, calories cible, déjà décrit dans `lib/validations/nutrition-preferences.ts`).
- **Données :** server action UPSERT Supabase `user_nutrition_preferences`.
- **Transitions :** submit → `/programme` (puis génération automatique du plan nutrition Pro).
- **Notes mobile :** Mirror obligatoire. Affiché juste après set-password si user Pro post-signup.

### 5.14 `/programme`
- **Fichier :** `app/(dashboard)/programme/page.tsx` (Server)
- **Composants enfants :** `FeatureGate`, `ProgrammeWrapper`, `ProgrammeContent`, `FastingBanner`, `EquipmentRecommendations`, `NextUnlockBannerClient`.
- **Données :** Supabase RLS `programs`, `subscriptions`, `questionnaire_responses` (équipement), `program_feedback` (pour calcul unlock).
- **Transitions :** clic session → `SessionDetailModal` (modal mobile) ; clic "Commencer" → `/entrainement?week=W&session=S&autostart=true` ; clic semaine verrouillée → tooltip avec date de déverrouillage.
- **Notes mobile :** déjà partiellement livré (PR #29). À polish : intégration `FastingBanner`, `EquipmentRecommendations`, `NextUnlockBannerClient`.

### 5.15 `/entrainement`
- **Fichier :** `app/(dashboard)/entrainement/page.tsx` (Server)
- **Composants enfants :** `WorkoutCompanion` (sélection session + état) qui orchestre `ActiveWorkout` quand `autostart=true`.
- **Données :** Supabase RLS `programs`, `subscriptions`, `program_feedback`. Calcul `activeWeek` via logique progressive unlock.
- **Transitions :** sélection session → démarrer → bascule en mode `ActiveWorkout` 6 phases.
- **Notes mobile :** **livré PR #31** (orchestrateur 6 phases : warmup → prep → exercise → restChoice → resting → cooldown → completed). À étendre : drag-drop dans phase prep, modal vidéo embarquée, timer libre.

### 5.16 `/entrainement/session/[sessionId]`
- **Fichier :** `app/(dashboard)/entrainement/session/[sessionId]/page.tsx` (Server)
- **Rôle :** redirect legacy (`sessionId="weekNumber-sessionNumber"` → `/entrainement?week=W&session=S&autostart=true`).
- **Notes mobile :** géré par les params route Expo (pas besoin de page intermédiaire).

### 5.17 `/nutrition`
- **Fichier :** `app/(dashboard)/nutrition/page.tsx` (Client)
- **Composants enfants :** `AccessDeniedState` (si !Pro), `NoDataState` (pas de plan), `MacroRings`, `DayButton`, `DayModal`, `ShoppingListSection`, `SupplementRecommendations`, `NutritionGenerationProgress`.
- **Données :** Supabase RLS `subscriptions` (Pro check), `programs.nutrition_plan`. `POST /api/programs/retry-nutrition` si génération échouée.
- **Transitions :** clic jour → `DayModal` (mobile = écran modal plein écran ou bottom sheet) ; clic repas → `MealDetail` ; clic ingrédient → `RecipeDetail`.
- **Notes mobile :** déjà partiellement livré (Sprint 1 + S2-T11 + S2-T16). À enrichir : `MacroRings` (anneaux SVG), `NutritionGenerationProgress`, `ShoppingListSection` par catégorie, `SupplementRecommendations`.

### 5.18 `/bilan` — Vue progression (PAS le formulaire)
- **Fichier :** `app/(dashboard)/bilan/page.tsx` (Client, 553 lignes)
- **Rôle réel :** « Ma Progression — Vue résumé » : graphiques de progression, historique des bilans précédents, stats globales (poids, complétion, etc.). **N'est PAS le formulaire de feedback.**
- **Composants enfants :** cartes (`Card`, `Badge`), graphiques inline, hook `useSessionCompletions`. Pas de composant `BilanForm` séparé (la logique formulaire vit dans `/bilan/formulaire`).
- **Données :** Supabase RLS `program_feedback`, `session_completions`.
- **Transitions :** clic "Faire mon bilan" → `/bilan/formulaire?week=N`.
- **Notes mobile :** **devient le contenu de la Tab Bilan** (sections overview + historique + analytics fusionnée avec `/analytics`).

### 5.19 `/bilan/formulaire` — Le vrai formulaire de bilan hebdo
- **Fichier :** `app/(dashboard)/bilan/formulaire/page.tsx` (Client, 1026 lignes)
- **Rôle :** formulaire de feedback hebdomadaire (URL canonique). Toute la logique form est inline dans la page (pas de composant `BilanForm.tsx` séparé côté web).
- **Données :** `GET /api/session/complete?week=N`, `GET /api/session/skips?week=N`, `POST /api/feedback` puis `POST /api/program/adapt`.
- **Transitions :** submit → toast de succès + animation génération IA + redirect `/programme`.
- **Notes mobile :** **page mobile = modal plein écran** présenté depuis Tab Bilan (clic "Faire mon bilan") ou via banner. Bilan = porte d'entrée à l'adaptation IA, **critique** sur Coaching+.

### 5.20 `/analytics`
- **Fichier :** `app/(dashboard)/analytics/page.tsx` (Client)
- **Composants enfants :** `AccessDeniedState` (si !Pro), `EmptyState` (si <4 bilans), `TrendCharts` (completion, difficulty, energy, stress), `WellnessRadar`, `PainZonesChart`.
- **Données :** Supabase RLS `program_feedback` (filtre ≥4 entries).
- **Notes mobile :** **devient le contenu principal de la Tab Bilan**. Mirror obligatoire. Charts via `react-native-svg` + `victory-native` ou équivalent.

### 5.21 `/profil`
- **Fichier :** `app/(dashboard)/profil/page.tsx` (Client)
- **Composants enfants :** `ProfileForm` (édition nom), `ProfileStats` (taille, poids, IMC, âge, sexe).
- **Données :** Supabase RLS `user_profiles`, `questionnaire_responses`, `program_feedback` (dernier poids). `PATCH /api/profile/name`.
- **Notes mobile :** déjà existant (Sprint 1 placeholder). À enrichir avec stats détaillées.

### 5.22 `/settings`
- **Fichier :** `app/(dashboard)/settings/page.tsx` (Server, `force-dynamic`)
- **Composants enfants :** `SubscriptionCard`, `ChangeObjectiveSection`, `GdprExportButton`, `DeleteAccountButton`, `ChangePasswordForm`, `PWAInstallSection`, `ReviewPromptCard`, liens légaux, `LogoutButton`.
- **Données :** Supabase RLS `subscriptions`. Logout = `POST /api/auth/signout` (côté mobile = `supabase.auth.signOut()`).
- **Notes mobile :** mirror via sections dans Tab Profil ou écran "Réglages" dédié. **Pas mirrorer** : `PWAInstallSection` (web only). **Ajouter** : toggle jeûne (mirror `FastingToggleForm`), gestion notifications push.

---

## 6. Détails par modal

### 6.1 SessionDetailModal
- **Fichier :** `components/programme/SessionDetailModal.tsx`
- **Déclencheur :** clic carte session sur `/programme`.
- **Contenu :** détail session (durée, intensité, warmup, liste exercices, cooldown) + bouton "Commencer la séance".
- **API :** aucune (affichage seul).
- **Transitions :** "Commencer" → `/entrainement?week=W&session=S&autostart=true`.
- **Mobile :** modal plein écran `(modals)/session-detail.tsx` (existe via PR #29).

### 6.2 ExerciseVideoModal
- **Fichier :** `components/entrainement/ExerciseVideoModal.tsx`
- **Déclencheur :** bouton "Démo vidéo" dans `ExerciseView` (phase exercice) ou `ExerciseCard` (vue prep).
- **Contenu :** lecteur vidéo + loader.
- **API :** `useExerciseVideo` hook (Supabase + signed URL).
- **Mobile :** **à créer** — `app/(modals)/exercise-video.tsx` via `expo-video`. Prérequis : enrichir le schéma programme avec URLs vidéo (champ manquant aujourd'hui dans `lib/programs/schemas.ts`).

### 6.3 RestTimerFullscreen
- **Fichier :** `components/entrainement/RestTimerFullscreen.tsx`
- **Déclencheur :** phase `resting` de `ActiveWorkout` (après validation d'une série quand l'utilisateur choisit "Repos").
- **Contenu :** countdown plein écran (timer central + boutons +15s / -15s / Passer).
- **API :** aucune.
- **Mobile :** intégré au flow workout livré PR #31.

### 6.4 DayModal (nutrition)
- **Fichier :** `components/nutrition/DayModal.tsx`
- **Déclencheur :** clic jour sur `/nutrition`.
- **Contenu :** liste des repas du jour avec macros totales, alternatives.
- **API :** aucune.
- **Mobile :** `MealDetail.tsx` (existe, à enrichir avec totaux macros).

### 6.5 ChangeObjectiveDialog
- **Fichier :** `components/settings/ChangeObjectiveDialog.tsx`
- **Déclencheur :** `/settings` → bouton "Changer objectif".
- **Contenu :** flow multi-étapes : warning → sélection nouvel objectif → confirmation → submit → état "Régénération en cours".
- **API :** `POST /api/user/change-objective` (régénère programme ~2 min).
- **Mobile :** `app/(modals)/change-objective.tsx` à créer.

### 6.6 HealthDataConsentModal
- **Fichier :** `components/questionnaire-v2/HealthDataConsentModal.tsx`
- **Déclencheur :** Step santé du questionnaire (avant les questions sensibles).
- **Contenu :** 4 checkboxes RGPD obligatoires + scroll-to-bottom requis avant validation.
- **API :** consenti au submit final du questionnaire (server action).
- **Mobile :** étape intégrée du flow onboarding mobile.

### 6.7 MilestoneCelebration
- **Fichier :** `components/questionnaire-v2/MilestoneCelebration.tsx`
- **Déclencheur :** entre étapes clés (ex: fin du bloc Profil → motivation).
- **Contenu :** animation Framer Motion + message de motivation.
- **Mobile :** mirror avec `react-native-reanimated` + confettis (`react-native-confetti-cannon`).

---

## 7. Composants par domaine (matrice de mapping)

> **Légende mirror mobile :** ✅ = à porter, ❌ = web only, 🔁 = déjà partiellement mirroré (mobile a son équivalent).

### 7.1 Entraînement (`components/entrainement/`)

| Composant web | Mirror mobile | État mobile |
|---------------|---------------|-------------|
| `ActiveWorkout.tsx` | ✅ → `components/workout/ActiveWorkout` | 🔁 livré PR #31 (refonte 6 phases) |
| `ExerciseCard.tsx` | ✅ → `components/workout/ExerciseCard` | À créer (sous-composant de session-detail) |
| `ExerciseView.tsx` | ✅ | 🔁 livré PR #31 |
| `ExercisePrepScreen.tsx` | ✅ | 🔁 livré PR #31 (sans drag-drop) |
| `SortableExerciseItem.tsx` | ✅ → mobile via reanimated + gesture-handler | À créer (correctif PR #31) |
| `ExerciseTimerCard.tsx` | ✅ → timer exercice | À créer |
| `ExerciseVideoButton.tsx` | ✅ | À créer (avec modal vidéo) |
| `ExerciseVideoModal.tsx` | ✅ → `(modals)/exercise-video` via expo-video | À créer (correctif PR #31) |
| `RestChoiceScreen.tsx` | ✅ | 🔁 livré PR #31 |
| `RestTimerModal.tsx` (legacy) | ❌ | Pas mirrorer |
| `RestTimerFullscreen.tsx` | ✅ | 🔁 livré PR #31 |
| `WarmupCooldownCard.tsx` | ✅ | 🔁 livré PR #31 |
| `WorkoutCompanion.tsx` | ✅ → sélecteur session sur tab entrainement | À créer (polish) |
| `WorkoutBottomBar.tsx` | ❌ | Fusionné dans `ActiveWorkout` mobile |
| `WorkoutModal.tsx` | ❌ | Pas pertinent en mobile (full-screen tab) |
| `WorkoutTimerStrip.tsx` | ✅ → `components/workout/FreeTimer` | À créer (correctif PR #31) |
| `WorkoutTopBar.tsx` | ✅ | 🔁 livré PR #31 |
| `CompletionScreen.tsx` | ✅ | 🔁 livré (modal session-complete) |
| `VideoModalContent.tsx` | ✅ | Sous-composant du modal vidéo |
| `SessionSelector.tsx` | ✅ | 🔁 partiellement (cards session sur écran semaine) |

### 7.2 Programme (`components/programme/`)

| Composant web | Mirror mobile | État mobile |
|---------------|---------------|-------------|
| `ProgrammeContent.tsx` | ✅ → screen `(tabs)/programme/index.tsx` | 🔁 livré PR #29 |
| `ProgrammeWrapper.tsx` | ✅ → loader + error states | 🔁 intégré |
| `SessionDetailModal.tsx` | ✅ → `(modals)/session-detail.tsx` | 🔁 livré PR #29 |
| `FloatingProgramProgress.tsx` | ❌ | UI web only (mobile = pas de floating overlay sur tabs) |
| `ProgramGenerationProgress.tsx` | ✅ → écran loader onboarding | À créer (Sprint 3) |
| `NutritionGenerationProgress.tsx` | ✅ | À créer |

### 7.3 Nutrition (`components/nutrition/`)

| Composant web | Mirror mobile | État mobile |
|---------------|---------------|-------------|
| `MacroRings.tsx` | ✅ → `MacroSummary` | 🔁 existe (mobile = barres, pas anneaux) — à porter en anneaux SVG |
| `MealCard.tsx` | ✅ | 🔁 `MealPlanCard` |
| `MealAccordion.tsx` | ✅ | 🔁 intégré dans `MealPlanCard` |
| `DayModal.tsx` | ✅ | 🔁 `MealDetail` (à enrichir) |
| `ShoppingListSection.tsx` | ✅ | 🔁 `ShoppingList` (à enrichir : catégories) |

### 7.4 Bilan — pas de dossier `components/bilan/` côté web

> Vérifié 2026-05-16 : le dossier `Apex-Coach/components/bilan/` **n'existe pas**. La logique formulaire est entièrement inline dans `app/(dashboard)/bilan/formulaire/page.tsx` (1026 lignes). La vue progression est inline dans `app/(dashboard)/bilan/page.tsx` (553 lignes).

> Côté mobile, on isole la complexité dans des composants dédiés (`components/bilan/*.tsx` à créer) — c'est un choix d'architecture mobile, pas un mirror direct de fichiers web. Le modal mobile `bilan-formulaire` doit implémenter :
- Section 1 : difficulté, énergie, soreness, motivation, sommeil, stress (sliders 1-5).
- Section 2 : pain zones (heatmap corporel — composant à créer côté mobile).
- Section 3 : poids (semaines paires uniquement).
- Section 4 : skip reasons (textarea + multi-select si exercices sautés).
- Section 5 : jeûne (conditionnel si `is_fasting_active` + `fasting_days_count` + `fasting_difficulty` + boutons continuer/stop).

### 7.5 Subscription (`components/subscription/`)

| Composant web | Mirror mobile | État mobile |
|---------------|---------------|-------------|
| `PaywallCard.tsx` | ✅ → mobile = écran info + CTA browser | À créer (Sprint 3) |
| `FeatureGate.tsx` | ✅ | 🔁 existe (S2-T15) |
| `NextUnlockBannerClient.tsx` | ✅ | À créer (S2 polish) |
| `TrialPaywall.tsx` | ✅ → version info-only mobile | À créer (Sprint 3) |
| `TrialExpiryBanner.tsx` | ✅ | 🔁 partiel (`TrialBanner` S2-T13) |
| `PromoExpiryBanner.tsx` | ✅ | 🔁 partiel (S2-T14) |
| `GracePeriodBanner.tsx` | ✅ | À créer (Sprint 4 polish) |
| `progressive-unlock-ui.tsx` | ✅ | 🔁 intégré dans `WeekCard` |
| `SubscriptionCard.tsx` | ❌ | Landing/pricing only |

### 7.6 Questionnaire-v2 (`components/questionnaire-v2/`)

**24 steps** à porter (Sprint 3) :
ProfileNameStep, ProfileAgeStep, ProfileHeightStep, ProfileWeightStep, ProfileSexStep, ExperienceLevelStep, ExperienceHistoryStep, ExperienceValidationStep, GoalsPrimaryStep, GoalsSecondaryStep, GoalsConditionalStep, AvailabilityFrequencyStep, AvailabilityDurationStep, AvailabilityLocationStep, EquipmentSelectionStep, EquipmentPreferencesStep, ExercisePreferencesStep, FastingStep, LifestyleStep, HealthDisclaimerStep, HealthConditionsStep, HealthMedicationsStep, PastInjuriesStep, SportGoalsStep.

**Utilitaires** : `QuestionnaireFlow` (orchestrateur), `QuestionnaireContext` (state), `SelectionQuestion`, `TextQuestion`, `AnimatedCard`, `ImmersiveBackground`, `ImmersiveProgress`, `NavigationControls`, `MilestoneCelebration`, `HealthDataConsentModal`, `CoherenceWarning`.

> **Note** : les validations Zod sont déjà copiées côté mobile (`lib/validations/step1.ts` → `step6.ts`). Réutiliser sans modifier.

### 7.7 Settings (`components/settings/`)

| Composant web | Mirror mobile | État mobile |
|---------------|---------------|-------------|
| `ChangePasswordForm.tsx` | ✅ | À créer (Sprint 4) |
| `ChangeObjectiveSection.tsx` | ✅ | À créer (Sprint 4) |
| `ChangeObjectiveDialog.tsx` | ✅ | À créer (Sprint 4) |
| `DeleteAccountButton.tsx` | ✅ | À créer (Sprint 4) |
| `FastingToggleForm.tsx` | ✅ | À créer (Sprint 4) |
| `GdprExportButton.tsx` | ✅ | À créer (Sprint 4) |
| `PWAInstallSection.tsx` | ❌ | Web only |

### 7.8 Reviews (`components/reviews/`)

| Composant web | Mirror mobile |
|---------------|---------------|
| `StarRating.tsx` | 🔁 existe côté mobile |
| `ReviewForm.tsx` | ✅ → `(modals)/leave-review.tsx` (Sprint 4) |
| `ReviewPromptCard.tsx` | ✅ → carte dans Profil + déclenchement post-bilan |
| Autres (`ReviewCard`, `ReviewsList`, `Trustpilot*`) | ❌ web only (landing / dashboards web) |

### 7.9 Affiliate (`components/affiliate/`)

| Composant web | Mirror mobile | État mobile |
|---------------|---------------|-------------|
| `AffiliateLink.tsx` | ✅ | 🔁 existe (S2-T12) |
| `EquipmentRecommendations.tsx` | ✅ | 🔁 existe (`EquipmentRecs`) |
| `SupplementRecommendations.tsx` | ✅ | 🔁 existe (`SupplementRecs`) |
| `AffiliateDisclosure.tsx` | ✅ | À ajouter (légal) |

### 7.10 Fasting (`components/fasting/`)

| Composant web | Mirror mobile |
|---------------|---------------|
| `FastingBanner.tsx` | ✅ → `programme/FastingBanner` (S2 polish) |

### 7.11 Dashboard (`components/dashboard/`)

| Composant web | Mirror mobile |
|---------------|---------------|
| `ProgramStatusCard.tsx` | ✅ → carte programme dans tab Programme |
| `DashboardError.tsx` | ✅ → error boundary mobile |

### 7.12 PWA / Cookies / Layout — non mirrorés

`InstallPrompt`, `PWAInstallModal`, `UpdateNotification`, `OfflineIndicator`, `ServiceWorkerProvider`, `CookieConsent`, `CookieManagementButton`, `Header`, `Footer`, `DashboardNav`, `FloatingProfileButton` → web only.

---

## 8. Flow utilisateur bout-en-bout

### 8.1 Premier lancement (utilisateur non connecté)

```
App ouverte
  → Welcome non-connecté (écran statique : copy + 2 CTAs)
      ├── CTA "J'ai déjà un compte"   → /(auth)/login
      └── CTA "Commencer mon essai"    → WebBrowser.openBrowserAsync(
                                              'https://www.apexcoach.app/?utm_source=ios_app|android_app'
                                          )
                                          [signup gratuit côté web, retour app via deep link]
```

### 8.2 Onboarding post-signup (utilisateur trial fraîchement créé)

```
Set-password OK (deep link)
  → if Pro : /nutrition/preferences (mobile mirror)
  → else   : /questionnaire (mobile mirror)
              → 24 steps (avec celebration entre milestones)
              → /questionnaire/recap (édition par section)
              → submit
              → /questionnaire/success (loader + polling génération IA ~60s)
              → redirect /programme (Tab Programme)
```

### 8.3 Boucle d'utilisation hebdomadaire

```
Tab Programme
  → WeekCards (progressive unlock)
  → clic session
  → SessionDetailModal (warmup + exos + cooldown)
  → "Démarrer la séance"
  → Tab Entrainement (mode ActiveWorkout)
      → warmup → prep → exercise (×N) → restChoice → resting → cooldown → completed
      → POST /api/workout/complete-session
  → Toast "Séance terminée !"
  → Bannière "Faire mon bilan hebdo" si bilan dû
  → Tap → Modal Bilan (mirror /bilan)
      → GET /api/session/complete & /api/session/skips
      → submit → POST /api/feedback → POST /api/program/adapt (IA, ~2 min)
      → Modal succès + bouton "Voir mon nouveau programme"
  → retour Tab Programme avec semaine N+1 si déverrouillée
```

### 8.4 Re-engagement / settings / réabonnement

```
Tab Profil
  → Profil (nom + stats)
  → Réglages
      → Changer objectif (modal multi-step → /api/user/change-objective → régen IA)
      → Toggle jeûne intermittent
      → Changer mot de passe
      → Notifications push (toggles)
      → Export RGPD (email)
      → Supprimer mon compte (confirm + logout)
      → Liens légaux (browser)
      → Déconnexion
```

### 8.5 Trial expiré / paywall info-only

```
Tab tap (programme / entrainement / nutrition / bilan)
  → if subscription.isExpired or !isActive:
      PaywallScreen (mobile = info only)
      → message "Ton essai est terminé. Continue ton abonnement sur apexcoach.app"
      → CTA browser
          → WebBrowser.openBrowserAsync(
                'https://www.apexcoach.app/checkout?utm_source=ios_app|android_app'
            )
      → AUCUN bouton "S'abonner X €/mois" dans l'app
```

---

## 9. Écarts intentionnels mobile (modèle Netflix)

| Sujet | Web | Mobile |
|-------|-----|--------|
| Affichage de prix | ✅ partout (`/pricing`, `/checkout`, paywall) | ❌ **jamais** (App Store rejection sinon) |
| Bouton "S'abonner" | ✅ | ❌ — remplacé par "Continuer sur apexcoach.app" |
| In-app purchase (IAP) | ❌ (Stripe direct) | ❌ |
| Stripe SDK natif | n/a | ❌ |
| Paywall | Bloque l'accès si pas abonné | **Info-only** (informe + CTA browser) |
| Redeem promo | Page dédiée `/redeem` | Page dédiée (gratuit, Apple-OK) |
| Signup trial | Sur le site | Possible depuis l'app (gratuit, Apple-OK) |
| Conversion payante | Stripe Checkout | **Toujours** `WebBrowser` vers `apexcoach.app` |
| Email transactionnels | Resend (déjà branché web) | Idem (le serveur envoie) |
| PWA install prompt | ✅ | ❌ (l'app est déjà installée) |
| Cookies consent | ✅ | ❌ (mobile = ATT prompt Apple + GDPR consent natif) |
| Analytics web (GA) | ✅ | ❌ (mobile = Sentry + Apple Search Ads attribution + Play Install Referrer) |

---

## 10. Ouvrages indispensables côté repo mobile

Avant d'implémenter, **vérifier** :
- `lib/validations/step1.ts → step6.ts` — déjà copiés (Sprint 1), réutiliser tel quel pour le questionnaire mobile.
- `lib/validations/nutrition-preferences.ts` — déjà copié, réutiliser.
- `lib/programs/schemas.ts` — déjà copié ; **à enrichir** côté web pour exposer les URLs vidéo (prérequis du modal vidéo embarqué).
- `lib/subscription/progressive-unlock.ts` — déjà copié, déterminisme garanti côté serveur via Supabase RLS + côté client via le helper.
- `lib/fasting/date-calculation.ts` — déjà copié.
- `lib/config/pricing.ts` — déjà copié (déjà sans Starter, déjà avec Coaching/Coaching Pro).

> **Règle d'or** : si le web change l'un de ces fichiers, MR7 (Web Sync) doit générer une PR `chore: sync from web` côté mobile.

---

## 11. Points de vigilance (issus de l'audit)

1. **`/auth/set-password` flow Stripe** : 6 retries avec backoff exponentiel (~35s) — l'app mobile ne voit jamais ce flow (paiement = browser), mais le retour deep link Stripe → set-password doit gérer `flow=trial|promo` uniquement.
2. **`/bilan` déclenche `/api/program/adapt` qui est asynchrone** : prévoir polling côté mobile + UX pendant la régénération (~2 min). Idem pour `change-objective`.
3. **`/nutrition` peut être en état "génération échouée"** : mirror `POST /api/programs/retry-nutrition` côté mobile.
4. **Progressive unlock** : la date de déverrouillage des semaines dépend du `subscription.created_at` ET du dernier `bilan` complété. Logique pure mais critique pour ne pas afficher un mauvais countdown.
5. **`HealthDataConsentModal`** : scroll-to-bottom + 4 checkboxes obligatoires avant validation. RGPD strict — ne pas court-circuiter.
6. **`auto-trigger modals`** (PWAInstallModal, WhatsNewModal, CookieConsent) : ne pas mirrorer, mais prévoir un système équivalent côté mobile pour annoncer les changements (banner "What's new" si app majeure).
7. **Génération vidéo / signed URL** : le web utilise `useExerciseVideo` hook. Côté mobile, prévoir cache local + signed URL refresh.
8. **Pain zones (heatmap)** : composant custom côté web. Côté mobile, soit on porte le SVG soit on simplifie en multi-select (à arbitrer).
9. **Analytics chart** : `victory-native` ou `react-native-svg-charts` pour mirror `TrendCharts`, `WellnessRadar`, `PainZonesChart`.
10. **Animations questionnaire** : `ImmersiveBackground` + `MilestoneCelebration` font fortement appel à Framer Motion. Côté mobile, `react-native-reanimated` + `react-native-skia` peuvent reproduire l'effet.

---

## 12. Mapping global vers les sprints

| Sprint mobile | Périmètre web miroir |
|---------------|----------------------|
| **Sprint 2** | `/programme`, `/entrainement` (+ session/[id] redirect), `/nutrition`, banners progressive unlock + fasting + trial/promo expiry, affiliés, modals `SessionDetailModal` / `RestTimerFullscreen` / `ExerciseVideoModal`, drag-drop prep, timer libre |
| **Sprint 3** | Welcome non-connecté + browser CTA, `/(auth)/login` polish, `/auth/reset-password` deep link, `/auth/set-password` (promo + trial), `/redeem`, `/questionnaire` (24 steps), `/questionnaire/recap`, `/questionnaire/success`, `/nutrition/preferences`, paywall info-only, attribution Apple Search Ads + Play Install Referrer, tutoriel premier lancement |
| **Sprint 4** | `/bilan` (modal), `/analytics` (= Tab Bilan), `/profil` (polish), `/settings` complet (objectif, jeûne, mdp, push, RGPD, delete, logout, reviews), notifications push (Expo Notifications), Sentry mobile, banners GracePeriod, polish UX |
| **Sprint 5** | Publication TestFlight + Play Internal + ASO + `.well-known/apple-app-site-association` + buffer review stores |

> Chaque ticket des sprints 2-5 réécrits **doit pouvoir citer une route ou un modal de ce document**. Si un ticket ne mappe à rien ici, c'est qu'il est hors scope ou qu'il manque dans l'audit.

---

## Annexes

- Brief de refonte : `docs/sprints/REFONTE_BRIEF.md`
- Spec mobile historique : `Apex-Coach/docs/MOBILE_APP_TECHNICAL_SPEC_v2.md` (v2.0, à utiliser comme **contexte**, pas comme source de vérité)
- Audit Phase 0 (fichiers partagés) : `docs/AUDIT_PHASE_0.md`
- Vue routines mobile : `docs/routines/README.md`
- PRs livrées Sprint 2 :
  - [#29](https://github.com/Azizbnb/Apex-Coach-mobile/pull/29) — Assemblage Programme/Semaine/SessionDetail/SessionComplete
  - [#30](https://github.com/Azizbnb/Apex-Coach-mobile/pull/30) — Icons + routes FR
  - [#31](https://github.com/Azizbnb/Apex-Coach-mobile/pull/31) — Flow entraînement 6 phases
