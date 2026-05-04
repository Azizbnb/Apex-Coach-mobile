# Audit Phase 0 — Doc mobile vs code réel

> **Date :** 2026-05-03
> **Objectif :** Vérifier que `CLAUDE.md` mobile et la spec sont fiables avant d'instancier les skills mobile et la boucle MR1-MR7.

---

## 1. Drifts critiques détectés

### 1.1 Référence brisée vers la spec
- `CLAUDE.md` mobile ligne 5 référence `MOBILE_APP_TECHNICAL_SPEC.md`
- Le fichier réel est `MOBILE_APP_TECHNICAL_SPEC_v2.md` (renommé v2.0 le 14 avril 2026)
- **Action :** corriger la référence

### 1.2 Pricing désynchronisé avec le web
- `CLAUDE.md` mobile lignes 30-37 affirme **3 plans actifs** (Starter + Coaching + Coaching Pro)
- Source de vérité (`Apex-Coach/lib/config/pricing.ts` v3.1, avril 2026) : **Starter complètement supprimé** (`PlanId = 'coaching' | 'coaching_pro'`)
- `apex-coach-mobile/lib/config/pricing.ts` garde encore Starter avec `hidden: true` — divergence
- Spec v2 changelog item #8 confirme : « Plan Starter supprimé (avril 2026), 2 plans actifs »
- **Action :** aligner CLAUDE.md mobile + décider si on garde Starter `hidden` ou si on supprime complètement (cohérence stricte web)

### 1.3 Stack incomplète
- `CLAUDE.md` mobile ligne 17-26 oublie React 19.2.0 (RN 0.83 utilise React 19, point notable)
- Pas mention de `react-native-reanimated` 4.2.2 (utilisé pour les animations)
- **Action :** ajouter à la table stack

### 1.4 Sprints : 4 vs 5
- `CLAUDE.md` mobile section 12 affirme 4 sprints
- Spec v2 section 18 définit 5 sprints (Sprint 5 = Publication, ajouté en v2.0)
- **Action :** aligner sur 5 sprints

---

## 2. Fichiers manquants par sprint

| Sprint | Fichier(s) prévu(s) par la spec | Statut |
|--------|--------------------------------|--------|
| 2 | `components/programme/{WeekCard,SessionCard,ExerciseCard,ProgressRing}.tsx` | À créer |
| 2 | `components/workout/{ActiveWorkout,SetTracker,RestTimer,ExerciseVideoPlayer,CompletionScreen}.tsx` | À créer |
| 2 | `components/nutrition/{MealPlanCard,MacroSummary,ShoppingList,RecipeDetail}.tsx` | À créer |
| 2 | `components/subscription/{TrialBanner,PromoExpiryBanner,PaywallScreen,PlanComparison,FeatureGate}.tsx` | À créer |
| 2 | `components/affiliate/{AffiliateLink,EquipmentRecs,SupplementRecs}.tsx` | À créer |
| 2 | `stores/workout.ts` (session active + timer) | À créer |
| 2 | `hooks/useWorkout.ts` | À créer |
| 3 | `app/(auth)/redeem.tsx` (rédemption code promo) | À créer |
| 3 | `app/(onboarding)/questionnaire/step1-6.tsx` + `recap.tsx` | À créer |
| 3 | `lib/device-fingerprint.ts` (anti-abus mobile) | À créer |
| 3 | `lib/validations/promo-code.ts` | À créer |
| 3 | `app/(modals)/paywall.tsx` (dans (modals)/) | À créer |
| 3 | Page web `apexcoach.app/checkout/mobile` (côté projet web, pas mobile) | À créer côté web |
| 4 | `stores/settings.ts` + hooks/useNotifications, hooks/useTrialCountdown | À créer |
| 4 | `app/(modals)/{rest-timer,weekly-feedback,affiliate-product}.tsx` | À créer |
| 4 | `components/fasting/{FastingBanner,FastingToggle}.tsx` | À créer |
| 4 | `components/common/{LoadingScreen,ErrorBoundary,EmptyState,NotificationHandler}.tsx` | À créer |
| 4 | Sentry mobile (`sentry-expo` ou `@sentry/react-native`) | Pas installé |
| 5 | `.well-known/apple-app-site-association` + `assetlinks.json` (côté web) | À créer côté web |

---

## 3. Conventions à clarifier avant les skills

| Question | Réponse projet | Source |
|----------|---------------|--------|
| Stocker `subscription` dans `auth-store` ou store séparé ? | **Store séparé** (`stores/subscription.ts`) | Mobile actuel — meilleur que la spec qui propose tout dans auth |
| Chiffrement Step 5 côté client ? | **Non**, déléguer au serveur (HTTPS suffit) | Spec v2 §10 + risque mitigation §19 |
| Turnstile mobile ? | **Pas de Turnstile RN** → device fingerprint natif | Spec v2 §5.6 |
| MMKV pour cache ? | Mentionné spec mais pas installé | Sprint 4 polish (V2) |
| Sentry-expo ? | À installer Sprint 4 | Spec v2 §18 Sprint 5 |

---

## 4. Décisions appliquées en Phase 0

1. `CLAUDE.md` mobile mis à jour vers v1.2.0 (référence spec corrigée, pricing aligné, stack complète, 5 sprints)
2. `lib/config/pricing.ts` mobile : **Starter à supprimer complètement** (décision user 03/05/2026) — alignement strict avec le web qui a déjà supprimé le plan en avril 2026
3. Backlog Sprint 2-5 rédigé dans `docs/sprints/{backlog,sprint-2,sprint-3,sprint-4,sprint-5}.md`
4. Tous les fichiers manquants listés en section 2 deviennent des **issues GitHub** que MR1 fragmentera

---

## 5. Stratégie paiement — Modèle Netflix (décision finale 04/05/2026)

**Décision user 04/05/2026 :** ni Reader Model, ni IAP natif. **App 100% gratuite, paiement uniquement web (Stripe), modèle Netflix.**

**Justification :** 0% commission Apple/Google, pricing préservé partout (14,90€ / 24,90€), pas de risque rejet App Store, simplification massive du code mobile.

**Architecture :**

| Cas | Comportement mobile |
|-----|---------------------|
| App ouverte non-connecté | Welcome screen → CTA browser vers `apexcoach.app/?utm_source=ios_app` |
| Signup + questionnaire + trial 7j | **Possible dans l'app** (POST `/api/auth/create-trial-account`, gratuit donc Apple OK) |
| Code promo (partenariat) | **Possible dans l'app** (POST `/api/promo/validate`, gratuit) |
| Trial expiré ou feature payante | Paywall **informational** : « Continue sur apexcoach.app » + CTA browser |
| Aucun mention de prix dans l'app | Stratégique pour ASO + 0 friction Apple |
| Tracking attribution | Apple Search Ads API + UTM `source=ios_app\|android_app` |
| App Store name | « Apex Coach — Coaching IA Personnalisé » (titre 30 + sous-titre 30) |

**Tickets Sprint 3 supprimés (5 IAP + 0 Reader déjà supprimés) :**
- ~~S3-T19~~ Setup expo-iap → **N/A**
- ~~S3-T20~~ IAPCheckout → **N/A**
- ~~S3-T21~~ useIAPPurchase → **N/A**
- ~~S3-T22~~ Endpoint /api/iap/verify-receipt → **N/A**
- ~~S3-T23~~ Migration subscriptions.source → **N/A**

**Tickets Sprint 3 refondus :**
- `S3-T01` Welcome slides : refondu pour CTA web (au lieu de "Commencer mon essai" interne)
- `S3-T13` Paywall : refondu en **PaywallInformational** (CTA browser, pas IAP)

**Tickets Sprint 3 nouveaux (Modèle Netflix) :**
- `S3-T19` (réutilisé) : Welcome screen non-connecté + CTA browser vers apexcoach.app
- `S3-T20` (réutilisé) : Hook `useAppAttribution` (Apple Search Ads API + UTM)

**Tickets Sprint 5 mis à jour :**
- `S5-T04` ASO iOS : préciser titre « Apex Coach — Coaching IA Personnalisé »
- `S5-T05` ASO Android : titre équivalent

---

## 6. À valider par toi (utilisateur)

- [x] 5 sprints (incl. Sprint 5 = Publication) — validé
- [x] Starter supprimé complètement du PlanId mobile — validé 03/05/2026
- [x] Découpage backlog 1 fichier par sprint — validé
- [x] **Modèle paiement : App gratuite Netflix-style** — validé 04/05/2026
- [x] Signup + trial mobile : OUI — validé 04/05/2026
- [x] Codes promo redeem mobile : OUI — validé 04/05/2026
