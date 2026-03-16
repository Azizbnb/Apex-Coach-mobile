# CLAUDE.md - Apex Coach Mobile (Expo)

> **Version :** 1.1.0 — Sprint 1 audité et corrigé
> **Parent :** Ce projet est le client mobile natif d'Apex Coach. Le backend est documenté dans `C:\Users\benta\Apex-Coach\CLAUDE.md`.
> **Spec directrice :** `C:\Users\benta\Apex-Coach\docs\MOBILE_APP_TECHNICAL_SPEC.md`

---

## 1. Vue d'ensemble

App mobile Expo qui consomme le même backend Next.js/Supabase que le web. **Zéro modification backend** — l'app est un client natif qui utilise les mêmes API, les mêmes types, et les mêmes règles métier.

### Stack technique

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| **Framework** | Expo (managed workflow) | 55.0.6 |
| **Runtime** | React Native | 0.83.2 |
| **Routing** | Expo Router (file-based) | 55.0.5 |
| **Langage** | TypeScript | 5.9 |
| **Auth** | @supabase/supabase-js + expo-secure-store | 2.99.2 |
| **State** | Zustand | 5.0.12 |
| **UI/Styling** | NativeWind (Tailwind RN) | 4.2.3 |
| **Formulaires** | React Hook Form + Zod | 7.71 / 4.3 |
| **Icons** | lucide-react-native | 0.577 |
| **Navigation** | Bottom Tabs + Stack + Modals | — |

### Modèle économique (Reader Model)

Paiement 100% web via Stripe — 0% commission Apple/Google. L'app ouvre le navigateur système pour le checkout.

| Plan | Prix | Dashboard | Nutrition |
|------|------|-----------|-----------|
| Starter | 29€ one-time | Non | Non |
| Coaching | 14,90€/mois | Oui | Non |
| Coaching Pro | 24,90€/mois | Oui | Oui |

---

## 2. Architecture

```
App Mobile Expo (ce repo)
    │
    │ Direct Supabase (Sprint 1) + HTTPS API routes (Sprint 2+)
    ▼
Backend existant (Next.js / Vercel) — AUCUNE modification
├── 55 API Routes
├── Supabase Auth + RLS
└── Stripe (Reader model — checkout via browser)
```

### Sprint 1 (actuel) : Requêtes Supabase directes

L'app utilise le client Supabase RN avec RLS pour accéder aux données. Le wrapper `apiFetch()` est préparé pour Sprint 2 (Bearer token vers API routes Next.js).

### Clients Supabase

- **Unique client** : `lib/supabase/client.ts`
- Token JWT stocké dans `expo-secure-store` (pas AsyncStorage)
- Chunking automatique pour tokens > 2048 bytes (limite SecureStore)
- Fallback `localStorage` pour expo web dev uniquement

---

## 3. Structure du projet

```
apex-coach-mobile/
├── app/                            # Expo Router (file-based)
│   ├── _layout.tsx                # Root: Stack(auth, tabs, modals), splash screen
│   ├── index.tsx                  # Auth guard → login ou dashboard
│   ├── (auth)/                    # Stack: login, signup, forgot-password, set-password
│   ├── (tabs)/                    # Bottom tabs (5 onglets)
│   │   ├── programme/             # index.tsx + [weekNumber].tsx
│   │   ├── workout/               # Placeholder Sprint 2
│   │   ├── nutrition/             # Gated Coaching Pro
│   │   ├── progress/              # Placeholder Sprint 2
│   │   └── profile/               # Profil + déconnexion
│   ├── (modals)/                  # exercise-detail, session-complete
│   ├── (onboarding)/              # welcome (Sprint 3 placeholder)
│   └── (payment)/                 # checkout (Sprint 4 placeholder)
│
├── hooks/                          # Convenience hooks: useAuth, useSubscription, useProgram
│
├── components/ui/                  # 11 composants : Button, Card, Input, Badge,
│                                   #   Text, SafeView, LoadingSpinner, ProgressBar,
│                                   #   Skeleton, StarRating, Calendar
│
├── stores/                         # Zustand stores
│   ├── auth.ts                    # User, session, profile, initialize, signIn/Out
│   ├── subscription.ts            # Plan, isActive, hasDashboard, hasNutrition
│   ├── program.ts                 # Programme data + progressive unlock helpers
│   └── nutrition.ts               # Preferences + plan
│
├── lib/
│   ├── supabase/client.ts         # Client Supabase RN + LargeSecureStore (chunk atomicity)
│   ├── api.ts                     # profileApi, subscriptionApi, programApi, nutritionApi,
│   │                              #   feedbackApi, affiliateApi, reviewsApi + apiFetch
│   ├── constants.ts               # Couleurs centralisées, TAB_BAR, API_URL, deep link config
│   ├── notifications.ts           # Push notifications placeholder (Sprint 4)
│   ├── deep-linking.ts            # Deep link config + URL parsing (Sprint 3)
│   ├── config/pricing.ts          # Plans, prix, feature access helpers
│   └── subscription/
│       └── progressive-unlock.ts  # Déverrouillage semaines J+0/7/14/21
│
├── lib/validations/               # Schemas Zod COPIÉS du web (15+ fichiers)
│   ├── step1.ts → step6.ts       # Questionnaire (identiques au web)
│   ├── review.ts
│   ├── nutrition-preferences.ts
│   └── ...
│
├── lib/fasting/                    # Calcul semaines jeûne (copié du web)
├── lib/affiliate/                  # Catalogues équipement + compléments
├── lib/programs/schemas.ts         # Validation Zod programmes IA
│
├── types/index.ts                  # Types TS complets (700+ lignes)
│
├── app.json                        # Config Expo (scheme: apexcoach, dark mode)
├── eas.json                        # EAS Build configs
├── tailwind.config.ts              # NativeWind + couleurs Apex
└── .env.example                    # EXPO_PUBLIC_SUPABASE_URL, _ANON_KEY, _API_URL
```

---

## 4. Navigation & Routing

### Structure Expo Router

| Groupe | Type | Contenu |
|--------|------|---------|
| `(auth)` | Stack | login, signup, forgot-password, set-password |
| `(tabs)` | Bottom Tabs | programme, workout, nutrition, progress, profile |
| `(modals)` | Modal Stack | exercise-detail, session-complete |
| `(onboarding)` | Stack | welcome (Sprint 3 placeholder) |
| `(payment)` | Stack | checkout (Sprint 4 placeholder) |

### Tab Bar

| Tab | Icône (Lucide) | Gating |
|-----|----------------|--------|
| Programme | Dumbbell | Tous |
| Entraînement | Play | Tous |
| Nutrition | Apple | Coaching Pro |
| Progrès | TrendingUp | Coaching+ |
| Profil | User | Tous |

### Auth Guard

`app/index.tsx` redirige selon `session` :
- Authentifié → `/(tabs)/programme`
- Non authentifié → `/(auth)/login`

---

## 5. State Management (Zustand)

### Stores

| Store | Fichier | Responsabilité |
|-------|---------|----------------|
| `useAuthStore` | `stores/auth.ts` | User, session, profile, signIn/Out, initialize |
| `useSubscriptionStore` | `stores/subscription.ts` | Plan, isActive, isTrial, isPromo, feature gates |
| `useProgramStore` | `stores/program.ts` | Programme data, progressive unlock |
| `useNutritionStore` | `stores/nutrition.ts` | Preferences, plan nutrition |

### Convenience Hooks (hooks/)

Les hooks wrappent les stores pour exposer des sélecteurs stables et des valeurs dérivées :

```tsx
// Préférer les hooks dans les composants
const { isAuthenticated, signIn, profile } = useAuth();
const { planId, isActive, hasDashboard } = useSubscription();
const { program, fetch, isWeekAvailable } = useProgram();
```

### Pattern d'utilisation directe (stores)

```tsx
// Sélecteur simple
const loading = useAuthStore((s) => s.loading);

// Action
const { signIn } = useAuthStore();

// Derived getter
const hasNutrition = useSubscriptionStore((s) => s.hasNutrition());
```

---

## 6. Design System

### Couleurs (tailwind.config.ts + lib/constants.ts)

Alignées sur le web (`Apex-Coach/app/globals.css`), **PAS** sur la spec qui contient des valeurs obsolètes.

```
apex-black-900: #0A0E1A  (fond principal)
apex-black-800: #111827  (cartes, surfaces)
apex-black-700: #1F2937  (bordures)
apex-black-400: #9CA3AF  (texte secondaire)
apex-lime-500:  #84CC16  (primaire, CTAs, accents)
apex-lime-600:  #65A30D  (pressed state)
apex-error:     #EF4444
apex-success:   #10B981
apex-warning:   #F59E0B
```

Source de vérité : `lib/constants.ts` (couleurs JS) + `tailwind.config.ts` (classes Tailwind). Les deux doivent rester synchronisés.

### Composants UI

| Composant | Props clés | Variants |
|-----------|-----------|----------|
| `Button` | variant, size, loading, disabled | primary, secondary, ghost, destructive |
| `Input` | label, error, secureTextEntry | Focus border lime, password toggle |
| `Card` | className | Dark bg + border |
| `Badge` | label, variant | default, premium, success, warning, error |
| `Text` | variant | h1, h2, h3, body, caption, label |
| `SafeView` | className | react-native-safe-area-context + dark bg |
| `LoadingSpinner` | message, size | ActivityIndicator + message optionnel |
| `ProgressBar` | progress (0–1) | Lime bar on dark track |
| `Skeleton` | width, height, borderRadius | Animated pulse loading placeholder |
| `StarRating` | rating, maxStars, onRate | Interactive or display-only stars |
| `Calendar` | selectedDate, markedDates, onSelectDate | French locale, marked days |

### Convention de style

- NativeWind (className attribute) sur tous les composants
- Template string concatenation pour classes conditionnelles
- Pas de StyleSheet.create — tout en Tailwind
- Dark mode only (`userInterfaceStyle: "dark"`)

---

## 7. Déverrouillage progressif

Les plans Coaching/Pro déverrouillent les semaines progressivement :

```
Semaine 1 → J+0  (immédiat)
Semaine 2 → J+7
Semaine 3 → J+14
Semaine 4 → J+21
```

Starter = accès immédiat à tout.

**Fichier clé :** `lib/subscription/progressive-unlock.ts` (487 lignes)
- `shouldApplyProgressiveUnlock(planId)` → boolean
- `isWeekUnlocked(startDate, weekNumber)` → boolean
- `getProgressiveUnlockInfo(startDate)` → info complète
- Variantes `*WithBilan` pour vérifier aussi le feedback hebdomadaire

---

## 8. Fichiers partagés Web ↔ Mobile

Ces fichiers sont copiés du projet web **sans modification** :

| Fichier | Lignes | Usage |
|---------|--------|-------|
| `types/index.ts` | 773 | Types TS complets |
| `lib/validations/step1-6.ts` | ~2177 | Schemas questionnaire |
| `lib/validations/review.ts` | — | Schema avis |
| `lib/validations/nutrition-preferences.ts` | 306 | Préférences nutrition |
| `lib/config/pricing.ts` | 246 | Plans + feature access |
| `lib/subscription/progressive-unlock.ts` | 487 | Déverrouillage semaines |
| `lib/fasting/date-calculation.ts` | — | Calcul semaines jeûne |
| `lib/affiliate/*.ts` | — | Catalogues + URL builder |

**Règle : ces fichiers doivent rester synchronisés avec le web.** Si le web change, mettre à jour le mobile.

---

## 9. Conventions de code

### TypeScript

- Strict mode activé
- Path alias `@/*` pour imports propres
- Types dans `types/index.ts`, schemas Zod dans `lib/validations/`
- **JAMAIS de `as any`** — utiliser les types existants ou étendre l'interface

### Composants

```tsx
// Pattern standard
interface MyComponentProps extends ViewProps {
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function MyComponent({ variant = 'primary', className = '', ...props }: MyComponentProps) {
  return (
    <View className={`base-classes ${variantStyles[variant]} ${className}`} {...props}>
      {/* contenu */}
    </View>
  );
}
```

### Messages en français

Tous les messages UI sont en français :
```tsx
// Bon
"Email et mot de passe requis"
"Chargement..."

// Mauvais
"Email and password required"
"Loading..."
```

### API pattern

```tsx
// Sprint 1 : Direct Supabase (RLS protège)
const { data, error } = await supabase.from('table').select('*').eq('user_id', userId);
if (error) throw new ApiError(500, error.message);

// Sprint 2+ : Via API routes Next.js
const data = await apiFetch<MyType>('/endpoint', { method: 'POST', body: JSON.stringify(payload) });
```

---

## 10. Commandes utiles

```bash
npx expo start              # Dev server
npx expo start --android    # Dev Android
npx expo start --ios        # Dev iOS
npx expo start --web        # Dev Web

# EAS Build
eas build --profile development --platform ios
eas build --profile development --platform android
eas build --profile preview --platform all
eas build --profile production --platform all

# TypeScript
npx tsc --noEmit            # Type check
```

---

## 11. Variables d'environnement

```
EXPO_PUBLIC_SUPABASE_URL     # URL projet Supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY # Clé anonyme Supabase
EXPO_PUBLIC_API_URL          # https://apexcoach.app (backend Next.js)
```

---

## 12. Planning Sprint (référence)

| Sprint | Contenu | Statut |
|--------|---------|--------|
| **Sprint 1** | Fondations (Expo, auth, navigation, stores, UI, types) | **Terminé** |
| Sprint 2 | Dashboard + Programme + Workout actif + Nutrition | Prochain |
| Sprint 3 | Onboarding + Trial + Questionnaire + Paiement Reader | — |
| Sprint 4 | Notifications + Bilan + Polish + Publication stores | — |

---

## 13. Points d'attention

### CRITIQUE — À toujours respecter

1. **ZÉRO modification backend** — L'app est un client, le serveur ne change pas
2. **JAMAIS stocker de secrets dans le code** — Variables d'environnement uniquement
3. **JAMAIS utiliser `as any`** — Étendre les types si nécessaire
4. **SecureStore pour tokens** — Jamais AsyncStorage pour les JWT
5. **Messages en français** — Toute l'UI est francophone
6. **Dark mode only** — Pas de mode clair, fond `#0A0E1A`
7. **Synchroniser les fichiers partagés** — Types, validations, pricing doivent matcher le web

### Sécurité

- Auth via Supabase JWT (pas de PKCE en RN, `detectSessionInUrl: false`)
- Données santé (Step 5) : chiffrées côté serveur, HTTPS en transit suffit
- Deep links : scheme `apexcoach://`, universal links via `applinks:apexcoach.app`

### Corrections apportées (v1.1.0)

Tous les bugs identifiés lors de l'audit Sprint 1 ont été corrigés :

- **Auth listener** : cleanup + unsubscribe, listener avant getSession (race condition fix)
- **SafeView** : migré vers `react-native-safe-area-context`
- **SplashScreen** : `.finally()` au lieu de `.then()`
- **isActive()** : vérifie `cancel_at_period_end` + `current_period_end`
- **UserProfile** : ajout `full_name`, `phone`, `date_of_birth` — plus de `as any`
- **Couleurs** : alignées sur web `globals.css` (#0A0E1A), centralisées dans `lib/constants.ts`
- **SecureStore chunks** : cleanup atomique, count écrit avant les chunks
- **resetPassword** : utilise API branded (Resend) au lieu de Supabase generic
- **Structure** : ajout signup, (onboarding)/, (payment)/, hooks/
- **Login** : suppression double navigation, throttle guard, navigation via auth guard
- **Zustand selectors** : composants migrés vers convenience hooks
- **UI** : +4 composants (ProgressBar, Skeleton, StarRating, Calendar), Text re-exporté
- **Lib** : ajout notifications.ts et deep-linking.ts placeholders

---

## Changelog

| Date | Version | Changements |
|------|---------|-------------|
| 16/03/2026 | 1.1.0 | Audit Sprint 1 complet : 13 bugs corrigés (critiques + hauts + moyens), 4 nouveaux composants UI, convenience hooks, lib placeholders, Text export, couleurs alignées web. |
| 16/03/2026 | 1.0.0 | Sprint 1 terminé : Init Expo 55, auth Supabase + SecureStore, navigation 5 tabs + auth + modals, 4 Zustand stores, 7 composants UI, API wrapper, 15+ fichiers partagés du web, progressive unlock. |
