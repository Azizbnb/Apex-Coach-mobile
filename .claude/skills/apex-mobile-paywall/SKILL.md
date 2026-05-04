---
name: apex-mobile-paywall
description: >
  Skill paywall + redirection web pour Apex Coach Mobile (modèle Netflix).
  À utiliser pour TOUT ce qui touche à la conversion paiement : paywall
  informational (zéro prix affiché), CTA browser vers `apexcoach.app`,
  helper `WebBrowser.openBrowserAsync` avec UTM injectés, attribution Apple
  Search Ads + Play Install Referrer, banners trial / promo / paywall, et
  lecture state subscription. **Aucun paiement in-app, aucun IAP, aucun
  Stripe SDK** — l'app ne traite jamais d'argent. Déclencher sur :
  "paywall mobile", "redirection web", "WebBrowser", "UTM", "attribution",
  "trial expired mobile", "paywall info".
---

# Apex Coach Mobile — Skill Paywall (modèle Netflix)

L'app est **100% gratuite**. Ce skill couvre la couche conversion : afficher la valeur, déclencher le CTA browser au bon moment, tracker l'attribution. **Aucun paiement, aucun IAP, aucun prix affiché.**

---

## Règles d'or (rappel)

1. **Aucun prix affiché dans l'app** — pas de "14,90€/mois", pas de comparatif chiffré. Strictement bénéfices/features.
2. **Aucun bouton "S'abonner X €"** — uniquement "Continuer sur le web" / "Découvrir nos formules".
3. **CTA browser uniquement** — `WebBrowser.openBrowserAsync` avec UTM. Jamais d'IAP, jamais de WebView Stripe inline.
4. **Pas de mention Apple/Google** — formulation neutre. Ne pas écrire "Achetez sur le web pour économiser les frais Apple" (rejet App Store assuré).

---

## Helper `lib/web-browser.ts` (à créer S3-T20)

Centralise **tout** lien externe avec UTM auto-injectés.

```typescript
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

interface WebBrowserOptions {
  campaign?: string;
  medium?: 'app' | 'paywall' | 'profile' | 'redeem';
}

export async function openWebUrl(url: string, opts: WebBrowserOptions = {}) {
  const u = new URL(url);
  u.searchParams.set('utm_source', Platform.OS === 'ios' ? 'ios_app' : 'android_app');
  u.searchParams.set('utm_medium', opts.medium ?? 'app');
  if (opts.campaign) u.searchParams.set('utm_campaign', opts.campaign);
  return WebBrowser.openBrowserAsync(u.toString(), {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: '#84CC16',
  });
}
```

> **Toute** redirection web passe par ce helper. Si tu vois `WebBrowser.openBrowserAsync` directement dans un composant, c'est un bug à fixer.

---

## Composant `PaywallInformational` (S3-T13)

Pattern de base :

```typescript
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { openWebUrl } from '@/lib/web-browser';

interface PaywallInformationalProps {
  trigger: 'trial_expired' | 'feature_locked' | 'trial_j1';
  onClose: () => void;
}

export function PaywallInformational({ trigger, onClose }: PaywallInformationalProps) {
  return (
    <View className="flex-1 bg-apex-black-900 p-6 justify-center">
      <Text variant="h1" className="text-white mb-4">Continue ton aventure Apex Coach</Text>
      <Text variant="body" className="text-apex-black-400 mb-6">
        Programme IA, suivi de progression, plan nutrition personnalisé : tout est prêt à reprendre côté web.
      </Text>
      <Button
        label="Continuer sur le web"
        variant="primary"
        onPress={() => openWebUrl('https://www.apexcoach.app/pricing', { campaign: `paywall_${trigger}`, medium: 'paywall' })}
      />
      <Button label="Plus tard" variant="ghost" onPress={onClose} className="mt-3" />
    </View>
  );
}
```

> Note : aucun prix, aucune mention Apple/Google. Texte 100% positif et orienté valeur.

---

## Triggers de paywall

| Trigger | Quand l'afficher | Campaign UTM |
|---------|-----------------|---------------|
| `trial_expired` | Trial expiré, app ouverte | `paywall_trial_expired` |
| `trial_j1` | J-1 avant fin trial | `paywall_trial_j1` |
| `feature_locked` | User tape sur Nutrition (sans Pro) ou Progress (sans Coaching) | `paywall_feature_locked_{feature}` |
| `paywall_passive` | Banner discret en haut du Programme si user en trial | `paywall_passive_banner` |

---

## Banners (Sprint 2)

| Banner | Composant | Quand | Action |
|--------|-----------|-------|--------|
| `TrialBanner` | `components/subscription/TrialBanner.tsx` | `isTrial && daysLeft > 0` | tap → ouvre `PaywallInformational(trial_passive)` |
| `PromoExpiryBanner` | `components/subscription/PromoExpiryBanner.tsx` | `isPromo && daysToExpiry <= 7` | tap → ouvre `apexcoach.app/account/billing?utm_campaign=promo_expiry` |
| `FeatureGate` | `components/subscription/FeatureGate.tsx` | wrap composant gated | si plan insuffisant : affiche CTA → `PaywallInformational(feature_locked)` |

---

## Attribution (S3-T20)

Hook `useAppAttribution` qui :
- iOS : tente `AdAttributionKit` (iOS 17.4+) puis fallback `AAAttribution.attributionToken()`. ATT prompt pour IDFA si besoin (jamais au lancement).
- Android : `Play Install Referrer API` via lib RN dédiée.
- Persiste les params dans `profiles.attribution_data` (jsonb, à ajouter via migration côté web — ticket dédié).
- Injecte `utm_source` automatiquement dans `openWebUrl` (déjà fait par le helper).

```typescript
const { attributionData, isReady } = useAppAttribution();
// Au signup : POST /api/auth/create-trial-account avec attributionData en plus
```

---

## Lecture state subscription (read-only)

L'app **lit** la subscription depuis Supabase ou `/api/subscription/current`. Elle ne **crée** ni ne **modifie** jamais une subscription. Toute modif vient du web (Stripe webhook → `subscriptions` table).

```typescript
const { isTrial, isPromo, isActive, hasNutrition, daysLeft } = useSubscription();
// hooks/useSubscription.ts dérive ces valeurs depuis stores/subscription.ts (déjà existant)
```

---

## Cas spéciaux App Store

- **Family Sharing** : non géré (pas pertinent — on ne vend rien dans l'app)
- **Restore purchases** : pas applicable (aucun achat in-app)
- **Subscription management** : redirige vers `apexcoach.app/account/billing` (le user gère son Stripe Portal côté web)

---

## Carte de délégation

| Situation | Skill |
|-----------|-------|
| UI du paywall ou banner | **`apex-mobile-design`** |
| Logique state isTrial/isActive | **`apex-mobile-state`** |
| Lire subscription via API | **`apex-mobile-api`** |
| Audit du flow paywall (sécu, RGPD) | **`apex-mobile-security-review`** |
| Migration `subscriptions.attribution_data` côté web | **`apex-migration`** |
| Voix FR du paywall (microcopy persuasif) | **`apex-copywriting`** (skill web) |
