# Backlog Apex Coach Mobile — Source de vérité MR1

> **Rôle :** ce fichier est la **source de vérité** lue par la routine `MR1 Sprint Planner` chaque lundi 05:00 UTC. Chaque ticket listé devient une issue GitHub fragmentée (1 issue = 1 PR < 300 lignes).
> **Mise à jour :** manuelle par toi (Abdelaziz) ou par PR review humaine. MR1 ne modifie jamais ce fichier — il le lit seulement.
> **Règle critique :** un ticket ne quitte PAS le backlog tant que la PR correspondante n'est pas mergée.

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
| 2 | [sprint-2.md](sprint-2.md) | Dashboard + Programme + Workout actif + Nutrition + Affiliés + Banners | 15 tickets (S2-T00 Setup Jest ajouté en tête, prérequis MR2) | À planifier |
| 3 | [sprint-3.md](sprint-3.md) | Onboarding + Trial + Questionnaire 27 steps + Codes Promo + Paywall info + Tutoriel | 17 tickets (Reader/IAP supprimés, modèle Netflix : S3-T19 = welcome hero, S3-T20 = attribution, S3-T24 = tutoriel) | À planifier |
| 4 | [sprint-4.md](sprint-4.md) | Notifications push + Bilan + Settings + Reviews + Polish + Sentry | 14 tickets | À planifier |
| 5 | [sprint-5.md](sprint-5.md) | Publication TestFlight + Play Internal + ASO + .well-known + buffer review | 8 tickets | À planifier |

**Total :** 54 tickets fragmentés sur 4 sprints (~32 jours-homme dans la spec v2, -2j Reader supprimé + 1j tutoriel + 1j attribution + 0,5j setup Jest = ~32,5j — cible : < 6 semaines en routine continue 2 PR/jour).

> **Décision finale 04/05/2026** : **App 100% gratuite, modèle Netflix.** Le paiement reste Stripe sur `apexcoach.app` uniquement. L'app permet signup + trial + redeem mais aucun paiement in-app, aucune mention de prix. 0% commission Apple/Google. Voir `docs/AUDIT_PHASE_0.md` §5.

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
