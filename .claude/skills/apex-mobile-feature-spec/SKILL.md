---
name: apex-mobile-feature-spec
description: >
  Skill de spécification de feature mobile pour Apex Coach. À utiliser AVANT
  d'écrire du code pour structurer le besoin, identifier les fichiers
  impactés (mobile + parfois web), les composants à créer/modifier, les
  hooks/stores nécessaires, les routes Expo Router, les fichiers partagés à
  synchroniser, et les risques (rejet App Store, sync web, anti-troncature).
  Produit un document de spec qui sert de plan d'implémentation et alimente
  un ou plusieurs tickets dans `docs/sprints/sprint-{N}.md`. Déclencher sur :
  "spec", "planifier la feature", "comment ajouter X", "qu'est-ce qu'il
  faudrait faire pour", "prépare l'implémentation de".
---

# Apex Coach Mobile — Skill Feature Spec

Avant d'écrire la première ligne de code, on rédige une **spec courte mais complète** qui sert de contrat entre l'auteur, le reviewer (humain ou MR4), et la routine d'implémentation MR2. Une spec ratée = des PR géantes, des bugs cachés, et des refonte permanentes.

---

## Format de spec (gabarit obligatoire)

```markdown
# Feature : {Nom court impératif}

## Contexte
- **Pourquoi maintenant** : motivation utilisateur ou business
- **Sprint visé** : 2 / 3 / 4 / 5
- **Tickets liés** : S{n}-T{nn} (créés ou à créer dans `docs/sprints/sprint-{n}.md`)
- **Dépend de** : tickets antérieurs ou aucun

## Comportement attendu
- Flux utilisateur en 3-5 bullet points
- États : empty / loading / success / error
- Cas limites : trial expiré, hors-ligne, plan insuffisant, premier login

## Contraintes mobile
- [ ] Modèle Netflix respecté (zéro paiement in-app, zéro prix affiché)
- [ ] Dark mode (`#0A0E1A`)
- [ ] FR natif
- [ ] Accessibilité (labels, hitSlop)
- [ ] Anti-troncature (chaque fichier < 150 lignes en Write)

## Architecture proposée
### Routes Expo Router
- `app/...` à créer ou modifier

### Composants
- `components/.../X.tsx` — rôle en 1 phrase
- Réutiliser : Button, Card, etc.

### State / Hooks
- Store : modif ou nouveau
- Hook : `useX` à créer ?

### Couche données
- Sprint 1-2 : Supabase RN direct, table cible, RLS active ?
- Sprint 3+ : `apiFetch('/api/...')`, route web existante ou à créer côté web ?

### Fichiers partagés à synchroniser
- `types/`, `lib/validations/`, `lib/config/pricing.ts`, etc.

## Découpage en tickets
- S{n}-T{nn} : titre + estimation S/M/L + dépendances
- (1 ticket = 1 PR < 300 lignes — fragmenter si trop gros)

## Risques
- Sync web (drift) — ce qui doit changer côté web aussi
- Rejet App Store — moindre risque vu modèle Netflix
- Performance (rendu liste, animation)
- Apple-spécifique (deep link, ATT prompt)
- Android-spécifique (intent filter, retour matériel)

## Vérification end-to-end
- Comment tester localement (commandes, scénarios)
- Tests Jest RN à écrire (skill `apex-mobile-test`)
- Test EAS Build preview nécessaire ?
```

---

## Règles de fragmentation

1. **1 ticket = 1 PR < 300 LOC effectives** (hors tests). Si une feature dépasse, la découper en 2-3 tickets dépendants.
2. **Préférer la verticalité** : un ticket fait de bout en bout 1 micro-feature (ex: composant + intégration dans un écran), plutôt qu'horizontal (ex: tous les composants d'abord, intégration plus tard).
3. **Ticket bloquant en premier** : si `S2-T05` (écran programme) dépend de `S2-T01` (WeekCard), `T01` passe avant.
4. **High risk en début de sprint** : exposer les blocages tôt.
5. **Pas plus d'1 ticket `L` en parallèle** : éviter les PR géantes simultanées.

---

## Erreurs courantes à éviter

- **Spec floue** ("ajoute la nutrition") → MR2 va halluciner. Décris le flux, l'écran cible, les composants exacts.
- **Oublier le sync web** : si la feature ajoute un champ DB, il faut une migration côté web (skill `apex-migration`) AVANT le ticket mobile.
- **Mélanger plusieurs features** : une spec = une feature. Si tu hésite, découpe.
- **Pas de critères d'acceptance vérifiables** : « UI propre » n'est pas vérifiable. « Le bouton "Démarrer" affiche un toast après tap et déclenche `/api/X` » l'est.
- **Sauter la spec** pour gagner du temps : MR2 suit la spec, pas tes intuitions. Une spec en 20 min évite 2h de refonte.

---

## Workflow recommandé

1. Tu décris la feature oralement à Claude (ou texte court)
2. Active **`apex-mobile-feature-spec`** → ça génère la spec gabarit
3. Tu valides ou corriges la spec
4. La spec génère 1 ou plusieurs tickets dans `docs/sprints/sprint-{N}.md`
5. Tu commits le backlog mis à jour
6. MR1 le lit lundi suivant et fragmente en issues GitHub
7. MR2 prend les issues une par une

> **Raccourci :** pour une feature simple (1 ticket), tu peux créer le ticket directement dans `sprint-{N}.md` sans passer par la spec étendue. Mais utilise au moins le format des critères d'acceptance.

---

## Exemple condensé

> « Ajoute un toast global pour les erreurs réseau »

```markdown
# Feature : Toast global erreurs réseau

## Contexte
- Pourquoi : aujourd'hui les ApiError se loggent en console, pas visibles user
- Sprint : 4 (polish)
- Tickets : S4-T15 (nouveau)

## Comportement
- Tout `ApiError` dont status >= 500 → toast rouge "Erreur serveur, réessaye"
- Status 401 → redirect login (déjà géré, pas de toast)
- Status 4xx autre → toast orange avec message API si dispo

## Architecture
- Lib : `react-native-toast-message`
- Composant : `<Toast />` à mount dans `app/_layout.tsx`
- Helper : `lib/error-handler.ts` (handle d'ApiError)

## Tickets
- S4-T15 (S, ~80 LOC, low) : toast global + handler erreurs

## Vérif
- Couper le wifi, ouvrir programme → toast s'affiche
- `npx tsc --noEmit` vert
```

---

## Carte de délégation

| Situation | Skill |
|-----------|-------|
| Implémenter après spec | **`apex-mobile-dev`** + skills spécialisés |
| Risques sécurité dans la spec | **`apex-mobile-security-review`** |
| Tests à prévoir | **`apex-mobile-test`** |
| Migration BDD nécessaire | **`apex-migration`** (côté web) |
