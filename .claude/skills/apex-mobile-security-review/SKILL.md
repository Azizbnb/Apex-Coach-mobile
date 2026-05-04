---
name: apex-mobile-security-review
description: >
  Skill audit sécurité mobile pour Apex Coach. À utiliser après chaque ajout
  de feature, modification d'écran avec accès données, création de hook qui
  manipule l'auth, mise en place d'un deep link, ou changement de logique
  d'accès. Ce skill passe en revue le code contre 12 règles critiques mobile,
  les risques RGPD spécifiques mobile (SecureStore, deep link injection,
  ATT prompt, leak de logs Sentry), et les patterns d'autorisation. Ne jamais
  merger une PR mobile sans avoir fait tourner ce skill. Déclencher sur :
  "vérifie la sécurité mobile", "audit avant merge", "ce code est-il sûr ?",
  "audit de sécurité mobile", "review avant merge".
---

# Apex Coach Mobile — Skill Audit Sécurité

L'app manipule des **données santé chiffrées côté serveur**, des **JWT en SecureStore**, et des **deep links** ouverts depuis l'extérieur. Toute faille y est haute sévérité (RGPD + santé). Ce skill est le filtre obligatoire avant merge.

---

## 12 règles critiques mobile (vérifier sur chaque PR)

**1. SecureStore pour tokens** — jamais `AsyncStorage` ni `localStorage` pour JWT, refresh token, deep link tokens.

**2. RLS active sur toute lecture Supabase** — `.eq('user_id', user.id)` même quand RLS le force. Double protection.

**3. Aucun service role key côté mobile** — uniquement `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

**4. Deep links validés** — tout paramètre URL est traité comme entrée utilisateur. Valider avec Zod avant usage. **Ne jamais ouvrir un lien externe reçu via deep link sans whitelist** (sinon redirection ouverte / phishing).

**5. ATT prompt iOS** — demander `requestTrackingPermission` au moment opportun (après valeur démontrée), jamais au lancement (Apple rejette).

**6. Pas de PII dans les logs Sentry** — filtrer les `breadcrumbs` qui contiennent email, prénom, données santé. Mettre en place `beforeSend` qui sanitize.

**7. Aucun secret en clair dans le code** — uniquement variables `EXPO_PUBLIC_*`. **Attention** : tout `EXPO_PUBLIC_*` est inlined dans le bundle JS, donc visible. Ne jamais y mettre une clé secrète (ex: clé Stripe secret, clé service role).

**8. Validation Zod côté client ET serveur** — la validation client est UX, la validation serveur est sécurité. Jamais l'une sans l'autre.

**9. Aucun `as any`** — interdit. Bypass de type = bypass de sécurité potentielle.

**10. Modèle Netflix strict** — zéro paiement in-app, zéro mention de prix. Tout CTA pricing redirige vers `apexcoach.app` via `WebBrowser` avec UTM.

**11. Données santé Step 5** — envoyées en clair côté serveur (HTTPS protège en transit). Le serveur chiffre AES-256-GCM avant stockage. Ne jamais tenter de chiffrer côté mobile (Spec §10).

**12. Audit log côté serveur** — toute opération sensible (login, create-trial, redeem, delete-account) doit déclencher un audit log via les API routes web. Le mobile ne logge pas — il appelle, le serveur logge.

---

## Checklist par type de changement

### Nouveau composant qui lit des données utilisateur

- [ ] Source de la donnée vérifiée (Supabase RLS ou apiFetch authentifié) ?
- [ ] Données santé filtrées si affichées (ne pas afficher `medicalConditionsDetails` en clair) ?
- [ ] Logs Sentry / console scrubbés ?

### Nouveau hook ou store

- [ ] Persistance via SecureStore si données sensibles ?
- [ ] Initialisation correcte au mount (race condition) ?
- [ ] Pas de side-effect dans le sélecteur (pure read only) ?

### Nouvelle API call

- [ ] Bearer token injecté ?
- [ ] Validation Zod du retour (le serveur peut envoyer du faux) ?
- [ ] ApiError handling robuste ?
- [ ] Audit log côté serveur si opération sensible ?

### Nouveau deep link route

- [ ] Scheme correct dans `app.json` ?
- [ ] Paramètres parsés et validés (Zod ou regex) ?
- [ ] Whitelist si redirection vers une URL externe ?
- [ ] Pas de fuite de tokens dans l'URL (use POST si possible) ?
- [ ] Universal Link configuré côté web (`.well-known`) ?

### Nouvelle dépendance npm

- [ ] License compatible (MIT/Apache OK ; GPL → audit légal) ?
- [ ] Maintenue (dernier commit < 6 mois) ?
- [ ] Pas de scripts post-install louches ?
- [ ] `npm audit` clean ?

### Modèle économique (pricing, paywall)

- [ ] Aucun prix affiché dans l'app ?
- [ ] Aucun bouton "S'abonner" qui crée une transaction in-app ?
- [ ] CTA paywall info redirige vers `apexcoach.app` avec UTM ?
- [ ] Texte ne mentionne ni Apple ni Google (Apple peut le voir comme contourner le système IAP — formulation neutre type "continue ton abonnement") ?

---

## RGPD spécifique mobile

| Sujet | Action mobile |
|-------|--------------|
| Droit d'accès (Art. 15) | Bouton "Exporter mes données" → call `/api/gdpr/export` (côté web) → email envoyé à l'user |
| Droit d'effacement (Art. 17) | Bouton "Supprimer mon compte" → 2 confirmations → `/api/user/delete-account` |
| Droit de rectification (Art. 16) | Édition du profil dans Settings (UI mobile) |
| Droit d'opposition (Art. 21) | Toggle marketing dans Settings + sync `consent_marketing` |
| Consentement notifications | Demande explicite avant `requestPermissions` (skill `apex-mobile-design`) |
| Consentement ATT iOS | `requestTrackingPermission` avec popup explicatif AVANT le prompt système |

---

## Risques mobile-spécifiques

| Risque | Mitigation |
|--------|-----------|
| **Capture d'écran sensible** (santé, plan détaillé) | iOS : `useEffect` + `expo-screen-capture`. Android : `FLAG_SECURE` sur les écrans concernés. À évaluer ticket par ticket. |
| **Background snapshot iOS** (preview multitâche affiche données) | `expo-screen-capture` ou écran neutre quand app passe en background |
| **Jailbreak / root detection** | Pas critique pour Apex (pas de DRM). Skip. |
| **Deep link injection** | Validation Zod stricte des params + whitelist redirections |
| **Reverse engineering bundle** | Inévitable. Ne JAMAIS mettre de secret dans `EXPO_PUBLIC_*`. |
| **Logs Sentry leak** | `beforeSend` sanitize ; user.id OK (Supabase UUID), email/santé NON. |

---

## Workflow audit avant merge

1. Lire le diff complet de la PR
2. Cocher la checklist du type de changement (ci-dessus)
3. Identifier 0-N findings :
   - **HIGH** : règle critique violée → bloquer le merge
   - **MED** : amélioration recommandée → commenter, ne pas bloquer
   - **LOW** : suggestion → mention rapide
4. Poster un commentaire structuré : `## Audit sécurité` avec sections HIGH / MED / LOW
5. Si tout vert : ✅ MR4 (Code Review) peut merger après ses propres checks

---

## Carte de délégation

| Situation | Skill |
|-----------|-------|
| Implémenter un fix de sécu | **`apex-mobile-dev`** |
| Audit RGPD complet | **`apex-rgpd`** (skill web réutilisable) |
| Tester un cas de sécurité | **`apex-mobile-test`** |
| Migration BDD avec impact RLS | **`apex-migration`** (côté web) |
