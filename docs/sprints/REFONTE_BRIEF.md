# Brief — Refonte des sprints mobile pour alignement 100% avec l'app web

> **Auteur :** session Claude du 16 mai 2026
> **Pour :** session future qui reprend ce travail
> **Statut :** à attaquer en début de session, avant tout code

---

## Contexte rapide (à lire en premier)

L'app mobile Apex Coach (`apex-coach-mobile`) est censée être **le reflet exact de l'app web** (`Apex-Coach`) en format natif. La règle d'or : **zéro divergence fonctionnelle**, juste une adaptation UI au format mobile.

Mais en pratique, plusieurs écarts ont été détectés au cours du Sprint 2 :

1. **Écran d'entraînement actif initialement codé en version simpliste** (un seul écran avec SetTracker) alors que le web a un **flow à 6 phases** (warmup → prep → exercise → restChoice → resting → cooldown → completed). Corrigé par PR #31, mais ça révèle un risque systémique : **la spec mobile + les tickets des sprints ne décrivent pas le flow web avec assez de précision**, ce qui pousse à reconstruire au lieu d'adapter.

2. **Routes EN/FR incohérentes** (`workout`/`progress` vs `programme`/`nutrition`/`profile`). Corrigé par PR #30 (renommés en `entrainement`/`bilan`), mais ça aurait dû être pris dans la spec initiale.

3. **Sprints S3/S4/S5 jamais relus depuis la mise à jour spec v2** — risque d'avoir d'autres écarts non détectés (questionnaire 27 micro-steps, paywall info, weekly feedback, settings, etc.).

→ **Décision** : on refait les sprints S2-S5 en partant **de la source de vérité** : le code web actuel. Chaque ticket mobile doit pointer vers le composant web qu'il mirror, avec une description précise du flow.

---

## État du repo au démarrage de la prochaine session

### PRs récentes (toutes mergées)

| PR | Titre | Apport |
|---|---|---|
| [#29](https://github.com/Azizbnb/Apex-Coach-mobile/pull/29) | Assemblage écrans S2 | Écrans Programme / Semaine / Session detail / Session complete |
| [#30](https://github.com/Azizbnb/Apex-Coach-mobile/pull/30) | Icons + routes FR | `newArchEnabled: false` + routes `entrainement`/`bilan` |
| [#31](https://github.com/Azizbnb/Apex-Coach-mobile/pull/31) | Flow entraînement | Machine d'état à 6 phases (`warmup → … → completed`) |

### Ce qui marche bout-en-bout

```
Login → Programme (WeekCards avec progressive unlock J+0/7/14/21)
     → Semaine N (SessionCards par jour Lundi → Dimanche)
     → modal session-detail (warmup + exos + cooldown)
     → "Démarrer la séance"
     → Tab Entraînement avec orchestrateur 6 phases :
        warmup (carte expandable + démo + CTA)
        → prep (liste numérotée + "C'est parti !")
        → exercise (vue 1-par-1 + dots + validation série)
        → restChoice ("Série N validée !" → Repos / Enchaîner)
        → resting (timer animé)
        → cooldown (carte retour au calme)
        → completed (modal session-complete avec stats)
```

### Ce qui reste placeholder ou approximatif

| Domaine | Statut | Référence web |
|---|---|---|
| Onboarding (welcome + questionnaire 27 micro-steps) | ❌ placeholder | `Apex-Coach/app/(auth)/onboarding/` |
| Trial gratuit + create-account flow | ❌ stub signup | `Apex-Coach/app/api/auth/create-trial-account` |
| Paywall **info** (mobile = redirection web, pas IAP) | ❌ absent | À documenter par toi (modèle Netflix, app gratuite) |
| Code promo / redeem | ❌ absent | `Apex-Coach/app/redeem` |
| Bilan hebdo modal | ❌ absent | `Apex-Coach/app/(authenticated)/bilan/formulaire` |
| Tab Bilan (stats + historique) | ❌ placeholder | `Apex-Coach/app/(authenticated)/bilan` + `/analytics` |
| Section Settings dans Profil | ❌ stub | `Apex-Coach/app/settings/*` |
| Reviews depuis Profil | ❌ absent | `Apex-Coach/app/api/reviews/*` |
| Fasting toggle (jeûne) | ❌ absent | `Apex-Coach/lib/fasting/*` |
| Notifications push | ❌ absent | `Apex-Coach/lib/notifications/*` |
| Sentry mobile | ❌ absent | (cf. Sentry web pour cohérence DSN/tags) |
| Drag-and-drop exercices dans prep | ⚠️ noté v2 dans PR #31 | `Apex-Coach/components/entrainement/SortableExerciseItem.tsx` |
| Vidéo démo embarquée | ⚠️ ouvre navigateur pour l'instant | `Apex-Coach/components/entrainement/ExerciseVideoModal.tsx` |
| Timer libre dans WorkoutTopBar (presets) | ⚠️ absent | `Apex-Coach/components/entrainement/WorkoutTimerStrip.tsx` |
| Routines MR3-MR7 (Visual QA, Code Review, EAS, Sentry, Web Sync) | ❌ documentées mais pas activées | `docs/routines/MR{3..7}.md` |

### Stack technique (rappel)

- **Mobile** : Expo 55.0.6 / RN 0.83.2 / React 19.2 / Expo Router / NativeWind 4.2.3 / Zustand 5 / Supabase RN
- **Web** : Next.js 15 / React 19 / Supabase / Stripe (reader model pour mobile = paiement via browser web uniquement)
- **Modèle économique** : app mobile **100% gratuite**, aucun paiement in-app. Trial 7j + signup depuis mobile possibles (gratuits donc Apple OK). Toute conversion payante via `apexcoach.app` en navigateur externe. Pricing : Coaching 14,90€/mois ou 99€/an, Coaching Pro 24,90€/mois ou 199€/an.

---

## Mission de la prochaine session

### Objectif

**Refondre intégralement les sprints S2 → S5** pour qu'ils décrivent **un mirror précis** du flow web Apex Coach, avec assez de détails pour qu'un agent (humain ou MR2) puisse implémenter chaque ticket sans avoir à reconstruire la logique.

### Livrable attendu

1. Un document **`docs/sprints/WEB_FLOW_AUDIT.md`** qui contient :
   - L'inventaire complet des pages web utilisateur (route + nom de fichier + 1 ligne sur ce qu'elle fait)
   - L'inventaire complet des modals/dialogs/overlays web
   - Pour chaque page/modal : composants clés, state management, API routes appelées, et logique métier non-évidente
   - Le flow utilisateur dashboard : enchaînement Login → onboarding → trial → programme → entraînement → bilan → profil → settings → re-engagement

2. Les fichiers `docs/sprints/sprint-{2,3,4,5}.md` **réécrits** :
   - Chaque ticket pointe vers le(s) composant(s) web qu'il mirror
   - Chaque ticket liste les écarts intentionnels mobile (ex: pas de pricing visible, paywall = browser redirect, modals au lieu de pages)
   - Chaque ticket a une checklist d'acceptance qui matche le flow web
   - Sprint 2 ré-évalué : marque les tickets déjà livrés (T05/T06/T10 etc.), ajoute les correctifs nécessaires (drag-drop, vidéo modal, timer libre)
   - Sprint 3-4-5 redécoupés selon la nouvelle granularité

3. Le backlog `docs/sprints/backlog.md` régénéré à partir de WEB_FLOW_AUDIT.md (top-down).

### Méthodologie d'analyse à appliquer

**Phase 1 — Audit web (sans toucher le code mobile)**

Utiliser des agents Explore en parallèle pour disséquer le repo web `C:\Users\benta\Apex-Coach` :

- **Agent 1** : `app/` complet — toutes les routes, layouts, et middlewares. Distinguer auth/public/dashboard. Produire un arbre lisible.
- **Agent 2** : Tous les composants sous `components/` regroupés par domaine (auth, entrainement, nutrition, bilan, programme, settings, paywall, onboarding). Mapper composant → routes où il est utilisé.
- **Agent 3** : Les modals/dialogs (probablement utilisant Radix ou shadcn `Dialog`). Lister chaque modal + ce qu'il fait + comment il est déclenché.
- **Agent 4** (optionnel) : API routes consommées par le frontend (`app/api/*`), pour savoir quelles données chaque écran charge.

**Phase 2 — Synthèse**

À partir des audits, écrire `WEB_FLOW_AUDIT.md` qui pour chaque écran/modal documente :
- Route web exacte
- Fichier source
- Composants enfants principaux
- API/data consommée
- Transitions sortantes (où l'utilisateur peut aller depuis cet écran)
- Notes mobile : adaptations attendues (modal au lieu de page, browser redirect au lieu de modal, etc.)

**Phase 3 — Refonte des sprints**

Pour chaque sprint S2-S5, réécrire les tickets en partant de WEB_FLOW_AUDIT.md. Chaque ticket = un mirror d'un écran/modal/composant web identifiable. Pas de "tickets composants" sans contexte d'usage : chaque composant doit être rattaché à au moins un écran qui l'utilise.

**Phase 4 — Validation**

Demander à l'utilisateur (Aziz) de relire les sprints refaits avant d'attaquer l'implémentation. Une fois validés, mettre à jour `CLAUDE.md` ligne « Planning Sprint » pour refléter le nouveau découpage.

---

## Points d'attention découverts cette session

À garder en tête pour ne pas refaire les mêmes erreurs :

1. **Ne JAMAIS coder un écran mobile sans avoir lu l'équivalent web**. La PR #29 a fabriqué un écran workout simpliste car j'ai consommé le store sans vérifier ce que le web fait. Conséquence : refonte complète en PR #31. Coût : ~1 PR perdue.

2. **Les composants web sont déjà conçus pour le responsive mobile**. Quand tu regardes une maquette mobile, elle vient probablement directement du composant web rendu en petit écran. Donc le visuel à reproduire est déjà visible côté web — pas besoin de maquettes externes.

3. **Le programme IA stocke `program_data: unknown` côté Supabase**, et la structure typée vit dans `Apex-Coach/lib/programs/schemas.ts` (Zod). Côté mobile, l'adapter `lib/programs/adapter.ts` (créé en PR #29) parse cette structure. Si le schéma web change, l'adapter mobile doit suivre.

4. **Le store workout a deux modes de fin** :
   - `finishSession()` → transition vers phase `completed` (garde les stats pour `session-complete`)
   - `resetSession()` → reset complet (utilisé quand l'utilisateur abandonne ou quitte la séance)
   Ne pas confondre les deux.

5. **Routes en FR partout** désormais : `/programme`, `/entrainement`, `/nutrition`, `/bilan`, `/profil` (à venir). Si tu vois un `router.push('/(tabs)/workout')` quelque part, c'est un bug — c'est `/(tabs)/entrainement`.

6. **L'app est 100% gratuite, paywall = info uniquement**. Ne JAMAIS ajouter de bouton « S'abonner X € » dans l'app. Toute conversion = `WebBrowser.openBrowserAsync('https://www.apexcoach.app/checkout?...')` avec UTM `source=ios_app` ou `android_app`.

7. **Les routines MR1+MR2 sont actives, MR3-MR7 sont des PRs ouvertes à faire**. MR2 prend les tickets "petits" du backlog ; les gros tickets (workout actif, questionnaire, paywall) doivent être pris manuellement.

---

## Backlog d'améliorations à arbitrer

En plus de la refonte des sprints, voici les améliorations identifiées lors de cette session, à attaquer dans l'ordre que tu préfères (ou à intégrer dans les sprints refaits) :

- **Drag-and-drop des exos en phase `prep`** — actuellement la liste numérotée affiche l'ordre généré par l'IA, mais le user ne peut pas réorganiser. Le web utilise `@dnd-kit` (`Apex-Coach/components/entrainement/SortableExerciseItem.tsx`). À porter en RN via `react-native-reanimated` + `react-native-gesture-handler` (~150 LOC).

- **Modal vidéo démo intégré** — actuellement les boutons « Démo » ouvrent `WebBrowser.openBrowserAsync(url)`. Le web a un modal lecteur (`Apex-Coach/components/entrainement/ExerciseVideoModal.tsx`). À implémenter via `expo-av` ou `expo-video`. Nécessite aussi d'exposer les URLs vidéo dans le schéma de programme IA (champ manquant aujourd'hui).

- **Timer libre dans la WorkoutTopBar** (presets 30s / 1m / 1m30 / 2m / 3m) — composant existant côté web : `Apex-Coach/components/entrainement/WorkoutTimerStrip.tsx`. Indépendant du timer repos (peut tourner en parallèle).

- **Activation des routines MR3-MR7** (Code Review, Visual QA, EAS Build, Sentry Triage, Web Sync) — documentées dans `docs/routines/` mais jamais branchées. Effort total ~10h via GitHub Actions. Ordre recommandé : MR4 → MR3 → MR8 → MR6 → MR5 → MR7. Prérequis : 3 secrets repo (`ANTHROPIC_API_KEY`, `EAS_TOKEN`, `WEB_REPO_TOKEN`) + branch protection sur `claude/main`.

- **Autre chose que tu auras remarqué** en testant les PRs mergées — note-le en démarrant la prochaine session pour qu'on l'intègre.

---

## Prompt suggéré pour démarrer la prochaine session

> « Lis `docs/sprints/REFONTE_BRIEF.md` et démarre Phase 1 (audit web) avec 3-4 agents Explore en parallèle. Quand tu as les résultats, écris `docs/sprints/WEB_FLOW_AUDIT.md`. Demande-moi confirmation avant de passer à la Phase 3 (refonte des sprints). »

---

## Annexes utiles

- Spec mobile officielle : `C:\Users\benta\Apex-Coach\docs\MOBILE_APP_TECHNICAL_SPEC_v2.md` (v2.0, 14 avril 2026) — **probablement obsolète sur certains points**, à confronter avec le code web actuel
- `CLAUDE.md` (racine repo mobile) : règles critiques + stack + planning sprints
- `docs/AUDIT_PHASE_0.md` : audit historique (fichiers partagés web↔mobile)
- `docs/routines/README.md` : vue d'ensemble des 7 routines MR1-MR7
