---
name: apex-mobile-navigation
description: >
  Skill Expo Router pour Apex Coach Mobile. À utiliser dès qu'on touche au
  routing : ajout d'un écran, restructuration de tabs/modals, deep linking,
  auth guard, transitions, paramètres de route. Connaît la structure
  `(auth)/(tabs)/(modals)/(onboarding)/(payment)`, le scheme `apexcoach://`,
  les universal links, et les patterns d'auth guard via `app/index.tsx`.
  Déclencher sur : "ajoute un écran", "ajoute un tab", "deep link",
  "navigation", "modal plein écran", "params de route".
---

# Apex Coach Mobile — Skill Navigation (Expo Router)

L'app utilise **Expo Router 55 file-based**, paradigme similaire à Next.js App Router. Tout fichier dans `app/` est une route. Les groupes parenthésés `(auth)` créent un layout sans préfixe d'URL.

---

## Structure de routes (état Sprint 1)

```
app/
├── _layout.tsx                # Root: Stack(auth, tabs, modals, ...) + splash + ThemeProvider
├── index.tsx                  # Auth guard → redirige login ou tabs
├── +not-found.tsx             # 404 fallback
│
├── (auth)/_layout.tsx         # Stack non-authentifié
│   ├── login.tsx
│   ├── signup.tsx
│   ├── forgot-password.tsx
│   └── set-password.tsx
│
├── (tabs)/_layout.tsx         # Bottom Tabs (5 tabs)
│   ├── programme/index.tsx + [weekNumber].tsx
│   ├── workout/index.tsx
│   ├── nutrition/index.tsx     # Gated Coaching Pro
│   ├── progress/index.tsx      # Gated Coaching+
│   └── profile/index.tsx
│
├── (modals)/_layout.tsx       # Stack mode "modal" (presentation: 'modal')
│   ├── exercise-detail.tsx
│   └── session-complete.tsx
│
├── (onboarding)/_layout.tsx   # Stack onboarding (welcome, questionnaire à venir)
│   └── welcome.tsx
│
└── (payment)/_layout.tsx      # Stack paiement (placeholder Sprint 4)
    └── checkout.tsx
```

> **Modèle Netflix rappel** : `(payment)/` n'a plus de raison d'exister fonctionnellement (zéro paiement in-app). Garder le placeholder mais ne pas y ajouter de logique. Le paywall info est dans `(modals)/paywall.tsx` à créer (S3-T13).

---

## Patterns clés

### Auth guard (`app/index.tsx`)

```typescript
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { isLoading, session } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  return <Redirect href={session ? '/(tabs)/programme' : '/(auth)/login'} />;
}
```

> Centraliser la logique d'auth guard dans `app/index.tsx`. Ne pas dupliquer dans chaque écran.

### Navigation impérative

```typescript
import { router } from 'expo-router';

router.push('/(tabs)/programme');           // navigue
router.replace('/(auth)/login');            // remplace (logout)
router.back();                              // retour
router.setParams({ week: '2' });            // params dynamiques
```

### Params de route

```typescript
// Route : app/(tabs)/programme/[weekNumber].tsx
import { useLocalSearchParams } from 'expo-router';
const { weekNumber } = useLocalSearchParams<{ weekNumber: string }>();
const week = Number(weekNumber);
```

### Modal plein écran

```typescript
// Le _layout.tsx de (modals)/ doit déclarer presentation: 'modal'
<Stack screenOptions={{ presentation: 'modal', headerShown: false }} />
// Ouverture
router.push('/(modals)/session-complete');
```

### Tab gating (subscription)

```typescript
// app/(tabs)/_layout.tsx
const { hasNutrition } = useSubscription();
<Tabs.Screen
  name="nutrition"
  options={{
    href: hasNutrition ? '/(tabs)/nutrition' : null, // null cache le tab
    title: 'Nutrition',
    tabBarIcon: ({ color }) => <Apple color={color} size={24} />,
  }}
/>
```

> `href: null` masque le tab si l'user n'a pas accès. Plus propre que de cacher visuellement.

---

## Deep links (Universal Links + scheme `apexcoach://`)

`app.json` :
```json
{
  "expo": {
    "scheme": "apexcoach",
    "ios": { "associatedDomains": ["applinks:apexcoach.app", "applinks:apexcoach.app"] },
    "android": { "intentFilters": [{ "action": "VIEW", "data": [{ "scheme": "https", "host": "apexcoach.app" }, { "scheme": "https", "host": "apexcoach.app" }], "category": ["BROWSABLE", "DEFAULT"], "autoVerify": true }] }
  }
}
```

**Routes deep link supportées (Sprint 3+) :**
- `apexcoach://redeem?code=XXX` → `(auth)/redeem`
- `apexcoach://set-password?token=XXX` → `(auth)/set-password`
- `https://apexcoach.app/redeem` → ouvre app via Universal Link

**Côté web** : `Apex-Coach/public/.well-known/apple-app-site-association` + `assetlinks.json` à wirer (S5-T02, S5-T03).

```typescript
// Parser un deep link
import * as Linking from 'expo-linking';
const url = await Linking.getInitialURL();
const { hostname, path, queryParams } = Linking.parse(url ?? '');
```

---

## Transitions & animations entre routes

```typescript
// _layout.tsx d'un Stack
<Stack screenOptions={{
  animation: 'slide_from_right',     // iOS-like
  headerShown: false,
  contentStyle: { backgroundColor: '#0A0E1A' },
}} />
```

> Toujours `contentStyle` avec le fond `#0A0E1A` pour éviter le flash blanc en transition (RN par défaut).

---

## Erreurs courantes à éviter

- **Double navigation** : ne pas appeler `router.push` ET déclencher l'auth guard simultanément. Centraliser via `<Redirect />`.
- **`router.replace` dans un useEffect non-conditionnel** : provoque une boucle. Toujours guarder par un état stable.
- **Naviguer pendant un render** : `router.push` doit être dans un handler ou un `useEffect`, jamais inline dans le JSX.
- **Omettre `Stack.Screen`** : un fichier dans `app/` est auto-routé, mais si tu as besoin d'options spécifiques (titre, animation), déclare-le dans le `_layout.tsx` parent.

---

## Carte de délégation

| Situation | Skill |
|-----------|-------|
| Style de l'écran (couleurs, layout) | **`apex-mobile-design`** |
| Logique d'auth guard, signin/out | **`apex-mobile-state`** + `apex-mobile-api` |
| Deep link de paywall info vers le web | **`apex-mobile-paywall`** |
| Tester un flow de navigation | **`apex-mobile-test`** |
