# Backlog Apex Coach Mobile — Source de vérité MR1

> **Rôle :** ce fichier est la **source de vérité** lue par la routine `MR1 Sprint Planner` chaque lundi 05:00 UTC. Chaque ticket listé devient une issue GitHub fragmentée (1 issue = 1 PR < 300 lignes).
> **Mise à jour :** manuelle par toi (Abdelaziz) ou par PR review humaine. MR1 ne modifie jamais ce fichier — il le lit seulement.
> **Règle critique :** un ticket ne quitte PAS le backlog tant que la PR correspondante n'est pas mergée.
> **Refonte 2026-05-16 :** sprints S2-S5 réécrits sur la base de [`WEB_FLOW_AUDIT.md`](WEB_FLOW_AUDIT.md). Chaque ticket pointe désormais vers le composant/page web qu'il mirror. Brief : [`REFONTE_BRIEF.md`](REFONTE_BRIEF.md).

---

## Format d'un ticket

Chaque ticket suit ce gabarit (parsable par MR1) :

```markdown
### {ID}: {Titre court impératif}

- **Statut :** todo | in-progress | done
- **Estimation :** {S|M|L} ({LOC} lignes env., {risque} = low|med|high)
- **Dépendances :** {IDs} ou `aucune`
- **Fichiers :** liste des fichiers impactés
- **Critères d'acceptance :**
  - [ ] critère 1
  - [ ] critère 2
- **Notes :** précisions techniques (libs, contraintes, refs spec)
```

**Tailles** : S = < 100 LOC, M = 100–250 LOC, L = 250–500 LOC. Au-delà de L, fragmenter en sous-tickets.

**ID** : `S{sprint}-T{numero:02d}` (ex: `S2-T01`).

---

## Index par sprint

| Sprint | Fichier | Thème | Tickets | Statut |
|--------|---------|-------|---------|--------|
| 1 | — | Fondations Expo + auth + nav + UI + stores | — | **Terminé (16/03/2026)** |
| 2 | [sprint-2.md](sprint-2.md) | Dashboard + Programme + Workout actif (6 phases) + Nutrition + Affiliés + Banners | 26 tickets (17 done via 16 PRs déjà mergées, 9 todo : 2 banners T13/T14 + 3 correctifs flow workout T19-T21 + 4 polish nutrition T22-T25) | En cours |
| 3 | [sprint-3.md](sprint-3.md) | Welcome + Onboarding + Questionnaire 24 micro-steps + Redeem + Paywall info + Auth deep links + Attribution + Tutoriel | 26 tickets (modèle Netflix : zéro IAP, zéro prix affiché, conversion via WebBrowser uniquement) | À planifier |
| 4 | [sprint-4.md](sprint-4.md) | Bilan modal + Tab Bilan (analytics) + Profil + Settings (objectif, jeûne, mdp, RGPD, delete, reviews) + Notifications push + Sentry | 20 tickets | À planifier |
| 5 | [sprint-5.md](sprint-5.md) | Publication TestFlight + Play Internal + ASO + .well-known + buffer review stores | 8 tickets | À planifier |

**Total :** 80 tickets (dont 17 déjà mergés via 16 PRs Sprint 2). Reste à livrer : 63 tickets (9 Sprint 2 + 26 Sprint 3 + 20 Sprint 4 + 8 Sprint 5) — cible : < 7 semaines en routine continue 2 PR/jour.

> **Décision finale 04/05/2026** : **App 100% gratuite, modèle Netflix.** Le paiement reste Stripe sur `apexcoach.app` uniquement. L'app permet signup + trial + redeem mais aucun paiement in-app, aucune mention de prix. 0% commission Apple/Google. Voir `docs/AUDIT_PHASE_0.md` §5 et `WEB_FLOW_AUDIT.md` §9.

> **Source de vérité du flow :** [`WEB_FLOW_AUDIT.md`](WEB_FLOW_AUDIT.md) liste l'ensemble des routes / modals / API consommées par le web et indique pour chacune la cible mobile correspondante. Toute nouvelle feature mobile doit pouvoir citer une route ou un modal de cet audit, sinon elle est hors scope.

---

## Règles de priorité (utilisées par MR1)

1. **Bloqueurs en premier** : un ticket sans dépendances pendantes passe avant un ticket à dépendances.
2. **Verticalité** : préférer terminer un flow utilisateur complet (ex: workout entier) avant de pivoter (ex: nutrition).
3. **Risque décroissant** : commencer par les `high risk` du sprint pour exposer les blocages tôt.
4. **Pas plus de 1 ticket `L` en parallèle** : éviter les PR géantes simultanées.

---

## Conventions hors-ticket (s'applique à tous)

- **Stack imposée** : Expo 55, RN 0.83, Expo Router 55, NativeWind 4.2, Zustand 5, RHF 7.71 + Zod 4.3
- **Dark mode only** : `bg-apex-black-900` (`#0A0E1A`), `text-white`
- **FR partout** : tous les messages UI, erreurs, labels — natif idiomatique
- **NativeWind only** : zéro `StyleSheet.create`, classes Tailwind via `className`
- **Imports** : path alias `@/*`
- **Types** : zéro `as any`, jamais
- **Auth** : SecureStore (jamais AsyncStorage pour JWT)
- **API** : Sprint 1-2 = Supabase RN direct (RLS protège), Sprint 3+ = `apiFetch` Bearer
- **Validation** : Zod côté client (UX) + serveur (sécurité)
- **Accessibilité** : `accessibilityLabel`, `accessibilityRole`, `hitSlop` ≥ 8 sur les targets < 44px

---

## Modifications du backlog

Si tu ajoutes/modifies/supprimes un ticket :
1. Édite le fichier `sprint-{N}.md` correspondant
2. Mets à jour le compteur `Tickets` dans l'index ci-dessus
3. Commit sur `claude/main` avec message `backlog: {action} {ID} — {raison}`

MR1 lira le backlog tel qu'il est sur `claude/main` au moment du cron (lundi 05:00 UTC).
