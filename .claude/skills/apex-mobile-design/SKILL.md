---
name: apex-mobile-design
description: >
  Skill design system mobile pour Apex Coach. À utiliser pour tout travail
  visuel : nouveau composant, nouvelle vue, animation, transition, ajustement
  responsive (téléphone vs tablette), dark theme. Connaît les 11 composants UI
  existants, les couleurs alignées sur le web (`#0A0E1A` fond, `#84CC16`
  accent), les conventions NativeWind, l'accessibilité RN (hitSlop, labels),
  et les patterns d'animation react-native-reanimated. Déclencher sur :
  "ajoute un composant", "crée un écran", "anime ce bloc", "responsive",
  "dark theme mobile", "accessibilité RN".
---

# Apex Coach Mobile — Skill Design System

L'app est un **dark-only** premium aligné visuellement sur le web (`Apex-Coach/app/globals.css`). NativeWind (Tailwind RN) est le seul vecteur de style — zéro `StyleSheet.create`. Toutes les classes Tailwind disponibles côté web fonctionnent côté RN, sauf les pseudo-classes interactives (`hover:`, `focus:`) à remplacer par `Pressable` + state.

---

## Tokens de couleur (source `lib/constants.ts` + `tailwind.config.ts`)

| Token | Hex | Usage |
|-------|-----|-------|
| `apex-black-900` | `#0A0E1A` | Fond principal de toute vue |
| `apex-black-800` | `#111827` | Cartes, surfaces secondaires |
| `apex-black-700` | `#1F2937` | Bordures, séparateurs |
| `apex-black-400` | `#9CA3AF` | Texte secondaire, captions |
| `apex-lime-500` | `#84CC16` | CTA primaire, accent, highlight |
| `apex-lime-600` | `#65A30D` | Pressed state du primaire |
| `apex-error` | `#EF4444` | Erreurs, destructive |
| `apex-success` | `#10B981` | Succès, completion |
| `apex-warning` | `#F59E0B` | Banners trial, promo expiry |

> Ne jamais hardcoder une couleur en hex. Utiliser le token Tailwind ou `Colors.X` depuis `lib/constants.ts`. Si tu dois ajouter une couleur, la déclarer dans **les deux fichiers** simultanément.

---

## Composants UI existants (`components/ui/`, 11 composants)

| Composant | Variants / Props clés |
|-----------|----------------------|
| `Button` | `variant`: primary, secondary, ghost, destructive · `size`: sm, md, lg · `loading`, `disabled` |
| `Input` | `label`, `error`, `secureTextEntry` (toggle œil) · focus border lime |
| `Card` | `className` (compose) · dark bg + border |
| `Badge` | `label`, `variant`: default, premium, success, warning, error |
| `Text` | `variant`: h1, h2, h3, body, caption, label |
| `SafeView` | wrapper `react-native-safe-area-context` + dark bg |
| `LoadingSpinner` | `message`, `size` |
| `ProgressBar` | `progress` (0..1) — barre lime sur track sombre |
| `Skeleton` | `width`, `height`, `borderRadius` — animated pulse |
| `StarRating` | `rating`, `maxStars`, `onRate` (interactive ou display) |
| `Calendar` | `selectedDate`, `markedDates`, `onSelectDate` — locale FR |

> **Toujours réutiliser** un composant existant avant d'en créer un nouveau. Si une variante manque, l'ajouter dans le composant existant via CVA-like (object map de classes par variant).

---

## Conventions de style

```typescript
// Conditionnel via template strings
const buttonClass = `rounded-2xl px-4 py-3 ${
  disabled ? 'bg-apex-black-700 opacity-50' : 'bg-apex-lime-500'
}`;

// Composition propre
<View className={`bg-apex-black-800 border border-apex-black-700 ${className}`} />

// JAMAIS
const styles = StyleSheet.create({ ... }); // ❌
<View style={styles.container} />          // ❌
```

**Espaces** : `p-4` = 16px, `gap-4` = 16px, `rounded-2xl` = 16px (cohérent avec le web). Préférer le multiple de 4.

**Typographie** : utiliser le composant `Text` avec `variant`. Ne pas styler manuellement. Si une variante manque, l'ajouter dans `Text.tsx`.

---

## Accessibilité RN (mandatoire)

```typescript
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Démarrer la session"
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  onPress={...}
>
```

- `accessibilityLabel` en FR sur tout target interactif
- `accessibilityRole` : button, link, header, image, switch, etc.
- `hitSlop ≥ 8` pour tout target < 44×44 pt (guideline Apple)
- VoiceOver/TalkBack : tester si le composant est complexe

---

## Animations (`react-native-reanimated` 4.2.2)

```typescript
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Layout animation simple
<Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} />

// Custom animation : éviter Animated.Value (ancien). Utiliser useSharedValue + useAnimatedStyle.
const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
// onPressIn → scale.value = withSpring(0.95)
```

> Ne pas abuser des animations. Cible : transitions de page (slide), feedback tactile (press scale 0.95), apparition (fade 200ms). Pas d'animation décorative.

---

## Responsive (téléphone vs tablette)

```typescript
import { useWindowDimensions } from 'react-native';
const { width } = useWindowDimensions();
const isTablet = width >= 768;

<View className={`p-4 ${isTablet ? 'flex-row gap-6' : 'flex-col gap-4'}`} />
```

> NativeWind ne supporte pas les breakpoints Tailwind (`md:`, `lg:`) en RN. Utiliser `useWindowDimensions()` pour le responsive.

---

## Patterns courants à appliquer

- **Empty state** : icône lucide + titre + description courte + CTA optionnel — `components/common/EmptyState.tsx` (à créer Sprint 4)
- **Loading state** : `Skeleton` plutôt que `LoadingSpinner` quand on connaît la forme
- **Error state** : `Text` rouge `apex-error` + bouton "Réessayer"
- **Liste** : `FlatList` avec `keyExtractor` + `getItemLayout` quand items à hauteur fixe (perf)

---

## Carte de délégation

| Situation | Skill |
|-----------|-------|
| Implémenter le code derrière le design | **`apex-mobile-dev`** |
| Layout d'une route Expo Router | **`apex-mobile-navigation`** |
| Texte FR natif (UX writing, microcopy) | **`apex-copywriting`** (skill web réutilisable) |
| Audit accessibilité avant merge | **`apex-mobile-security-review`** |
