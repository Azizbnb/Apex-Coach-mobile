---
name: apex-mobile-api
description: >
  Skill couche API/données pour Apex Coach Mobile. À utiliser pour tout
  appel réseau : Supabase RN direct (Sprint 1-2), `apiFetch` Bearer vers
  les API routes Next.js (Sprint 3+), gestion des erreurs HTTP, pagination,
  retry, sync de fichiers partagés web↔mobile (types, validations,
  pricing), et stockage SecureStore des tokens. Déclencher sur : "appel
  API", "fetch", "Supabase mobile", "token", "Bearer", "sync types",
  "RLS mobile", "ApiError".
---

# Apex Coach Mobile — Skill API & Données

Le mobile partage **le même backend Next.js + Supabase + RLS** que le web. Aucune modification serveur ne doit être proposée depuis ce skill — toute évolution backend passe par le projet web.

---

## Choix de transport selon le sprint

| Sprint | Transport | Justification |
|--------|-----------|---------------|
| **1-2** (actuel) | **Supabase RN direct** via `lib/supabase/client.ts` | RLS protège, latence minimale, simplicité. Suffisant pour les lectures `programs`, `subscriptions`, `profiles`. |
| **3+** | **`apiFetch` Bearer** vers les API routes Next.js | Quand on a besoin de logique serveur custom (validation, audit log, IAP-free signup, agrégats), passer par les routes web qui font déjà tout le travail. |

> Règle : si l'op se réduit à un SELECT/INSERT/UPDATE simple sur une table protégée par RLS, **Supabase direct**. Si l'op nécessite logique métier (création trial avec fingerprint, redeem promo, génération programme, audit), **API route web**.

---

## Client Supabase RN

```typescript
// lib/supabase/client.ts (déjà existant)
import { createClient } from '@supabase/supabase-js';
import { LargeSecureStore } from './secure-store';
import 'react-native-url-polyfill/auto';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: new LargeSecureStore(), // chunke les JWT > 2KB
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // pas de PKCE en RN
    },
  }
);
```

**Pourquoi `LargeSecureStore`** : `expo-secure-store` a une limite de 2048 bytes/clé sur Android. Le client custom du projet chunke automatiquement les JWT longs. Ne jamais bypass au profit de `AsyncStorage`.

---

## Wrapper `apiFetch` (Sprint 3+)

```typescript
// lib/api.ts (à étendre)
export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, data?.error ?? 'Erreur réseau', data);
  }
  return res.json();
}

// Domaines exportés (à compléter)
export const profileApi = { get: () => apiFetch<Profile>('/api/profile') };
export const subscriptionApi = { get: () => apiFetch<Subscription>('/api/subscription/current') };
export const promoApi = { validate: (code: string) => apiFetch<PromoOffer>('/api/promo/validate', { method: 'POST', body: JSON.stringify({ code }) }) };
```

---

## Pattern d'appel typique

```typescript
// Sprint 1-2 : Supabase direct
const { data: program, error } = await supabase
  .from('programs')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle(); // car 0 row = pas de programme = état valide
if (error) throw new ApiError(500, error.message);

// Sprint 3+ : API route
const program = await apiFetch<Program>('/api/programs/current');
```

> Toujours typer le retour avec `<T>` — c'est ce qui garantit l'autocomplétion en aval. Importer le type depuis `types/index.ts` (sync web).

---

## Sync fichiers partagés web↔mobile

Ces fichiers sont copiés du web **sans modification** :

| Fichier | Source web |
|---------|-----------|
| `types/index.ts` | `Apex-Coach/types/index.ts` |
| `lib/validations/step{1..6}.ts` | `Apex-Coach/lib/validations/step{1..6}.ts` |
| `lib/validations/review.ts` | `Apex-Coach/lib/validations/review.ts` |
| `lib/validations/nutrition-preferences.ts` | id |
| `lib/validations/promo-code.ts` (S3-T12) | `Apex-Coach/lib/validations/promo-code.ts` |
| `lib/config/pricing.ts` | `Apex-Coach/lib/config/pricing.ts` (sans Stripe IDs) |
| `lib/subscription/progressive-unlock.ts` | id |
| `lib/fasting/date-calculation.ts` | id |
| `lib/affiliate/{equipment-catalog,supplement-catalog,url-builder}.ts` | id |
| `lib/programs/schemas.ts` | id |

**Règle :** ne jamais modifier ces fichiers côté mobile sans modifier d'abord le web. La routine MR7 (Sync Detector) ouvre une PR mobile automatique le dimanche soir si elle détecte un drift.

---

## Erreurs et retry

```typescript
// ApiError côté client
try {
  await profileApi.get();
} catch (e) {
  if (e instanceof ApiError && e.status === 401) {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  } else if (e instanceof ApiError && e.status >= 500) {
    Toast.show({ type: 'error', text1: 'Erreur serveur', text2: 'Réessaye dans un instant.' });
  } else {
    Toast.show({ type: 'error', text1: e.message });
  }
}
```

**Retry automatique** : éviter au niveau du wrapper. Préférer un retry explicite dans le composant pour les opérations critiques (ex: création trial).

---

## Sécurité — points clés

- **Jamais de service role key** côté mobile. Uniquement `EXPO_PUBLIC_SUPABASE_ANON_KEY` (RLS active).
- **Tokens dans SecureStore** uniquement (jamais AsyncStorage)
- **HTTPS obligatoire** en prod (`EXPO_PUBLIC_API_URL=https://apexcoach.app`)
- **Refresh token transparent** via Supabase auth (`autoRefreshToken: true`)
- **Données santé Step 5** : envoyées en clair côté serveur (HTTPS suffit), le serveur chiffre avant stockage. Ne pas tenter de chiffrer côté mobile (Spec §10).

---

## Carte de délégation

| Situation | Skill |
|-----------|-------|
| Lire/écrire dans un store après l'API | **`apex-mobile-state`** |
| Auth flow (signin, signup, signout) | **`apex-mobile-state`** + ce skill |
| Modifier un schéma BDD | **`apex-migration`** (côté web) |
| Audit RLS / leaks de données | **`apex-mobile-security-review`** |
| Sync fichiers partagés (drift web→mobile) | Routine **MR7** Web Sync Detector |
