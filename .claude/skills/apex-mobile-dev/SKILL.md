---
name: apex-mobile-dev
description: >
  Skill fondation pour tout développement sur l'app Apex Coach Mobile (Expo).
  À utiliser systématiquement pour toute tâche de code sur ce projet : ajout
  d'écran, modification de composant, création de hook, refactoring, correction
  de bug, migration entre fichiers partagés web. Charge le contexte complet
  (stack Expo 55 / RN 0.83 / React 19 / Zustand / NativeWind / Supabase RN +
  modèle économique Netflix gratuit + 13 règles critiques mobile + patterns
  d'API + structure dossiers) pour produire du code production-grade dès le
  premier jet. Ne jamais coder sur Apex Coach Mobile sans ce skill actif.
---

# Apex Coach Mobile — Skill Développement Fondation

Tu travailles sur **Apex Coach Mobile**, l'app native Expo qui consomme le **même backend Next.js que le web**. Le fondateur est non-technique mais vise un niveau de sécurité et de scalabilité professionnel. Chaque ligne doit être digne d'une codebase senior. **Aucune modification backend** : l'app est un client natif des API web.

---

## Stack technique (source `package.json`)

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | Expo (managed workflow) | 55.0.6 |
| Runtime | React Native | 0.83.2 |
| React | React | 19.2.0 |
| Routing | Expo Router (file-based) | 55.0.5 |
| Langage | TypeScript | 5.9 |
| Auth | @supabase/supabase-js + expo-secure-store | 2.99.2 |
| State | Zustand | 5.0.12 |
| UI/Styling | NativeWind (Tailwind RN) | 4.2.3 |
| Animations | react-native-reanimated | 4.2.2 |
| Formulaires | React Hook Form + Zod | 7.71 / 4.3 |
| Icons | lucide-react-native | 0.577 |

---

## Modèle économique — App gratuite, modèle Netflix (décision finale 04/05/2026)

> **Aucun paiement in-app, aucune mention de prix nulle part dans le code mobile.** Le paiement se fait **uniquement sur `apexcoach.app`** via Stripe (web). Commission Apple/Google = 0%.

| Cas | Comportement attendu dans l'app |
|-----|--------------------------------|
| User non connecté à l'install | Welcome hero → CTA `WebBrowser` vers `apexcoach.app/?utm_source=ios_app` |
| Signup + questionnaire + trial 7j | OK dans l'app (POST `/api/auth/create-trial-account`) |
| Code promo (partenariat) | OK dans l'app (`/(auth)/redeem`, POST `/api/promo/validate`) |
| Trial expiré ou feature payante | Paywall **informational** (zéro prix affiché) → CTA `WebBrowser` vers `apexcoach.app/pricing?utm_source=ios_app&utm_campaign=paywall` |
| Lecture state subscription | Read-only depuis Supabase (RLS) — l'app ne crée jamais de subscription |

`PlanId = 'coaching' | 'coaching_pro'` — **Starter supprimé** (alignement strict web).

---

## Règles critiques — non négociables

**1. Zéro paiement in-app, zéro prix affiché** — modèle Netflix. Tout CTA pricing redirige vers `apexcoach.app` via `WebBrowser.openBrowserAsync` avec UTM.

**2. Tokens dans SecureStore uniquement** — jamais AsyncStorage. Le `LargeSecureStore` du projet chunke automatiquement les JWT > 2 KB.

**3. Dark mode only** — fond `bg-apex-black-900` (`#0A0E1A`), texte `text-white`, secondaires `text-apex-black-400`.

**4. Messages en français natif** — toute UI, erreur, label, toast en FR. Jamais d'anglicismes maladroits.

**5. NativeWind uniquement** — `className="..."`. Zéro `StyleSheet.create`. Conditionnel via template strings.

**6. Aucun `as any`** — étendre l'interface ou créer un type union. Jamais bypass.

**7. Validation Zod sur toute entrée** — schemas dans `lib/validations/`. Côté client (UX) ET serveur (sécurité).

**8. Pattern Supabase RN** — toujours checker `error` :
```typescript
const { data, error } = await supabase.from('table').select('*').eq('user_id', user.id);
if (error) throw new ApiError(500, error.message);
```

**9. `maybeSingle()` quand 0 row est valide** — évite l'erreur PGRST116. `single()` uniquement quand l'absence est une vraie erreur.

**10. Sync fichiers partagés web↔mobile** — `types/index.ts`, `lib/validations/step{1..6}.ts`, `lib/config/pricing.ts`, `lib/subscription/progressive-unlock.ts`, `lib/fasting/date-calculation.ts`, `lib/affiliate/*.ts`. Si le web change, le mobile doit suivre (la routine MR7 détecte le drift).

**11. Path alias `@/*`** — `import { useAuth } from '@/hooks/useAuth'`. Jamais de chemins relatifs profonds (`../../..`).

**12. WebBrowser.openBrowserAsync systématique** — pour tout lien externe, avec helper `lib/web-browser.ts` qui ajoute automatiquement les UTM (`source`, `medium`, `campaign`).

**13. Anti-troncature : Write < 150 lignes** — au-delà, fragmenter en sous-composants ou utiliser `Edit` ciblés.

---

## Patterns de code

### Composants RN

```typescript
import { View, Text, TouchableOpacity } from 'react-native';
import type { ViewProps } from 'react-native';

interface MyComponentProps extends ViewProps {
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function MyComponent({ variant = 'primary', className = '', ...props }: MyComponentProps) {
  const variantClass = variant === 'primary'
    ? 'bg-apex-lime-500 text-apex-black-900'
    : 'bg-apex-black-800 text-white';
  return (
    <View className={`rounded-2xl p-4 ${variantClass} ${className}`} {...props}>
      {/* contenu */}
    </View>
  );
}
```

### Supabase RN (Sprint 1-2 = direct, Sprint 3+ = apiFetch)

```typescript
// Sprint 1-2 : direct Supabase, RLS protège
import { supabase } from '@/lib/supabase/client';
const { data, error } = await supabase.from('programs').select('*').eq('user_id', user.id);

// Sprint 3+ : via API routes Next.js (Bearer token auto-injecté)
import { apiFetch } from '@/lib/api';
const data = await apiFetch<Program>('/api/programs/current', { method: 'GET' });
```

### Lien externe (modèle Netflix)

```typescript
import { openWebUrl } from '@/lib/web-browser'; // helper à créer S3-T20
await openWebUrl('https://www.apexcoach.app/pricing', { campaign: 'paywall_trial_expired' });
// → Ouvre le browser système avec utm_source=ios_app|android_app + utm_medium=app + utm_campaign=...
```

### Zustand store + hook

```typescript
// stores/foo.ts
import { create } from 'zustand';
interface FooState { value: string; set: (v: string) => void; }
export const useFooStore = create<FooState>((set) => ({
  value: '',
  set: (value) => set({ value }),
}));

// hooks/useFoo.ts (convenience hook)
import { useFooStore } from '@/stores/foo';
export function useFoo() {
  const value = useFooStore((s) => s.value);
  const set = useFooStore((s) => s.set);
  return { value, set };
}
```

---

## Structure des répertoires (état Sprint 1, à enrichir Sprint 2-4)

```
app/             # Expo Router (auth, tabs, modals, onboarding, payment placeholder)
components/ui/   # 11 composants : Button, Card, Input, Badge, Text, SafeView,
                 #   LoadingSpinner, ProgressBar, Skeleton, StarRating, Calendar
hooks/           # useAuth, useProgram, useSubscription (à étendre Sprint 2-4)
stores/          # auth, subscription, program, nutrition (Zustand)
lib/
├── supabase/client.ts          # Client Supabase RN + LargeSecureStore
├── api.ts                      # apiFetch Bearer (Sprint 3+)
├── constants.ts                # Couleurs JS + API_URL + deep link config
├── config/pricing.ts           # 2 plans actifs (sync web)
├── subscription/progressive-unlock.ts
├── fasting/date-calculation.ts
├── affiliate/                  # equipment, supplement, url-builder
├── validations/step{1..6}.ts   # Schemas Zod (sync web)
├── notifications.ts            # Push placeholder Sprint 4
└── deep-linking.ts             # Universal links Sprint 3
types/index.ts                  # 700+ lignes (sync web)
```

---

## Checklist avant de livrer du code

Avant de présenter une implémentation, vérifier mentalement :

- [ ] Aucun prix affiché ni CTA d'achat in-app (modèle Netflix)
- [ ] Toute entrée utilisateur validée avec Zod
- [ ] SecureStore pour les tokens, jamais AsyncStorage
- [ ] Erreurs Supabase checkées (`if (error) ...`)
- [ ] Messages en FR natif idiomatique
- [ ] Dark theme respecté (fond `#0A0E1A`, texte blanc)
- [ ] NativeWind (className) — zéro `StyleSheet.create`
- [ ] Imports avec alias `@/*`
- [ ] Aucun `as any`
- [ ] `npx tsc --noEmit` passe vert
- [ ] Si fichier > 150 lignes : utiliser `Edit` ciblé, pas `Write`

---

## Carte de délégation — quand activer un autre skill

| Situation | Skill à activer |
|-----------|-----------------|
| Style, NativeWind, animations, design system mobile | **`apex-mobile-design`** |
| Expo Router, tabs, modals, deep links, auth guard | **`apex-mobile-navigation`** |
| Zustand store, convenience hook, sélecteurs stables | **`apex-mobile-state`** |
| Supabase RN direct, apiFetch, sync types web | **`apex-mobile-api`** |
| Spec d'une feature avant implémentation | **`apex-mobile-feature-spec`** |
| Bug Sentry, EAS Build error, Metro stacktrace | **`apex-mobile-debug`** |
| Tests Jest RN ou Maestro e2e | **`apex-mobile-test`** |
| Audit sécu (SecureStore, deep link, RLS, RGPD) | **`apex-mobile-security-review`** |
| Paywall info, WebBrowser, UTM, attribution Apple Search Ads | **`apex-mobile-paywall`** |
| Migration BDD partagée (côté web) | **`apex-migration`** (skill web) |
| Voix FR / copywriting | **`apex-copywriting`** (skill web) |

**Règle** : `apex-mobile-dev` est toujours actif sur ce repo. Les autres skills s'y ajoutent selon le domaine.
