# Sprint 4 — Notifications + Bilan + Settings + Reviews + Polish + Sentry

> **Spec source :** `Apex-Coach/docs/MOBILE_APP_TECHNICAL_SPEC_v2.md` §18 Sprint 4 (Jours 21-28, ~8j révisé +1j)
> **Livrable :** app complète et testée sur devices réels.
> **Total tickets :** 14

---

### S4-T01: Setup notifications push (`expo-notifications`)

- **Statut :** todo
- **Estimation :** M (~180 LOC, high)
- **Dépendances :** aucune
- **Fichiers :** `lib/notifications.ts` (compléter), `hooks/useNotifications.ts`
- **Critères d'acceptance :**
  - [ ] Demande permission APRÈS la première session terminée (pas au lancement, Spec §19)
  - [ ] Enregistre le push token côté serveur (POST `/api/notifications/register-device`)
  - [ ] Handler foreground/background/killed
  - [ ] Tap sur notif → deep link approprié

### S4-T02: Catalogue de notifications (rappels, trial, bilan, promo)

- **Statut :** todo
- **Estimation :** M (~150 LOC, med)
- **Dépendances :** S4-T01
- **Fichiers :** `lib/notifications.ts`
- **Notes :** types : workout_reminder, trial_j5, trial_j7, weekly_feedback_due, promo_expiry_j7, promo_expiry_j1.

### S4-T03: Coordination push / emails (anti-double-spam)

- **Statut :** todo
- **Estimation :** S (~80 LOC, high)
- **Dépendances :** S4-T02
- **Fichiers :** côté serveur (`Apex-Coach/lib/email/client.ts` + cron `trial-emails`)
- **Notes :** **Hors scope routine MR2 mobile** — à coder côté web. Vérifier `notifications_sent` avant envoi email pour éviter le double-canal.

### S4-T04: Modal `(modals)/weekly-feedback.tsx` (Bilan hebdomadaire)

- **Statut :** todo
- **Estimation :** L (~280 LOC, med)
- **Dépendances :** aucune
- **Fichiers :** `app/(modals)/weekly-feedback.tsx`, `components/programme/WeeklyFeedbackForm.tsx`
- **Critères d'acceptance :**
  - [ ] Form : ressenti, fatigue, douleurs (zones), motivation, fasting metrics si actif
  - [ ] StarRating pour chaque dimension
  - [ ] POST `/api/bilan/submit` puis trigger réadaptation IA
  - [ ] Toast confirmation + redirige `(tabs)/programme`

### S4-T05: Écran `(tabs)/progress/index.tsx` (Stats + bilan history)

- **Statut :** todo
- **Estimation :** L (~300 LOC, med)
- **Dépendances :** S4-T04
- **Fichiers :** `app/(tabs)/bilan/index.tsx`
- **Critères d'acceptance :**
  - [ ] Charts : adhésion, volume, progression poids (Recharts ou Victory Native)
  - [ ] Historique bilans hebdo
  - [ ] Section analytics (gated Coaching Pro)
  - [ ] Skeleton + empty state

### S4-T06: Écran `(tabs)/profile/index.tsx` complet (Profil + Settings)

- **Statut :** todo
- **Estimation :** L (~280 LOC, med)
- **Dépendances :** S4-T07, S4-T08
- **Fichiers :** `app/(tabs)/profile/index.tsx`
- **Critères d'acceptance :**
  - [ ] Vue profil (avatar, nom, plan)
  - [ ] Sections : Mon abonnement / Paramètres / Mes avis / Aide / Confidentialité / Déconnexion
  - [ ] Bouton "Supprimer mon compte" → confirmation 2 étapes → POST `/api/user/delete-account`

### S4-T07: Composants Fasting (`FastingBanner`, `FastingToggle`)

- **Statut :** todo
- **Estimation :** M (~150 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/fasting/{FastingBanner,FastingToggle}.tsx`, `stores/settings.ts`
- **Notes :** copier la logique depuis `Apex-Coach/lib/fasting/date-calculation.ts` (déjà partagé en mobile). Toggle dans settings.

### S4-T08: Store `stores/settings.ts` (préférences, jeûne, notifs)

- **Statut :** todo
- **Estimation :** M (~150 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `stores/settings.ts`, `hooks/useSettings.ts`
- **Critères d'acceptance :**
  - [ ] State : fastingEnabled, notificationsEnabled, language (FR fixed)
  - [ ] Actions : toggle*, reset
  - [ ] Persist via SecureStore

### S4-T09: Section Reviews dans Profile (laisser un avis depuis l'app)

- **Statut :** todo
- **Estimation :** M (~150 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/profile/ReviewSection.tsx`
- **Critères d'acceptance :**
  - [ ] Affiche review existante (read-only) ou form
  - [ ] StarRating + texte (300 chars max)
  - [ ] POST `/api/reviews/submit` (validation Zod côté `lib/validations/review.ts`)

### S4-T10: Composants common (`LoadingScreen`, `ErrorBoundary`, `EmptyState`, `NotificationHandler`)

- **Statut :** todo
- **Estimation :** M (~200 LOC, low)
- **Dépendances :** aucune
- **Fichiers :** `components/common/*.tsx`
- **Notes :** ErrorBoundary intégré dans `app/_layout.tsx`. NotificationHandler wrappe l'app pour intercepter taps.

### S4-T11: Animations + transitions (`react-native-reanimated`)

- **Statut :** todo
- **Estimation :** M (~150 LOC, med)
- **Dépendances :** aucune
- **Fichiers :** divers (questionnaire, modals, tabs)
- **Critères d'acceptance :**
  - [ ] Transitions entre micro-steps fluides (slide horizontal)
  - [ ] Tab bar avec spring animation
  - [ ] Modals avec backdrop fade

### S4-T12: Intégration Sentry mobile (`@sentry/react-native` ou `sentry-expo`)

- **Statut :** todo
- **Estimation :** M (~120 LOC, high)
- **Dépendances :** aucune
- **Fichiers :** `app.json` (plugin), `app/_layout.tsx` (init), `lib/monitoring.ts`
- **Critères d'acceptance :**
  - [ ] DSN dans `.env` (`EXPO_PUBLIC_SENTRY_DSN`)
  - [ ] Source maps uploadées via EAS
  - [ ] Tag plateforme + version
  - [ ] Rate limit côté client (max 100 events/h)

### S4-T13: Tests sur devices réels (iOS + Android via EAS Build preview)

- **Statut :** todo
- **Estimation :** M (~0 LOC code, mais checklist QA, high)
- **Dépendances :** tous les autres
- **Fichiers :** `docs/QA_DEVICES.md` (checklist)
- **Notes :** déclenche EAS Build manuellement avant. Test : iPhone 12+, Pixel 6+, low-end Android. Hors automation MR2.

### S4-T14: Polish UI + fix bugs (catch-all)

- **Statut :** todo
- **Estimation :** L (~variable, med)
- **Dépendances :** S4-T13
- **Fichiers :** divers
- **Notes :** ticket parapluie pour les retours QA Sprint 4. MR1 doit le diviser en sous-tickets après QA.
