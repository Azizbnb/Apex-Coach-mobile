---
name: apex-mobile-test
description: >
  Skill tests Jest + Maestro pour Apex Coach Mobile. À utiliser pour écrire
  des tests unitaires (composants UI, hooks, stores, helpers `lib/`), des
  tests d'intégration (API mock, flows RHF + Zod), ou des tests e2e
  (Maestro flows : login, signup, premier workout, paywall info).
  Connaît `react-native-testing-library`, les mocks Expo, le pattern de mock
  Supabase, et la structure `__tests__/` mirroring src. Déclencher sur :
  "écris les tests", "tests unitaires", "test e2e mobile", "Jest RN",
  "Maestro", "non-régression mobile", "couverture".
---

# Apex Coach Mobile — Skill Tests

Tester en mobile = filtrer les bugs avant qu'ils ne paient le prix d'un build EAS, d'un upload TestFlight, et d'une review Apple. Les tests Jest tournent en CI continue (MR2 attend le vert pour ouvrir une PR). Les tests Maestro tournent localement par toi.

---

## Stack tests

| Niveau | Outil | Cible | Exécution |
|--------|-------|-------|-----------|
| Unit | Jest + `react-native-testing-library` | composants, hooks, stores, lib | CI (MR2) |
| Integration | Jest + Supabase mock | API flows complets | CI (MR2) |
| E2E | Maestro | scénarios user (login → workout) | Local (toi) |
| Visuel | EAS Build preview + screenshots | rendu device réel | MR5 hebdo |

> **Pas de Detox** sur ce projet — Maestro est plus léger, lisible (YAML), et tourne en CI Cloud Maestro Cloud si besoin.

---

## Setup Jest (à confirmer Sprint 4)

`jest.config.js` :
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo(nent)?|@expo|@react-navigation|@supabase)/)',
  ],
  setupFilesAfterEach: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

`jest.setup.ts` : mocks globaux (Async/SecureStore, expo-router, supabase).

---

## Pattern test composant UI

```typescript
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('appelle onPress quand on tape', () => {
    const onPress = jest.fn();
    render(<Button label="Démarrer" onPress={onPress} />);
    fireEvent.press(screen.getByText('Démarrer'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('affiche le loader si loading', () => {
    render(<Button label="X" loading />);
    expect(screen.getByLabelText('Chargement')).toBeOnTheScreen();
  });

  it('disabled empêche le press', () => {
    const onPress = jest.fn();
    render(<Button label="X" disabled onPress={onPress} />);
    fireEvent.press(screen.getByText('X'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

---

## Pattern test hook (Zustand)

```typescript
import { act, renderHook } from '@testing-library/react-native';
import { useWorkout } from '@/hooks/useWorkout';

describe('useWorkout', () => {
  it('démarre une session avec sets vides', () => {
    const { result } = renderHook(() => useWorkout());
    act(() => result.current.startSession('session-id-1'));
    expect(result.current.sessionActive).toBe('session-id-1');
    expect(result.current.sets).toEqual([]);
  });

  it('logSet ajoute un set', () => {
    const { result } = renderHook(() => useWorkout());
    act(() => result.current.startSession('s1'));
    act(() => result.current.logSet({ exerciseId: 'e1', reps: 10, weight: 50 }));
    expect(result.current.sets).toHaveLength(1);
  });
});
```

---

## Pattern test API (mock Supabase)

```typescript
import { profileApi } from '@/lib/api';

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: { getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'tok' } } }) },
  },
}));

global.fetch = jest.fn();

describe('profileApi.get', () => {
  it('appelle /api/profile avec Bearer', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'u1', email: 'x@y.z' }),
    });
    const profile = await profileApi.get();
    expect(profile.email).toBe('x@y.z');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/profile'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer tok' }) })
    );
  });
});
```

---

## Pattern test e2e Maestro

`maestro/login.flow.yaml` :
```yaml
appId: com.apexcoach.mobile
---
- launchApp:
    clearState: true
- assertVisible: "Bienvenue sur Apex Coach"
- tapOn: "J'ai déjà un compte"
- inputText: "test@apexcoach.dev"
- tapOn: "Mot de passe"
- inputText: "Test1234!"
- tapOn: "Se connecter"
- assertVisible:
    text: "Programme"
    timeout: 8000
```

> Maestro lit l'arbre d'accessibilité — d'où l'importance des `accessibilityLabel` (skill `apex-mobile-design`).

---

## Conventions

- **Fichiers** : `__tests__/` mirroring `src/`. Ex: `components/ui/Button.tsx` → `__tests__/components/ui/Button.test.tsx`.
- **Imports** : `import { describe, it, expect } from '@jest/globals'` (consigne projet web aussi).
- **Pas de tests visuels par snapshot** — fragiles en RN, préférer assertions sémantiques.
- **Couvrir les paths critiques** : auth, paywall info (CTA browser), workout completion, redeem promo. Pas de chasse à 100% de couverture.

---

## Tests obligatoires par couche

| Couche | Type | Couverture cible |
|--------|------|------------------|
| `components/ui/*` | Unit | toutes les variantes + interactions |
| `hooks/use*` | Unit | actions + états dérivés |
| `stores/*` | Unit | toutes les actions |
| `lib/api.ts` | Integration | un test happy + un test error par endpoint |
| `lib/validations/*` | Unit | cas valides + invalides Zod |
| `lib/web-browser.ts` (helper UTM) | Unit | UTM injectés correctement |
| `app/(auth)/*` | E2E Maestro | login, signup, redeem |
| `app/(tabs)/*` | E2E Maestro | flow programme + workout |

---

## CI mobile (à wirer Sprint 4)

```yaml
# .github/workflows/mobile-test.yml
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint .
      - run: npx jest --coverage
```

> MR2 attend ces 3 verts (`tsc`, `eslint`, `jest`) avant d'ouvrir une PR. MR4 utilise les résultats pour son audit.

---

## Carte de délégation

| Situation | Skill |
|-----------|-------|
| Spec d'une feature à tester | **`apex-mobile-feature-spec`** |
| Bug à reproduire en test | **`apex-mobile-debug`** |
| Audit sécu (cas tests sensibles) | **`apex-mobile-security-review`** |
