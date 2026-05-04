---
name: apex-mobile-state
description: >
  Skill state management Zustand pour Apex Coach Mobile. À utiliser pour tout
  store, action, hook de convenance, sélecteur stable, derived getter, ou
  question d'architecture sur la propagation d'état. Connaît les 4 stores
  existants (auth, subscription, program, nutrition) et le pattern de
  séparation store/hook. Déclencher sur : "ajoute un store", "modifie cet
  état", "expose une valeur dérivée", "comment partager", "sélecteur
  Zustand", "hook useX".
---

# Apex Coach Mobile — Skill State Management

L'app utilise **Zustand 5** sans middleware lourd. La règle d'or : **stores plats + convenience hooks** qui exposent des sélecteurs stables et des valeurs dérivées. Les composants n'importent **jamais directement** les stores — ils passent par les hooks.

---

## Stores existants

| Store | Fichier | Responsabilité |
|-------|---------|---------------|
| `useAuthStore` | `stores/auth.ts` | User, session, profile, signIn/Out, initialize |
| `useSubscriptionStore` | `stores/subscription.ts` | Plan, isActive, isTrial, isPromo, hasDashboard, hasNutrition |
| `useProgramStore` | `stores/program.ts` | Programme data + helpers progressive unlock |
| `useNutritionStore` | `stores/nutrition.ts` | Préférences + plan nutrition |

**À créer Sprint 2-4 :**
- `stores/workout.ts` (S2-T07) — session active, sets, timer, persist SecureStore
- `stores/settings.ts` (S4-T08) — fasting, notifications, language

---

## Hooks de convenance existants

`hooks/` :
- `useAuth.ts` → `{ isAuthenticated, isLoading, session, profile, signIn, signOut }`
- `useSubscription.ts` → `{ planId, isActive, isTrial, hasDashboard, hasNutrition }`
- `useProgram.ts` → `{ program, fetch, isWeekAvailable }`

**À créer :** `useWorkout`, `useSettings`, `useNotifications`, `useTrialCountdown`, `useExerciseVideo` (selon backlog).

---

## Pattern : créer un store + hook

```typescript
// stores/workout.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

interface WorkoutState {
  sessionActive: SessionId | null;
  currentExerciseIndex: number;
  sets: SetLog[];
  startedAt: number | null;
  startSession: (id: SessionId) => void;
  logSet: (set: SetLog) => void;
  finishSession: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      sessionActive: null,
      currentExerciseIndex: 0,
      sets: [],
      startedAt: null,
      startSession: (id) => set({ sessionActive: id, startedAt: Date.now(), currentExerciseIndex: 0, sets: [] }),
      logSet: (s) => set((state) => ({ sets: [...state.sets, s] })),
      finishSession: () => set({ sessionActive: null, currentExerciseIndex: 0, sets: [], startedAt: null }),
    }),
    {
      name: 'apex-workout',
      storage: createJSONStorage(() => ({
        getItem: (k) => SecureStore.getItemAsync(k),
        setItem: (k, v) => SecureStore.setItemAsync(k, v),
        removeItem: (k) => SecureStore.deleteItemAsync(k),
      })),
    }
  )
);
```

```typescript
// hooks/useWorkout.ts
import { useWorkoutStore } from '@/stores/workout';

export function useWorkout() {
  const sessionActive = useWorkoutStore((s) => s.sessionActive);
  const currentExerciseIndex = useWorkoutStore((s) => s.currentExerciseIndex);
  const sets = useWorkoutStore((s) => s.sets);
  const { startSession, logSet, finishSession } = useWorkoutStore();

  // Derived getter : valeur calculée stable
  const elapsedSeconds = useWorkoutStore((s) => (s.startedAt ? Math.floor((Date.now() - s.startedAt) / 1000) : 0));

  return { sessionActive, currentExerciseIndex, sets, elapsedSeconds, startSession, logSet, finishSession };
}
```

---

## Règles strictes

**1. Sélecteurs atomiques** — Un sélecteur retourne une valeur primitive ou un objet stable. Jamais d'objet recréé à chaque render :
```typescript
// ❌ recrée l'objet à chaque render → re-render permanent
const data = useStore((s) => ({ a: s.a, b: s.b }));

// ✅ deux sélecteurs séparés
const a = useStore((s) => s.a);
const b = useStore((s) => s.b);
```

**2. Actions séparées du state** — Quand tu déconstuis le store pour les actions, c'est OK car les actions sont stables (référence stable créée au montage du store).

**3. Derived getters via fonction** — Si la valeur doit être recalculée (ex: `isActive()` qui check `current_period_end`), exposer comme méthode et appeler dans le hook :
```typescript
// stores/subscription.ts
isActive: () => {
  const s = get();
  if (!s.subscription) return false;
  if (s.subscription.cancel_at_period_end && Date.now() > new Date(s.subscription.current_period_end).getTime()) return false;
  return s.subscription.status === 'active' || s.subscription.status === 'trialing';
}

// hooks/useSubscription.ts
const isActive = useSubscriptionStore((s) => s.isActive());
```

**4. `persist` avec SecureStore pour données sensibles** — sessions, tokens. Pour données non-sensibles (UI prefs), `AsyncStorage` peut suffire mais préférer SecureStore pour la cohérence.

**5. Pas de logique métier dans le store** — Le store stocke et expose. Les actions appellent les helpers de `lib/` (ex: `signIn` appelle `lib/supabase/client.ts`).

**6. Initialiser au montage de l'app** — Dans `app/_layout.tsx`, appeler `useAuthStore.getState().initialize()` au mount pour hydrater la session depuis SecureStore avant de rendre les routes.

---

## Anti-patterns à éviter

- **Stocker des objets profonds** : flatten ou normaliser. Sinon Zustand notifie tout abonné même pour un changement profond.
- **Importer un store depuis un composant** : passer par un hook. Le store est un détail d'implémentation.
- **Mélanger `useStore()` (toutes les valeurs) et `useStore((s) => x)` (sélecteur)** : `useStore()` re-render à chaque changement. Toujours utiliser un sélecteur sauf pour les actions.
- **Mutations hors `set()`** : Zustand est immuable. Jamais `state.value = X` — toujours `set({ value: X })`.

---

## Carte de délégation

| Situation | Skill |
|-----------|-------|
| Persister un state complexe | Reste dans **`apex-mobile-state`** |
| Appeler une API depuis une action | **`apex-mobile-api`** |
| Tester un store / hook | **`apex-mobile-test`** |
| Stocker un secret (token) | **`apex-mobile-security-review`** (SecureStore obligatoire) |
