# Sprint 4 — Bilan + Analytics + Settings + Reviews + Notifications + Sentry + Polish

> **Source de vérité :** `docs/sprints/WEB_FLOW_AUDIT.md` (sections 5.18 à 5.22 + 6.5 + 7.4, 7.7, 7.8 et 7.11)
> **Livrable :** boucle hebdomadaire complète (séance → bilan → adaptation IA → analytics) + tab Profil + tab Bilan + section Réglages complète + notifications push + Sentry mobile.
> **Total tickets :** 20

---

## A — Bilan hebdomadaire (mirror `/bilan/formulaire`)

> Web : la vue progression est `app/(dashboard)/bilan/page.tsx` (553 lignes, vue résumé — couverte par §B Tab Bilan ci-dessous). Le **vrai formulaire** est `app/(dashboard)/bilan/formulaire/page.tsx` (1026 lignes, logique form inline, sans composant `BilanForm` séparé côté web). Côté mobile, on en fait un **modal plein écran** présenté depuis Tab Bilan ou via banner « Faire mon bilan ». L'envoi déclenche `POST /api/feedback` puis `POST /api/program/adapt` (asynchrone, ~2 min).

### S4-T01: Modal `(modals)/bilan-formulaire.tsx` (mirror `/bilan/formulaire`)

- **Statut :** todo
- **Estimation :** L (~380 LOC, high)
- **Dépendances :** aucune
- **Fichiers :** `app/(modals)/bilan-formulaire.tsx`, `components/bilan/BilanForm.tsx` (nouveau, isolé en mobile pour la maintenabilité), `components/bilan/PainZonesPicker.tsx` (nouveau)
- **Critères d'acceptance :**
  - [ ] Charge contexte au mount : `GET /api/session/complete?week=N` (completion %) + `GET /api/session/skips?week=N` (exercices sautés)
  - [ ] Section 1 — Ressenti : sliders 1-5 pour difficulté, énergie, soreness, motivation, sommeil, stress
  - [ ] Section 2 — Pain zones : composant heatmap corporel (mirror web). Si trop complexe, fallback multi-select des zones (épaules, dos, lombaires, genoux, etc.) à arbitrer Sprint 4
  - [ ] Section 3 — Poids : input `weight_kg` (semaines paires uniquement, conditionnel)
  - [ ] Section 4 — Skip reasons : textarea + multi-select si exercices sautés détectés
  - [ ] Section 5 — Jeûne : conditionnel si `is_fasting_active` → `fasting_days_count` + `fasting_difficulty` + boutons "Continuer" / "Stop"
  - [ ] Submit → `POST /api/feedback` → toast succès + `POST /api/program/adapt` en background → écran d'attente avec loader pendant l'adaptation IA (~2 min) → fermeture modal + redirect Tab Programme avec semaine N+1
  - [ ] Validation Zod (créer `lib/validations/bilan.ts` si manque)
  - [ ] Tests : rendu sections conditionnelles + submit succès + gestion timeout adapt
- **Mirror web :** `app/(dashboard)/bilan/formulaire/page.tsx` (cf. WEB_FLOW_AUDIT §5.19)
- **Notes :** **critique** pour la boucle de personnalisation Coaching+. Sans bilan, pas d'adaptation IA. La logique web est inline (1026 lignes) — côté mobile on isole en composants pour faciliter les tests.

### S4-T02: Adaptation IA — polling et UX d'attente

- **Statut :** todo
- **Estimation :** M (~150 LOC, med)
- **Dépendances :** S4-T01
- **Fichiers :** `components/bilan/AdaptationProgress.tsx`, `hooks/usePollAdaptation.ts`
- **Critères d'acceptance :**
  - [ ] Loader animé pendant l'adaptation IA (~2 min)
  - [ ] Polling Supabase `programs.adaptation_status` toutes les 5s (max 180s)
  - [ ] Messages évolutifs : "Analyse de ton bilan..." → "Ajustement de ton programme..." → "Régénération du plan nutrition..." (si Pro) → "Prêt !"
  - [ ] Si timeout → toast + offre de réessayer
  - [ ] Succès → fermeture modal + animation succès + redirect Tab Programme
- **Mirror web :** logique post-submit de `app/(dashboard)/bilan/page.tsx`

### S4-T03: Bannière "Faire mon bilan" (mirror trigger web)

- **Statut :** todo
- **Estimation :** S (~80 LOC, low)
- **Dépendances :** S4-T01
- **Fichiers :** `components/bilan/BilanDueBanner.tsx`, intégrer dans `app/(tabs)/programme/index.tsx` + `app/(tabs)/bilan/index.tsx`
- **Critères d'acceptance :**
  - [ ] Affiché si la semaine en cours est complétée (≥80% sessions) ET aucun bilan n'a été soumis pour cette semaine
  - [ ] Tap → ouvre `(modals)/bilan-formulaire` avec param `weekNumber`
  - [ ] Animation pulse douce pour attirer l'œil
  - [ ] Test : conditions d'affichage
- **Mirror web :** logique de déclenchement (web utilise un toast / nav highlight)

---

## B — Tab Bilan (mirror `/bilan` vue progression + `/analytics`)

> Web : `app/(dashboard)/bilan/page.tsx` (553 lignes) = **« Ma Progression — Vue résumé »** : historique des bilans + stats globales (poids, complétion, moyennes). `app/(dashboard)/analytics/page.tsx` = stats long-terme (Pro, ≥4 bilans, charts détaillés). Sur mobile on consolide en un **tab Bilan** qui contient : (a) overview de la semaine en cours + bouton "Faire mon bilan", (b) historique des bilans précédents, (c) charts analytics (gated Pro avec ≥4 bilans).

### S4-T04: Écran `(tabs)/bilan/index.tsx` (consolidé)

- **Statut :** todo
- **Estimation :** L (~320 LOC, med)
- **Dépendances :** S4-T01, S4-T05
- **Fichiers :** `app/(tabs)/bilan/index.tsx`, `components/bilan/{Overview,History,AnalyticsSection}.tsx`
- **Critères d'acceptance :**
  - [ ] Section 1 — Overview : semaine en cours + bouton "Faire mon bilan" si dû (sinon "Bilan complété ✓") → ouvre modal `bilan-formulaire` (S4-T01)
  - [ ] Section 2 — Historique : liste des bilans précédents (date, semaine, scores moyens) — tap pour voir détails. Mirror direct de `app/(dashboard)/bilan/page.tsx`
  - [ ] Section 3 — Analytics : si !Pro → `FeatureGate` info + CTA paywall ; si <4 bilans → empty state "Continue tes bilans pour débloquer tes stats" ; sinon → charts (S4-T05). Mirror direct de `app/(dashboard)/analytics/page.tsx`
  - [ ] Skeleton + pull-to-refresh
  - [ ] Tests : 3 états (overview + history + analytics gated)
- **Mirror web :** `app/(dashboard)/bilan/page.tsx` (sections overview + history) + `app/(dashboard)/analytics/page.tsx` (section analytics) (cf. WEB_FLOW_AUDIT §5.18 + §5.20)

### S4-T05: Composants Analytics — `TrendCharts`, `WellnessRadar`, `PainZonesChart`

- **Statut :** todo
- **Estimation :** L (~400 LOC, high)
- **Dépendances :** aucune
- **Fichiers :** `components/bilan/{TrendCharts,WellnessRadar,PainZonesChart}.tsx`, `lib/analytics/aggregate.ts`
- **Critères d'acceptance :**
  - [ ] `TrendCharts` : 4 courbes (completion %, difficulté moyenne, énergie moyenne, stress) via `victory-native` ou `react-native-svg-charts`
  - [ ] `WellnessRadar` : radar 6 axes (sommeil, énergie, motivation, soreness, stress, douleur)
  - [ ] `PainZonesChart` : visualisation des zones douloureuses fréquentes (heatmap simplifiée)
  - [ ] `lib/analytics/aggregate.ts` : helpers pour agréger les `program_feedback` (moyenne mobile 4 semaines, déviation, tendance)
  - [ ] Tous gérent dark mode + animations d'entrée
  - [ ] Tests : agrégation + rendu avec mock data
- **Mirror web :** composants associés à `app/(dashboard)/analytics/page.tsx` (cf. WEB_FLOW_AUDIT §5.20)
- **Notes :** lib charts à choisir au début du sprint (preview `victory-native` vs alternative). Cohérence couleurs avec design system (`apex-lime-500` pour la métrique principale).

---

## C — Tab Profil + Réglages (mirror `/profil` + `/settings`)

### S4-T06: Écran `(tabs)/profile/index.tsx` complet

- **Statut :** todo (refonte du placeholder Sprint 1)
- **Estimation :** L (~280 LOC, med)
- **Dépendances :** S4-T07, S4-T08, S4-T09, S4-T13
- **Fichiers :** `app/(tabs)/profile/index.tsx`, `components/profile/{ProfileHeader,ProfileStats,SettingsSection}.tsx`
- **Critères d'acceptance :**
  - [ ] Header : avatar (initiales si pas de photo) + nom + plan actuel (Coaching / Coaching Pro / Trial / Free)
  - [ ] Édition du nom inline → `PATCH /api/profile/name`
  - [ ] Section Stats : taille, poids, IMC, âge, sexe (lecture seule depuis `questionnaire_responses`)
  - [ ] Section Mon abonnement : statut + date renouvellement + CTA "Gérer mon abonnement" → browser
  - [ ] Sections settings (liens vers écrans dédiés) : Changer objectif (S4-T07), Jeûne (S4-T08), Mot de passe (S4-T09), Notifications (S4-T10), Avis (S4-T13), Données RGPD (S4-T11), Supprimer le compte (S4-T12)
  - [ ] Footer : liens légaux (browser) + version app + déconnexion
  - [ ] Tests : rendu sections + édition nom
- **Mirror web :** `app/(dashboard)/profil/page.tsx` + `app/(dashboard)/settings/page.tsx` (cf. WEB_FLOW_AUDIT §5.21-5.22)

### S4-T07: Modal `(modals)/change-objective.tsx` (mirror `ChangeObjectiveDialog`)

- **Statut :** todo
- **Estimation :** M (~220 LOC, med)
- **Dépendances :** S4-T02 (UX adaptation IA)
- **Fichiers :** `app/(modals)/change-objective.tsx`, `components/settings/ChangeObjectiveForm.tsx`
- **Critères d'acceptance :**
  - [ ] Multi-step : warning → sélection nouvel objectif → confirmation → submit
  - [ ] Warning : "Ton programme va être régénéré (~2 min)"
  - [ ] Sélection objectif identique au questionnaire (radio cards)
  - [ ] Submit → `POST /api/user/change-objective` puis bascule sur `AdaptationProgress` (réutilise S4-T02)
  - [ ] Tests : flow complet avec mock API
- **Mirror web :** `components/settings/ChangeObjectiveDialog.tsx` (cf. WEB_FLOW_AUDIT §6.5)

### S4-T08: `FastingToggleForm` + intégration Tab Profil

- **Statut :** todo
- **Estimation :** M (~150 LOC, low)
- **Dépendances :** S4-T17 (store settings)
- **Fichiers :** `components/settings/FastingToggleForm.tsx`, `lib/fasting/date-calculation.ts` (déjà copié)
- **Critères d'acceptance :**
  - [ ] Toggle ON/OFF jeûne intermittent
  - [ ] Si ON : sélection créneau (12h / 14h / 16h) + jours/semaine
  - [ ] Persist via `useSettings` (Supabase + SecureStore local)
  - [ ] Mise à jour automatique du flag `is_fasting_active` côté profile
  - [ ] Test : toggle + persistence
- **Mirror web :** `components/settings/FastingToggleForm.tsx`

### S4-T09: `ChangePasswordForm` (changer mot de passe depuis Profil)

- **Statut :** todo
- **Estimation :** M (~150 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/settings/ChangePasswordForm.tsx`
- **Critères d'acceptance :**
  - [ ] Form : mot de passe actuel + nouveau + confirmation + indicateur force
  - [ ] Vérification mdp actuel via `supabase.auth.signInWithPassword` (re-auth silencieuse)
  - [ ] Submit → `supabase.auth.updateUser({ password })` + `POST /api/auth/log-password-change`
  - [ ] Toast succès + redirect Profil
- **Mirror web :** `components/settings/ChangePasswordForm.tsx`

### S4-T10: Section "Notifications" — gestion toggles push

- **Statut :** todo
- **Estimation :** M (~150 LOC, med)
- **Dépendances :** S4-T15, S4-T16, S4-T17
- **Fichiers :** `components/settings/NotificationsForm.tsx`, `app/(tabs)/profile/index.tsx`
- **Critères d'acceptance :**
  - [ ] Toggles : rappel séance, expiration trial, bilan dû, expiration promo
  - [ ] État persisté dans `useSettings().notificationPrefs` + Supabase `user_notification_prefs`
  - [ ] Bouton "Demander la permission" si non encore accordée (deep link iOS Settings si refusé)
  - [ ] Test : rendu + toggle
- **Notes :** front uniquement ici (logique server-side d'envoi = ticket S4-T16).

### S4-T11: `GdprExportButton` (mirror)

- **Statut :** todo
- **Estimation :** S (~100 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/settings/GdprExportButton.tsx`
- **Critères d'acceptance :**
  - [ ] Bouton "Exporter mes données" dans Tab Profil
  - [ ] Tap → `POST /api/gdpr/export` → toast "Tu vas recevoir un email avec ton archive"
  - [ ] Loading state pendant l'appel
- **Mirror web :** `components/settings/GdprExportButton.tsx`

### S4-T12: `DeleteAccountButton` (mirror)

- **Statut :** todo
- **Estimation :** M (~150 LOC, high)
- **Dépendances :** aucune
- **Fichiers :** `components/settings/DeleteAccountButton.tsx`
- **Critères d'acceptance :**
  - [ ] Bouton "Supprimer mon compte" en rouge dans Tab Profil
  - [ ] Confirmation 2 étapes : (1) modal d'avertissement, (2) saisie "SUPPRIMER" en clair
  - [ ] Submit → `POST /api/account/delete` (côté serveur déclenche purge async)
  - [ ] Auto-signout + redirect Welcome non-connecté
  - [ ] Test : flow confirmation
- **Mirror web :** `components/settings/DeleteAccountButton.tsx`

### S4-T13: Section Avis depuis Profil (mirror prompt + form review)

- **Statut :** todo
- **Estimation :** M (~180 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/profile/ReviewSection.tsx`, `app/(modals)/leave-review.tsx`
- **Critères d'acceptance :**
  - [ ] Si pas de review existante → carte "Donne ton avis sur Apex Coach" + CTA → ouvre `leave-review` modal
  - [ ] Si review existante → affichage read-only avec étoiles + texte + date + bouton "Modifier"
  - [ ] Modal `leave-review` : `StarRating` (1-5) + textarea (300 chars max) + submit `POST /api/reviews` ou `PATCH /api/reviews/:id`
  - [ ] Validation via `lib/validations/review.ts` (déjà copié)
  - [ ] Tests : rendu 2 états + submit
- **Mirror web :** `components/reviews/{ReviewForm,ReviewPromptCard}.tsx`

---

## D — Notifications push (Expo Notifications)

### S4-T15: Setup `expo-notifications` + permission timing

- **Statut :** todo
- **Estimation :** M (~200 LOC, high)
- **Dépendances :** aucune
- **Fichiers :** `lib/notifications/index.ts`, `hooks/useNotifications.ts`, `app.json` (plugin)
- **Critères d'acceptance :**
  - [ ] Setup `expo-notifications` (plugin app.json + APN + FCM credentials EAS)
  - [ ] **Demande permission APRÈS la 1ʳᵉ session terminée** (pas au lancement — UX best practice + ATT-style)
  - [ ] Enregistre push token côté serveur : `POST /api/notifications/register-device` avec `{ token, platform, locale }`
  - [ ] Handlers : foreground (toast in-app), background (notification système), killed (notification + cold start → deep link)
  - [ ] Tap notif → deep link approprié (via `lib/deep-linking.ts`)
  - [ ] Tests : permission flow + token registration + handler
- **Mirror web :** pas d'équivalent (web utilise emails). Cf. coordination ci-dessous.

### S4-T16: Catalogue de notifications (rappels, trial, bilan, promo)

- **Statut :** todo
- **Estimation :** M (~150 LOC, med)
- **Dépendances :** S4-T15
- **Fichiers :** `lib/notifications/catalog.ts` (mobile) + côté serveur `Apex-Coach/lib/notifications/*` à étendre
- **Critères d'acceptance — mobile :**
  - [ ] Types définis : `workout_reminder`, `trial_j5`, `trial_j7`, `weekly_feedback_due`, `promo_expiry_j7`, `promo_expiry_j1`
  - [ ] Helper `handleNotificationDeepLink(type)` qui dispatch vers la bonne route
- **Critères d'acceptance — serveur (hors scope MR2 mobile) :**
  - [ ] Cron job `cron-weekly-notifications` (côté web) qui envoie via Expo Push API
  - [ ] Coordination push / email (anti double-spam) : vérifier `notifications_sent` avant envoi email

### S4-T17: Store `stores/settings.ts` (préférences, jeûne, notifs)

- **Statut :** todo
- **Estimation :** M (~150 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `stores/settings.ts`, `hooks/useSettings.ts`
- **Critères d'acceptance :**
  - [ ] State : `fastingEnabled`, `fastingWindow`, `notificationPrefs: { workoutReminder, bilanDue, ... }`, `language: 'fr'`, `tutorialSeen: boolean`
  - [ ] Actions : `toggleFasting`, `toggleNotification`, `setTutorialSeen`, `reset`
  - [ ] Persist via SecureStore local + Supabase `user_settings`
  - [ ] Tests : actions + persistence

---

## E — Sentry + ErrorBoundary + Polish

### S4-T14: Intégration Sentry mobile (`@sentry/react-native`)

- **Statut :** todo
- **Estimation :** M (~140 LOC, high)
- **Dépendances :** aucune
- **Fichiers :** `app.json` (plugin), `app/_layout.tsx` (init), `lib/monitoring.ts`
- **Critères d'acceptance :**
  - [ ] DSN dans `.env` (`EXPO_PUBLIC_SENTRY_DSN`) — **DSN dédié mobile**, distinct du web
  - [ ] Source maps uploadées via EAS Build (config `metro.config.js`)
  - [ ] Tags par défaut : `platform: ios|android`, `app_version`, `expo_version`, `user_plan`
  - [ ] Rate limit côté client (max 100 events/h)
  - [ ] Helper `captureUserContext()` qui synchronise `user_id` + `plan` à chaque changement de session
  - [ ] Filtrage des erreurs liées à `expo-notifications` permission denied (bruit)
  - [ ] Tests : init + capture d'une erreur factice
- **Notes :** voir cohérence DSN/tags avec le web pour faciliter le débogage cross-platform.

### S4-T18: `ErrorBoundary` + `LoadingScreen` + `EmptyState` + `NotificationHandler`

- **Statut :** todo
- **Estimation :** M (~220 LOC, low)
- **Dépendances :** S4-T14
- **Fichiers :** `components/common/{ErrorBoundary,LoadingScreen,EmptyState,NotificationHandler}.tsx`
- **Critères d'acceptance :**
  - [ ] `ErrorBoundary` global dans `app/_layout.tsx` → fallback UI "Quelque chose ne va pas" + bouton "Réessayer" → log Sentry
  - [ ] `LoadingScreen` réutilisable (full-screen avec logo)
  - [ ] `EmptyState` template (icône + titre + sous-titre + CTA)
  - [ ] `NotificationHandler` wrappe `app/_layout.tsx` pour intercepter les taps notifs et dispatcher (lié à S4-T16)
  - [ ] Tests : ErrorBoundary catch + fallback rendu

### S4-T19: Animations polish + transitions (`react-native-reanimated`)

- **Statut :** todo
- **Estimation :** M (~180 LOC, med)
- **Dépendances :** tous tickets UI
- **Fichiers :** divers (questionnaire, modals, tabs)
- **Critères d'acceptance :**
  - [ ] Transitions entre micro-steps questionnaire fluides (slide horizontal 300ms)
  - [ ] Tab bar avec spring animation au switch
  - [ ] Modals avec backdrop fade + slide-up
  - [ ] Confetti à la fin d'un bilan
  - [ ] Tests : durées + easing conformes au design system

### S4-T20: QA devices réels (iOS + Android via EAS Build preview)

- **Statut :** todo
- **Estimation :** M (~0 LOC code, checklist QA, high)
- **Dépendances :** tous les autres tickets S4
- **Fichiers :** `docs/QA_DEVICES.md` (checklist)
- **Critères d'acceptance :**
  - [ ] Build EAS preview iOS + Android
  - [ ] Test devices cibles : iPhone 12+, Pixel 6+, low-end Android (Galaxy A14)
  - [ ] Checklist couvre les 8 flows critiques (login, signup browser-return, questionnaire, programme, séance complète, bilan, settings, paywall info)
  - [ ] Liste des bugs / décalages UI documentée dans le doc
- **Notes :** hors automation MR2 — déclenchement manuel.

---

## Récap des dépendances clés

```
S4-T01 (Bilan modal) ──► S4-T02 (Adaptation polling) ──► S4-T03 (Banner)
S4-T01 ──► S4-T04 (Tab Bilan) ──► S4-T05 (Analytics charts)
S4-T15 (Push setup) ──► S4-T16 (Catalog) + S4-T17 (Settings store) ──► S4-T10 (Notif toggles)
S4-T17 ──► S4-T08 (Fasting toggle)
S4-T06 (Profil) ──► dépend de S4-T07..T09 + T11..T13
S4-T14 (Sentry) ──► S4-T18 (ErrorBoundary)
Tous les UI ──► S4-T19 (Animations) ──► S4-T20 (QA devices)
```

## Vérification end-of-sprint

1. **Boucle hebdo complète** : terminer une séance → bannière bilan apparaît → ouvrir modal bilan → remplir → submit → adaptation IA en cours → arriver Tab Programme avec programme adapté.
2. **Tab Bilan** : voir overview + historique (≥1 bilan) + section analytics gated Pro
3. **Tab Profil** : éditer nom → vérifier persisté ; tap "Changer objectif" → flow complet → adaptation IA ; toggle jeûne → confirmation visible dans Tab Programme (`FastingBanner`)
4. **Suppression compte** : confirmer 2 étapes → user signout + redirect Welcome
5. **Sentry** : déclencher une erreur factice → vérifier dans la console Sentry mobile (DSN dédié)
6. **Notifications** : terminer 1 séance → prompt permission → accepter → tester rappel séance après 1 jour
7. **Reviews** : laisser un avis depuis Profil → vérifier persisté + modifier OK
8. **Grep Netflix** : `S'abonner`, `€/mois`, `IAP`, `RevenueCat` → toujours 0 résultat dans le code
