# User Stories - Application Jimboa

Ce document détaille toutes les user stories organisées par épiques pour l'application Jimboa, une plateforme de jeux sociaux en groupe avec des manches quotidiennes.

## Table des matières

- [EPIC A — Authentification & Profil (Google OAuth)](#epic-a--authentification--profil-google-oauth)
- [EPIC B — Appareils & Notifications](#epic-b--appareils--notifications)
- [EPIC C — Groupes (création, rôles, invitations)](#epic-c--groupes-création-rôles-invitations)
- [EPIC D — Réglages de groupe](#epic-d--réglages-de-groupe)
- [EPIC E — Prompts Hybrides (Global + Local)](#epic-e--prompts-hybrides-global--local)
- [EPIC F — Cycle de vie d'une manche (round)](#epic-f--cycle-de-vie-dune-manche-round)
- [EPIC G — Soumissions](#epic-g--soumissions)
- [EPIC H — Médias (images/vidéos/audio/fichiers)](#epic-h--médias-imagesvidéosaudiofichiers)
- [EPIC I — Commentaires](#epic-i--commentaires)
- [EPIC K — Votes (prompts type "vote")](#epic-k--votes-prompts-type-vote)
- [EPIC L — Consultation des résultats](#epic-l--consultation-des-résultats)
- [EPIC M — Intégrité & Accès](#epic-m--intégrité--accès)
- [EPIC N — Planificateur (heure française)](#epic-n--planificateur-heure-française)
- [EPIC O — Feed & Navigation](#epic-o--feed--navigation)
- [EPIC P — Actions d'admin simples](#epic-p--actions-dadmin-simples-sans-système-de-modération-dédié)
- [EPIC R — Confidentialité & Données](#epic-r--confidentialité--données)
- [EPIC S — Résilience & Erreurs](#epic-s--résilience--erreurs)
- [Notes de conception transverses](#notes-de-conception-transverses)

---

## EPIC A — Authentification & Profil (Google OAuth)

### A1 — Créer automatiquement un profil à la première connexion Google OAuth

**En tant que** nouvel utilisateur  
**Je veux** qu'un profil soit créé à partir de mon compte Google  
**Afin de** pouvoir rejoindre/créer un groupe

#### Critères d'acceptation

```gherkin
Étant donné un utilisateur qui se connecte pour la première fois via Google OAuth
Quand la session est validée par Supabase Auth avec Google
Alors une entrée profiles(id=auth.users.id) est créée avec created_at et updated_at et un display_name par défaut basé sur le nom Google (ex: prénom du compte Google ou nom complet)
Et l'image_url est initialisé avec l'URL de la photo de profil Google si disponible
```

#### Règles métier

- `profiles.id = auth.users.id`
- Display_name par défaut = `given_name` ou `name` du profil Google
- Avatar par défaut = URL `picture` du profil Google si disponible

#### Cas limites

- Multi-login simultané ⇒ idempotence (conflit ignoré)
- Photo Google indisponible ⇒ image_url reste NULL

---

### A2 — Mettre à jour mon display_name et mon avatar

**En tant que** membre  
**Je veux** modifier mon pseudo et mon avatar  
**Afin de** m'identifier clairement dans le groupe

#### Critères d'acceptation

```gherkin
Étant donné un profil existant avec des données Google par défaut
Quand je change display_name ou image_url
Alors updated_at est rafraîchi et le feed affiche le nouveau nom/avatar
```

#### Règles métier

- **Avatar URL absolue** : `image_url` contient toujours une URL complète
- **Google** : URL directe du profil Google (ex: `https://lh3.googleusercontent.com/...`)
- **Storage personnalisé** : URL signée Supabase Storage (ex: `https://[project].supabase.co/storage/v1/object/sign/...`)
- **Gestion côté app** : Génération d'URL signées pour les avatars Storage
- Possibilité de conserver l'avatar Google ou d'uploader un avatar personnalisé

#### Cas limites

- Nom vide ⇒ refuser, proposer le nom Google précédent
- Avatar Google supprimé ⇒ fallback vers avatar par défaut

---

## EPIC B — Appareils & Notifications

### B1 — Enregistrer mon appareil pour le push

**En tant que** membre  
**Je veux** enregistrer mon token push  
**Afin de** recevoir des notifications

#### Critères d'acceptation

```gherkin
Étant donné un token {platform, token}
Quand je l'envoie
Alors un user_devices est créé/actualisé (unique par token)
```

#### Cas limites

- Même token sur deux comptes ⇒ refuser le second

---

### B2 — Préférences par groupe (mute/push)

**En tant que** membre  
**Je veux** couper le push sur certains groupes  
**Afin de** contrôler mes alertes

#### Critères d'acceptation

```gherkin
Étant donné un groupe G
Quand je mets mute=true
Alors aucune notification push de G ne m'est envoyée

Étant donné un groupe G
Quand je mets push=false
Alors je ne reçois pas de push pour G (aucun autre canal)
```

#### Règles métier

- `user_group_prefs` unique `(user_id, group_id)`

---

### B3 — Notification d'ouverture de manche

**En tant que** membre  
**Je veux** être notifié à l'ouverture  
**Afin de** ne pas rater la manche du jour

#### Critères d'acceptation

```gherkin
Étant donné un daily_round qui passe open
Quand le scheduler l'ouvre
Alors une notification "round_open" est émise pour chaque membre non-mute du groupe si group_settings.notifications_enabled=true
Et si user_group_prefs.push=true alors une notification push est envoyée
Et si user_group_prefs.push=false alors aucune notification n'est envoyée
```

---

## EPIC C — Groupes (création, rôles, invitations)

### C1 — Créer un groupe

**En tant qu'** utilisateur  
**Je veux** créer un groupe avec un nom et une image  
**Afin de** jouer avec mon cercle avec une identité visuelle

#### Critères d'acceptation

```gherkin
Étant donné un utilisateur U
Quand je crée le groupe {name, image_path?}
Alors groups est créé avec owner_id=U, et U est inséré dans group_members avec role='owner'
Et si une image est fournie, elle est stockée dans image_path
```

#### Règles métier

- **Heure française fixe** : Toute l'application fonctionne en heure française (Europe/Paris)
- **Image de profil** facultative lors de la création
- **Formats supportés** : JPEG, PNG, WebP
- **Taille maximale** : 2MB

#### Cas limites

- Format d'image invalide ⇒ refuser l'upload, groupe créé sans image
- Image trop volumineuse ⇒ redimensionnement automatique ou refus

---

### C3 — Définir la préférence d’audience du groupe

**En tant que** owner/admin  
**Je veux** définir/retirer une audience préférée pour mon groupe  
**Afin de** orienter le choix quotidien des prompts (sans bloquer l’ouverture)

#### Critères d'acceptation

```gherkin
Étant donné un groupe G
Quand je choisis une audience dans les réglages
Alors `group_settings.group_audience_tag_id` est défini avec un tag de catégorie `audience`
Et à la sélection quotidienne v1.1, les prompts locaux actifs taggés avec cette audience sont priorisés/filtrés
Et s'il n'y en a aucun, la sélection retombe sur l'ensemble des prompts locaux actifs (fallback)

Étant donné un groupe G avec une audience définie
Quand je supprime la préférence
Alors `group_settings.group_audience_tag_id` passe à NULL et tous les prompts locaux actifs redeviennent éligibles
```

### C4 — Autoriser la banque globale pour la sélection

**En tant que** owner/admin  
**Je veux** choisir si mon groupe peut puiser dans la banque globale  
**Afin de** enrichir la sélection quotidienne lorsque pertinent

#### Critères d'acceptation

```gherkin
Étant donné un groupe G
Quand j'active l'option "Autoriser la banque globale"
Alors `group_settings.allow_global_prompts=true`
Et à l'ouverture, si un prompt global approuvé est retenu comme candidat, un snapshot inline est écrit dans `daily_rounds` (`source_prompt_id`, `resolved_*`) et associé au round
Et les filtres s'appliquent (anti-répétition N=7 via `daily_rounds.source_prompt_id`, min/max_group_size, préférence d'audience, `global_catalog_mode`/policies)

Étant donné un groupe G
Quand je désactive l'option
Alors `group_settings.allow_global_prompts=false` et seuls les prompts locaux (scope='group', owner_group_id=G) restent éligibles
```

## EPIC T — Taxonomie à facettes (classification)

### T1 — Définir les facettes et tags

**En tant que** app creator  
**Je veux** disposer de tags catégorisés par facette  
**Afin de** classer les prompts proprement et guider la curation

#### Critères d'acceptation

```gherkin
Étant donné des facettes prédéfinies
Quand je crée un tag {name, category}
Alors il appartient à l'une des facettes autorisées {audience}
Et “couple” / “friends” sont créés dans la facette audience
Et aucune facette “seasonality/event” n'est disponible
Et la cardinalité par facette est respectée: au plus 1 pour audience
```

### T2 — Tagger un prompt local

**En tant que** owner/admin de groupe  
**Je veux** associer des tags (multi‑facettes) à un prompt local  
**Afin de** faciliter la sélection et le filtrage ultérieurs

#### Critères d'acceptation

```gherkin
Étant donné un prompt local actif
Quand j'ouvre l'édition des tags
Alors je peux sélectionner plusieurs tags de différentes facettes (ex: audience=couple)
Et la sauvegarde garantit l'unicité des liens prompt↔tag
```

### C2 — Gérer le code d'invitation permanent

**En tant qu'** owner/admin  
**Je veux** gérer le code d'invitation du groupe  
**Afin de** contrôler l'accès au groupe

#### Critères d'acceptation

```gherkin
Étant donné un groupe nouvellement créé
Alors un code d'invitation permanent est généré automatiquement (6 caractères alphanumériques)
Et le code est stocké en clair dans groups.join_code

Quand je régénère le code d'invitation
Alors groups.join_code est mis à jour avec le nouveau code
Et l'ancien code devient invalide immédiatement

Quand je désactive les invitations (join_enabled=false)
Alors les tentatives d'utilisation du code échouent
Même si le code correspond à groups.join_code
```

#### Règles métier

- Code permanent sans expiration ni quota d'utilisation
- **Unicité globale** : `UNIQUE` sur `groups.join_code` (pas de collision entre groupes)
- **Normalisation** : Stockage en `UPPER` automatique pour éviter confusion casse
- Stockage direct en clair dans la base de données
- Régénération invalide instantanément l'ancien code

#### Cas limites

- Code compromis ⇒ régénération immédiate recommandée

---

### C3 — Rejoindre via code

**En tant qu'** utilisateur  
**Je veux** rejoindre un groupe avec un code d'invitation  
**Afin de** commencer à jouer

#### Critères d'acceptation

```gherkin
Étant donné un code d'invitation valide (6 caractères alphanumériques)
Et un groupe avec join_enabled=true
Quand je saisis le code
Alors le code est vérifié contre groups.join_code (comparaison directe)
Et j'entre dans group_members avec role='member'
Et je reçois une confirmation de rejointe

Étant donné un code invalide ou un groupe avec join_enabled=false
Quand je tente de rejoindre
Alors l'action échoue avec un message d'erreur générique
```

#### Règles métier

- **Vérification globale** : Recherche du code dans toute la table `groups.join_code` (unicité globale)
- **Comparaison directe** : Match exact du code normalisé (UPPER)
- `join_enabled` doit être true pour accepter les invitations
- Messages d'erreur génériques pour éviter l'énumération

#### Cas limites

- Déjà membre ⇒ message "déjà dans le groupe"
- Code inexistant ⇒ même message que code invalide (sécurité)
- Groupe supprimé ⇒ code automatiquement invalide

---

### C4 — Désactiver les invitations par code

**En tant qu'** owner/admin  
**Je veux** couper l'entrée par code  
**Afin de** fermer le groupe

#### Critères d'acceptation

```gherkin
Quand je mets join_enabled=false
Alors les tentatives de join par code échouent
```

---

### C5 — Promouvoir/rétrograder un admin

**En tant qu'** owner unique  
**Je veux** gérer les rôles admin  
**Afin de** déléguer des responsabilités

#### Critères d'acceptation

```gherkin
Étant donné un membre M
Quand je le promeus admin
Alors role='admin' dans group_members

Quand je rétrograde un admin
Alors role='member' dans group_members
```

#### Règles métier

- Seul l'owner peut promouvoir/rétrograder des admins
- Un groupe peut avoir plusieurs admins

#### Cas limites

- Impossible de se rétrograder soi-même en tant qu'owner

---

### C5.1 — Transférer la propriété (avec acceptation)

**En tant qu'** owner unique  
**Je veux** transférer la propriété avec acceptation du nouveau owner  
**Afin de** changer de propriétaire de manière sécurisée

#### Critères d'acceptation

```gherkin
Étant donné que je suis owner d'un groupe
Quand je propose le transfert de propriété à un membre/admin
Alors une entrée group_ownership_transfers est créée avec status='pending'
Et le destinataire reçoit une notification de demande de transfert

Quand le destinataire accepte le transfert
Alors dans une transaction atomique :
  - Son role devient 'owner' dans group_members
  - Mon role devient 'admin' (ou 'member' selon choix) dans la même transaction
  - group_ownership_transfers.status devient 'accepted'
Et il n'y a jamais d'état transitoire avec 2 owners (contrainte M2 respectée)

Quand le destinataire refuse le transfert
Alors group_ownership_transfers.status devient 'rejected'
Et aucun changement de propriété n'a lieu
```

#### Règles métier

- **Acceptation obligatoire** : Le nouveau owner doit accepter le transfert
- **Transaction atomique** : Promotion nouveau + rétrogradation ancien en une seule opération
- **Un groupe doit avoir exactement 1 owner** à tout moment (jamais d'état transitoire à 2)
- **Le transfert est irréversible** une fois accepté
- **Annulation possible** tant que status='pending'
- **Rollback automatique** : Si la transaction échoue à mi-parcours, aucun changement appliqué

#### Cas limites

- Transfert en attente ⇒ impossible de faire un nouveau transfert
- Destinataire supprime son compte ⇒ transfert automatiquement rejeté
- Owner annule sa demande ⇒ status devient 'rejected'

---

### C6 — Quitter un groupe

**En tant que** membre ou admin  
**Je veux** pouvoir le quitter  
**Afin de** ne plus recevoir d'infos

#### Critères d'acceptation

```gherkin
Quand je quitte en tant que membre ou admin
Alors group_members me supprime

Si je suis l'owner unique
Alors quitter est bloqué jusqu'à ce que je transfère la propriété (avec acceptation) ou supprime le groupe
```

#### Règles métier

- L'owner ne peut pas quitter sans transférer la propriété (avec acceptation)
- Alternative : l'owner peut supprimer le groupe entier

---

### C7 — Modifier le nom et l'image du groupe

**En tant qu'** owner ou admin  
**Je veux** changer le nom et/ou l'image de profil du groupe  
**Afin de** personnaliser l'identité du groupe

#### Critères d'acceptation

```gherkin
Étant donné que je suis owner ou admin du groupe
Quand je modifie le nom du groupe
Alors groups.name est mis à jour
Et updated_at du groupe est rafraîchi

Quand je upload une nouvelle image de profil
Alors image_path est mis à jour avec le nouveau chemin
Et updated_at du groupe est rafraîchi
Et l'ancienne image est supprimée du storage en arrière-plan (si elle existe)

Quand je supprime l'image de profil
Alors image_path devient NULL
Et l'image est supprimée du storage en arrière-plan
```

#### Règles métier

- **Modification du nom** : Nom du groupe modifiable par owner/admin
- **Formats image** : JPEG, PNG, WebP supportés
- **Taille maximale** : 2MB pour les images
- **Redimensionnement automatique** vers plusieurs tailles
- **Suppression en cascade** lors de la suppression du groupe
- **Permissions** : Seuls owner et admins peuvent modifier nom et image

#### Cas limites

- **Nom vide** ⇒ refuser la modification
- **Nom en double** dans les groupes de l'utilisateur ⇒ autoriser (pas d'unicité globale)
- **Upload échoué** ⇒ conserver l'ancienne image
- **Format invalide** ⇒ refuser avec message d'erreur
- **Image corrompue** ⇒ refuser l'upload

---

### C8 — Supprimer un groupe (owner uniquement)

**En tant qu'** owner unique  
**Je veux** supprimer définitivement le groupe  
**Afin de** le fermer sans transférer la propriété

#### Critères d'acceptation

```gherkin
Étant donné que je suis l'owner unique du groupe
Quand je confirme la suppression du groupe
Alors le groupe est supprimé avec ON DELETE CASCADE sur toutes les FK
Et toutes les données liées sont automatiquement supprimées :
  - group_members (membres)
  - group_settings (paramètres)
  - daily_rounds (manches) → et leurs FK (submissions, comments, votes)
  - prompts (catalogue unifié)
  - prompt_suggestions (locales→groupe ou locales→global)
  - group_ownership_transfers (transferts)
  - user_group_prefs (préférences utilisateurs)
  - notifications (notifications liées au groupe)
Et les fichiers Storage sont supprimés en arrière-plan (images, médias)
```

#### Règles métier

- **Seul l'owner** peut supprimer le groupe
- **Action irréversible** avec confirmation obligatoire (double confirmation recommandée)
- **ON DELETE CASCADE** : Toutes les FK vers `groups.id` configurées avec CASCADE
- **Suppression transitive** : Les manches supprimées entraînent la suppression de leurs soumissions, commentaires, votes, etc.
- **Storage asynchrone** : Suppression des fichiers en arrière-plan pour éviter les timeouts

#### Cas limites

- **Rounds actifs en cours** ⇒ avertissement mais suppression autorisée
- **Notification aux membres** avant suppression (optionnel)
- **Échec suppression Storage** ⇒ continuer la suppression du groupe, retry en arrière-plan
- **Transferts en attente** ⇒ automatiquement rejetés lors de la suppression
- **Suggestions vers global** ⇒ conservées avec référence au groupe supprimé (historique)

---

## EPIC D — Réglages de groupe

### D1 — Définir heure d'ouverture automatique (durée fixe 1 jour local)

**En tant qu'** owner/admin  
**Je veux** régler drop_time pour l'ouverture automatique (durée fixe 1 jour local)  
**Afin d'** adapter l'horaire du lancement automatique quotidien

#### Critères d'acceptation

```gherkin
Quand je définis drop_time (ou NULL pour héritage app)
Alors les prochaines manches s'ouvrent automatiquement à cette heure (heure française)
Et chaque manche dure obligatoirement 1 jour local (de drop_time à drop_time+1 jour)
Et le système gère la création/ouverture/fermeture sans intervention
```

#### Règles métier

- **Automatisation complète** : Création, ouverture et fermeture automatiques
- **Durée de manche fixe** : exactement 1 jour local entre ouverture et fermeture
- **Pas de chevauchement** possible entre manches d'un même groupe
- **Création indépendante** : Chaque manche J est créée à J-1, sans dépendance à la fermeture précédente

#### Cas limites

- Modifier drop_time n'affecte pas une manche déjà ouverte
- Le système crée systématiquement une manche pour chaque jour français (invariant J à J-1)

---

### D2 — Activer/désactiver les notifications du groupe

**En tant qu'** owner/admin  
**Je veux** basculer notifications_enabled  
**Afin de** contrôler le bruit

#### Critères d'acceptation

```gherkin
Quand notifications_enabled=false
Alors aucune notif "round_open" n'est émise à l'échelle du groupe (les notifs sociales restent régies par prefs individuels si implémentées)
```

---

## EPIC E — Prompts Hybrides (Global + Local)

### E1 — Accéder à l'interface d'administration globale (app creator uniquement)

**En tant que** créateur de l'app  
**Je veux** accéder à une interface d'administration dédiée  
**Afin de** gérer la banque globale de prompts et superviser le système

#### Critères d'acceptation

```gherkin
Étant donné que je suis le créateur de l'app (email = `APP_CREATOR_EMAIL`)
Quand je me connecte avec mon compte autorisé
Alors j'accède à l'interface d'administration
Et j'ai accès aux sections : banque globale, suggestions, modération
Et aucun autre utilisateur ne peut accéder à cette interface
```

#### Règles métier

- Accès exclusivement réservé au créateur de l'app
- Authentification via Google OAuth avec email vérifié
- Interface séparée de l'expérience utilisateur standard
- Logs d'accès pour traçabilité
- Contrôle d'accès DB via RLS (non seulement côté UI)

#### Notes d'implémentation (RLS)

- Recommandé: mettre `APP_CREATOR_EMAIL` dans une configuration côté DB (ex: GUC `app.app_creator_email`)
- Exemple de politique RLS (comparaison email): `USING ((auth.jwt() ->> 'email') = current_setting('app.app_creator_email', true))`
- Variante sans GUC: exposer `APP_CREATOR_EMAIL` à la DB via un paramètre sécurisé et une fonction `is_app_creator(email text)` (SECURITY DEFINER) qui compare au secret côté serveur

---

### E1.1 — Parcourir et gérer la banque globale (app creator)

**En tant que** créateur de l'app  
**Je veux** parcourir et gérer tous les prompts de la banque globale  
**Afin de** maintenir un catalogue de qualité pour tous les groupes

#### Critères d'acceptation

```gherkin
Étant donné que je suis dans l'interface d'admin
Quand j'accède à la section "Banque globale"
Alors je vois tous les prompts globaux (tous statuts confondus)
Et je peux filtrer par statut, type, tags, date de création
Et je peux créer, éditer, approuver, rejeter, archiver chaque prompt
Et je peux prévisualiser chaque prompt avant publication
```

#### Règles métier

- Vue complète de tous les prompts (pending, approved, rejected, archived)
- Actions de modération : approve, reject, edit, archive

#### Cas limites

- Prompt utilisé dans des rounds actifs ⇒ avertissement avant suppression
- Modification d'un prompt approuvé ⇒ repasse en pending

---

### E2 — Parcourir et gérer la banque locale du groupe (owner/admin)

**En tant que** owner/admin de groupe  
**Je veux** accéder à l'interface de gestion des prompts locaux de mon groupe  
**Afin de** voir, organiser et gérer tous les prompts disponibles pour mon groupe

#### Critères d'acceptation

```gherkin
Étant donné que je suis owner/admin d'un groupe
Quand j'accède à "Gestion des prompts locaux"
Alors je vois tous les prompts locaux de mon groupe (actifs et inactifs)
Et je peux filtrer par type, statut, date de création
Et je peux activer/désactiver chaque prompt pour la sélection automatique
Et je peux éditer, dupliquer ou supprimer les prompts locaux
Et seuls les owners/admins du groupe ont accès à cette interface
```

#### Règles métier

- Interface dédiée aux owners/admins du groupe uniquement
- Vue complète des prompts locaux du groupe
- Actions : créer, éditer, activer/désactiver, supprimer
- Aucun accès à la banque globale depuis cette interface

---

### E2.1 — Créer un prompt local original

**En tant que** owner/admin de groupe  
**Je veux** créer un prompt spécifique à mon groupe  
**Afin de** personnaliser l'expérience (événements privés, blagues internes, langue locale)

#### Critères d'acceptation

```gherkin
Étant donné que je suis owner/admin d'un groupe
Quand je crée un nouveau prompt local depuis "Gestion des prompts locaux"
Alors un prompt est créé dans `prompts` avec `scope='group'` et `owner_group_id=G`
Et il est immédiatement actif (is_active=true) pour mon groupe
Et je peux définir type, titre, corps, tags, métadonnées
Et il n'apparaît que dans mon groupe (pas de modération globale)
Et il devient disponible pour la sélection automatique quotidienne
```

#### Règles métier

- Création directe sans validation (liberté locale)
- Visible uniquement dans le groupe créateur
- Activé par défaut à la création
- Possibilité de suggestion vers banque globale plus tard

---

### E3 — Suggérer un prompt vers la banque locale du groupe

**En tant que** membre de groupe  
**Je veux** proposer un nouveau prompt pour la banque locale de mon groupe  
**Afin d'** enrichir la collection de prompts du groupe

#### Critères d'acceptation

```gherkin
Étant donné que je suis membre d'un groupe
Quand je soumets une suggestion de prompt local
Alors elle est créée avec status='pending' dans `prompt_suggestions` avec `target_scope='group'` et `target_group_id=G`
Et les owners/admins du groupe reçoivent une notification
Et je peux voir le statut de ma suggestion dans mes propositions
```

#### Règles métier

- Tout membre peut suggérer des prompts locaux
- Modération par les owners/admins du groupe uniquement
- Statuts possibles : pending/approved/rejected

---

### E4 — Suggérer un prompt local vers la banque globale

**En tant que** membre de groupe  
**Je veux** proposer qu'un prompt local réussi soit ajouté à la banque globale  
**Afin de** partager une bonne idée avec toute la communauté

#### Critères d'acceptation

```gherkin
Étant donné un prompt local réussi dans mon groupe
Quand je clique "Suggérer pour la banque globale"
Alors une entrée est créée dans `prompt_suggestions` avec `target_scope='global'` et `target_group_id=NULL`, status='pending'
Et le créateur de l'app reçoit une notification
Et je peux ajouter un commentaire expliquant pourquoi ce prompt est intéressant
Et je peux voir le statut de ma suggestion
```

#### Règles métier

- Tout membre peut suggérer (pas seulement owner/admin)
- Possibilité de retirer sa suggestion avant traitement
- Historique des suggestions par utilisateur

---

### E5 — Modérer les suggestions locales (owner/admin)

**En tant qu'** owner/admin de groupe  
**Je veux** examiner et traiter les suggestions de prompts pour mon groupe  
**Afin de** enrichir ma banque locale avec les meilleures propositions

#### Critères d'acceptation

```gherkin
Étant donné des suggestions de prompts locaux avec status='pending'
Quand j'accède à l'interface de modération du groupe
Alors je vois toutes les suggestions en attente pour mon groupe
Et je peux approuver (crée un group_prompt), rejeter avec feedback
Et le suggéreur reçoit une notification du résultat
Et si approuvé, le prompt devient disponible dans ma banque locale
```

#### Règles métier

- Accès limité aux owners/admins du groupe
- Modération décentralisée par groupe
- Feedback optionnel mais recommandé

---

### E6 — Modérer les suggestions globales (app creator)

**En tant que** créateur de l'app  
**Je veux** examiner et traiter les suggestions de prompts locaux  
**Afin de** enrichir la banque globale avec les meilleures contributions

#### Critères d'acceptation

```gherkin
Étant donné une suggestion de prompt avec status='pending'
Quand je l'examine dans l'interface d'admin
Alors je vois le prompt original et le commentaire du suggéreur
Et je peux approuver (crée un global_prompt), rejeter avec feedback, ou demander modifications
Et le suggéreur reçoit une notification du résultat
Et si approuvé, le prompt devient disponible dans la banque globale
```

---

## EPIC F — Cycle de vie d'une manche (round)

### F1 — Créer automatiquement les manches quotidiennes

**En tant que** système  
**Je veux** créer automatiquement une nouvelle manche pour chaque jour local  
**Afin de** maintenir un rythme quotidien sans intervention humaine

#### Critères d'acceptation

```gherkin
Quand il est temps de créer la manche pour le jour J (à J-1)
Alors créer automatiquement daily_rounds avec status='scheduled' et scheduled_for_local_date=J
Et sélectionner aléatoirement un prompt local approuvé (`prompts.scope='group'` et `owner_group_id=G`)
Et éviter les 7 derniers prompts utilisés par le groupe (fenêtre anti-répétition)
Et programmer l'ouverture selon drop_time du groupe (heure française)
Et s'il n'existe pas encore de daily_round pour (group_id, scheduled_for_local_date=J)
Et si aucun prompt local actif n'est disponible, ignorer progressivement la fenêtre anti‑répétition (jusqu'à 0) pour garantir une sélection
Et s'il n'existe toujours aucun prompt éligible, créer le round sans snapshot et ne pas envoyer de notification tant que le snapshot n'est pas créé
```

#### Règles métier

- **Création automatique** : Pas d'intervention humaine nécessaire
- **Invariant simple** : Création d'un round pour le jour J à J-1, à l'heure drop_time
- **Une seule manche par jour local** par groupe : UNIQUE(group_id, scheduled_for_local_date)
- **Sélection intelligente** des prompts avec rotation (N=7 derniers exclus, paramétrable)
- **Fallback défini** : si aucun prompt éligible, la fenêtre anti‑répétition est réduite; si 0 prompt, le round est créé sans snapshot et l'ouverture est différée jusqu'à création du snapshot

---

### F2 — Ouvrir la manche

**En tant que** système  
**Je veux** passer le round à open à l'heure locale  
**Afin de** lancer la participation

#### Critères d'acceptation

```gherkin
Quand now() >= open_at & status='scheduled'
Alors status='open' et notif "round_open" (si autorisée)

Quand now() >= open_at & status='scheduled' & snapshot absent (champs `resolved_*` non renseignés)
Alors l'ouverture est différée et aucune notification n'est émise tant qu'aucun prompt n'est activé pour ce round
```

---

### F3 — Fermer la manche (après exactement 1 jour local)

**En tant que** système  
**Je veux** passer open → closed après exactement 1 jour local  
**Afin de** figer la manche et permettre la suivante

#### Critères d'acceptation

```gherkin
Quand now() >= close_at & status='open'
Alors status='closed'
Et cela indépendamment du nombre de participants (0, quelques-uns, ou tous)
Et la prochaine manche peut être planifiée pour ce groupe
```

#### Règles métier

- **Fermeture automatique** après exactement 1 jour local d'ouverture
- **Idempotent** (pas de double fermeture)
- **Les soumissions, votes et commentaires sont figés**
- **Pas de prolongation** même si peu de participation
- **Durée fixe** : toujours 1 jour local, gestion correcte du DST

---

## EPIC G — Soumissions

> **Principe** : 1 soumission par user & par manche. **Visibilité conditionnelle individuelle** : chaque utilisateur voit toutes les soumissions uniquement après avoir participé (soumission OU vote). **Soumissions définitives pour l'auteur** : pas d'édition ni suppression après création par l'auteur, mais modération admin possible (soft delete).

### G1 — Créer une soumission (1 par user)

**En tant que** membre  
**Je veux** répondre au prompt  
**Afin de** participer

#### Critères d'acceptation

```gherkin
Étant donné un round open
Quand je poste ma soumission
Alors submissions est créé avec (round_id, author_id) unique
Et toutes les soumissions du round (y compris la mienne) deviennent visibles pour moi
Et les autres membres ne verront ma soumission qu'après avoir soumis leur propre réponse
Et je ne peux plus créer d'autre soumission pour ce round
```

#### Règles métier

- **Visibilité conditionnelle individuelle** : Chaque utilisateur voit toutes les soumissions uniquement après avoir participé (soumission OU vote)
- **Soumission définitive pour l'auteur** : Pas d'édition ni suppression possible après création par l'auteur
- **Modération admin possible** : Owner/admin peuvent effectuer un soft delete (`deleted_by_admin`, `deleted_at`)
- **Une seule soumission** par utilisateur par round : `UNIQUE(round_id, author_id)`
- **Implémentation RLS** : Row Level Security Supabase pour gating automatique

#### Cas limites

- Tentative 2e soumission ⇒ rejet avec message explicite
- Round fermé ⇒ création impossible

---

### G1.1 — Implémenter la visibilité conditionnelle via RLS

**En tant que** système  
**Je veux** utiliser Row Level Security pour contrôler la visibilité des interactions  
**Afin d'** automatiser le gating "je ne vois rien tant que je n'ai pas soumis"

#### Critères d'acceptation

```gherkin
Étant donné un utilisateur qui n'a pas encore participé dans un round ouvert
Quand il tente de consulter les soumissions/commentaires/votes
Alors les requêtes SELECT retournent des résultats vides (RLS bloque)

Étant donné un utilisateur qui a participé dans un round ouvert (soumission OU vote)
Quand il consulte les interactions du round
Alors il voit toutes les soumissions, commentaires et votes

Étant donné un round fermé (status='closed')
Quand n'importe quel membre du groupe consulte les interactions
Alors tout est visible (pas de restriction RLS)

Étant donné un round type='vote' ouvert
Quand je vote sans avoir soumis de soumission
Alors je vois toutes les interactions du round (vote = participation)
```

#### Règles métier

- **RLS activé** sur `submissions`, `comments`, `round_votes`
- **Condition de visibilité unifiée** : `round.status='closed'` OU `user_has_participated(round_id, auth.uid())`
- **Participation définie comme** : `EXISTS(ma_soumission)` OU `EXISTS(mon_vote)`
- **Performances** : Index sur `(round_id, author_id)` et `(round_id, voter_id)` pour les requêtes RLS
- **Cohérence** : Même logique RLS pour toutes les tables d'interactions

#### Cas limites

- **Pas de participation** dans le round ⇒ aucune interaction visible
- **Round fermé** ⇒ tout devient visible immédiatement
- **Suppression admin de ma soumission/vote** ⇒ les interactions restent visibles (participation conservée)

---

## EPIC H — Médias (images/vidéos/audio/fichiers)

### H1 — Joindre un média à ma soumission

**En tant que** membre  
**Je veux** ajouter une image/vidéo/audio  
**Afin d'** enrichir ma réponse

#### Critères d'acceptation

```gherkin
Quand j'upload
Alors submission_media est créé {submission_id, storage_path, kind}
```

#### Règles métier

- `kind ∈ {image,video,audio,file}`
- **Formats & tailles**
  - image: `image/jpeg`, `image/png`, `image/webp` (max 5MB)
  - video: `video/mp4` H.264/AAC (max 25MB)
  - audio: `audio/mpeg` (mp3), `audio/mp4` (m4a/aac) (max 10MB)
  - file: `application/pdf` (max 10MB) — optionnel v1
- **Contrôles**: validation MIME côté serveur + redimensionnement/optimisation image
- **Différence avatars**: les images d'avatar de groupe restent limitées à 2MB

#### Cas limites

- Taille/format invalides ⇒ refus

---

### H2 — Voir les médias in-app

**En tant que** membre  
**Je veux** prévisualiser les médias  
**Afin de** consommer le feed sans friction

#### Critères d'acceptation

```gherkin
Quand je consulte un post
Alors les médias s'affichent avec lecteurs/miniatures adaptés
```

---

## EPIC I — Commentaires

> **Principe** : Tout le contenu du round (soumissions, discussion, votes) est visible uniquement après avoir participé (soumission OU vote). Les commentaires sont liés au round (question) et non aux soumissions individuelles. Chaque utilisateur accède au contenu complet individuellement après sa participation.

### I1 — Commenter sur la question du jour

**En tant que** membre  
**Je veux** commenter globalement sur la question du jour  
**Afin de** participer à la discussion collective du groupe

#### Critères d'acceptation

```gherkin
Étant donné un round ouvert et que j'ai participé (soumission OU vote)
Quand je publie un commentaire sur la question du jour
Alors comments {round_id, author_id, body} est créé
Et le commentaire apparaît dans la discussion globale sous la question
Et tous les membres ayant participé (soumission OU vote) peuvent le voir
```

#### Règles métier

- **Visibilité conditionnelle individuelle** : Chaque utilisateur voit la discussion uniquement après avoir participé (soumission OU vote)
- Discussion globale commune à tous les membres ayant participé
- Commentaires visibles immédiatement après publication (pour ceux qui ont participé)
- Ordre chronologique d'affichage

#### Cas limites

- Non-membre du groupe ⇒ refus
- Pas encore participé (soumission OU vote) ⇒ discussion globale masquée

---

### I2 — Éditer/supprimer mon commentaire avant fermeture

**En tant que** membre  
**Je veux** corriger ou retirer mon commentaire  
**Afin de** gérer mon contenu dans la discussion globale

#### Critères d'acceptation

```gherkin
Étant donné un commentaire que j'ai publié sur un round ouvert
Quand j'édite mon commentaire
Alors updated_at est mis à jour et le commentaire modifié apparaît dans la discussion

Quand je supprime mon commentaire avant fermeture du round
Alors le commentaire disparaît de la discussion globale
Et les autres membres ne le voient plus

Étant donné un commentaire sur un round fermé (status='closed')
Quand je tente d'éditer le commentaire en tant qu'auteur
Alors l'opération échoue avec "Cannot modify comments after round is closed"
Et le trigger DB bloque la modification

Quand je tente de supprimer le commentaire en tant qu'auteur
Alors l'opération échoue avec "Cannot delete comments after round is closed"
Et seuls les owner/admin peuvent effectuer un soft delete
```

#### Règles métier

- **Contrôle temporel DB** : Triggers `BEFORE UPDATE/DELETE` sur `comments` avec exceptions pour modération admin
- **Auteur** : peut éditer/supprimer avant fermeture uniquement (contrôle applicatif + RLS)
- **Owner/Admin** : peut effectuer soft delete après fermeture (`deleted_by_admin`, `deleted_at`)
- **Ordre chronologique** préservé après édition
- **Intégrité garantie** : Impossible de contourner les restrictions côté client

---

### I2.1 — Implémenter les triggers de contrôle temporel

**En tant que** système  
**Je veux** utiliser des triggers DB pour empêcher la modification des commentaires après fermeture  
**Afin de** garantir l'intégrité temporelle au niveau base de données

#### Critères d'acceptation

```gherkin
Étant donné un trigger BEFORE UPDATE sur comments
Quand une tentative d'UPDATE est faite sur un commentaire d'un round fermé
Et que ce n'est PAS un soft delete admin (deleted_by_admin: NULL → NOT NULL)
Alors le trigger lève une exception "Cannot modify comments after round is closed"
Et la transaction est annulée

Étant donné un trigger BEFORE UPDATE sur comments pour soft delete admin
Quand deleted_by_admin passe de NULL à NOT NULL et deleted_at est défini
Alors le trigger autorise l'opération (modération admin)

Étant donné un trigger BEFORE DELETE sur comments
Quand une tentative de DELETE physique est faite sur un commentaire d'un round fermé
Alors le trigger lève une exception "Use soft delete for moderation after round closure"
Et la suppression physique est bloquée

Étant donné un round ouvert (status='open' ou 'scheduled')
Quand je modifie ou supprime un commentaire
Alors l'opération réussit normalement (trigger OK)
```

#### Règles métier

- **Fonction trigger** : `check_comment_modification_allowed()` avec logique soft delete
- **Vérification** : `daily_rounds.status = 'closed'` + détection soft delete admin
- **Exception admin** : `deleted_by_admin: NULL → NOT NULL` + `deleted_at` défini = autorisé
- **Messages d'erreur** : Explicites pour l'application (modification vs soft delete)
- **Performance** : Index sur `daily_rounds(id, status)` pour les triggers

#### Cas limites

- **Round en transition** : Si le round passe à 'closed' pendant l'édition, le trigger bloque
- **Commentaire orphelin** : Si `round_id` invalide, laisser l'opération échouer sur FK
- **Transactions simultanées** : Le trigger est thread-safe (isolation SQL)

---

## EPIC K — Votes (prompts type "vote")

> **Principe** : 1 vote par user & par manche pour les prompts de type "vote". **Votes définitifs** : impossible de modifier son vote une fois effectué. **Auto-vote autorisé** (on peut voter pour soi-même).

### K1 — Voter une fois par manche (vote définitif)

**En tant que** membre  
**Je veux** voter une seule fois de manière définitive  
**Afin d'** exprimer mon choix sans possibilité de modification

#### Critères d'acceptation

```gherkin
Étant donné un round open de type vote
Quand je vote {target_user_id, reason?}
Alors round_votes (round_id, voter_id) est créé avec UNIQUE
Et le trigger vérifie que target_user_id appartient au groupe
Et je ne peux plus voter ni modifier mon vote pour ce round
Et target_user_id peut être égal à voter_id (auto-vote autorisé)

Étant donné un vote existant
Quand je tente de modifier ou supprimer mon vote
Alors l'opération échoue avec "Votes are definitive and cannot be modified or deleted"
Et le trigger DB bloque UPDATE/DELETE

Étant donné un target_user_id qui n'appartient pas au groupe
Quand je tente de voter pour cet utilisateur
Alors l'opération échoue avec "Target user must be an active member of the round group"
Et le trigger d'intégrité bloque l'insertion
```

#### Règles métier

- **Intégrité DB** : Trigger `BEFORE INSERT` vérifie `target_user_id ∈ group_members(active)`
- **Vote définitif** : Triggers `BEFORE UPDATE/DELETE` bloquent toute modification
- **Auto-vote autorisé** : `voter_id` peut être égal à `target_user_id`
- **Un seul vote** : Contrainte `UNIQUE(round_id, voter_id)`
- **Performance** : Index sur `group_members(group_id, user_id, status)` pour triggers

#### Cas limites

- **Tentative de second vote** ⇒ Erreur UNIQUE constraint
- **Auto-vote autorisé** (voter pour soi-même)
- **Non-membre comme target** ⇒ Trigger d'intégrité bloque
- **Modification impossible** ⇒ Trigger définitif bloque

---

### K1.1 — Implémenter les triggers de contrôle des votes

**En tant que** système  
**Je veux** utiliser des triggers DB pour garantir l'intégrité et le caractère définitif des votes  
**Afin d'** empêcher les votes invalides et les modifications a posteriori

#### Critères d'acceptation

```gherkin
Étant donné un trigger BEFORE INSERT sur round_votes
Quand une insertion est tentée avec target_user_id hors du groupe
Alors le trigger lève "Target user must be an active member of the round group"
Et l'insertion est bloquée

Étant donné un trigger BEFORE UPDATE sur round_votes
Quand une tentative de modification d'un vote existant est faite
Alors le trigger lève "Votes are definitive and cannot be modified or deleted"
Et la modification est bloquée

Étant donné un trigger BEFORE DELETE sur round_votes
Quand une tentative de suppression d'un vote est faite
Alors le trigger lève "Votes are definitive and cannot be modified or deleted"
Et la suppression est bloquée

Étant donné un target_user_id appartenant au groupe (status='active')
Quand j'insère un vote valide
Alors l'opération réussit normalement (trigger d'intégrité OK)
```

#### Règles métier

- **Fonction d'intégrité** : `check_vote_integrity()` vérifie l'appartenance au groupe
- **Fonction définitive** : `prevent_vote_modification()` bloque UPDATE/DELETE
- **Jointure performante** : `daily_rounds ⋈ group_members` pour validation
- **Statut actif** : Seuls les membres `status='active'` sont des targets valides

#### Cas limites

- **Membre inactif comme target** : Le trigger bloque (seuls les actifs acceptés)
- **Round invalide** : FK constraint échoue avant le trigger
- **Votes simultanés** : UNIQUE constraint + triggers thread-safe
- **Performance** : Index recommandé sur `group_members(group_id, user_id, status)`

---

## EPIC M — Intégrité & Accès

> **Principe** : Contrôles d'intégrité au niveau base de données pour empêcher les actions hors groupe et maintenir la cohérence des rôles.

### M1 — Empêcher les actions hors groupe

**En tant que** système  
**Je veux** empêcher soumissions/commentaires/votes d'utilisateurs non-membres  
**Afin de** garantir que seuls les membres actifs du groupe peuvent participer

#### Critères d'acceptation

```gherkin
Étant donné un utilisateur non-membre d'un groupe
Quand il tente de soumettre une réponse à un round de ce groupe
Alors l'opération échoue avec "User must be an active member of the round group"
Et le trigger/RLS bloque l'insertion

Étant donné un utilisateur non-membre d'un groupe
Quand il tente de commenter sur un round de ce groupe
Alors l'opération échoue avec "User must be an active member of the round group"
Et le trigger/RLS bloque l'insertion

Étant donné un membre actif du groupe
Quand il soumet/commente sur un round de son groupe
Alors l'opération réussit normalement (trigger/RLS OK)

Étant donné un membre inactif (status!='active')
Quand il tente une action sur un round du groupe
Alors l'opération échoue (seuls les membres actifs autorisés)
```

#### Règles métier

- **Contrainte croisée** : `daily_rounds.group_id ⋈ group_members.group_id` pour validation
- **Statut actif requis** : Seuls les membres `status='active'` peuvent agir
- **Double implémentation** : Triggers `BEFORE INSERT` + Politiques RLS `WITH CHECK`
- **Performance** : Index sur `group_members(group_id, user_id, status)` pour jointures
- **Cohérence** : `round_votes` utilise déjà `check_vote_integrity()` (pas de doublon)

#### Cas limites

- **Membre désactivé** : Perte d'accès immédiate aux nouvelles actions
- **Round orphelin** : FK constraint échoue avant le trigger
- **Transactions simultanées** : Triggers thread-safe avec isolation SQL

---

### M1.1 — Implémenter les contrôles d'appartenance au groupe

**En tant que** système  
**Je veux** utiliser triggers/RLS pour valider l'appartenance au groupe  
**Afin d'** empêcher les actions cross-groupe au niveau base de données

#### Critères d'acceptation

```gherkin
Étant donné un trigger BEFORE INSERT sur submissions
Quand une insertion est tentée par un non-membre du groupe
Alors le trigger lève "User must be an active member of the round group"
Et l'insertion est bloquée

Étant donné une politique RLS sur comments
Quand auth.uid() n'est pas membre actif du groupe du round
Alors la politique WITH CHECK échoue
Et l'insertion est refusée

Étant donné un membre actif du groupe
Quand il insère une soumission/commentaire valide
Alors les contrôles passent (trigger + RLS OK)
```

#### Règles métier

- **Fonction réutilisable** : `check_group_membership()` pour submissions + comments
- **Jointure optimisée** : `daily_rounds ⋈ group_members` avec index
- **Alternative RLS** : Politiques `FOR INSERT WITH CHECK` pour Supabase
- **Cohérence auth** : `auth.uid()` dans RLS vs `NEW.author_id` dans triggers

#### Cas limites

- **Performance** : Index composite recommandé sur `(group_id, user_id, status)`
- **Isolation** : Triggers compatibles avec transactions concurrentes
- **Debugging** : Messages d'erreur explicites pour le frontend

---

### M2 — Owner unique et toujours membre

**En tant que** système  
**Je veux** garantir qu'il y a exactement 1 owner actif par groupe  
**Afin de** maintenir la gouvernance et éviter les groupes sans propriétaire

#### Critères d'acceptation

```gherkin
Étant donné un groupe avec 1 owner actif
Quand je tente d'ajouter un second owner actif
Alors l'opération échoue avec violation d'index partiel unique
Et il reste exactement 1 owner

Étant donné le dernier owner actif d'un groupe
Quand je tente de le supprimer ou désactiver
Alors l'opération échoue avec "Cannot remove the last active owner of the group"
Et le trigger maintient l'owner en place

Étant donné un transfert de propriété en cours d'acceptation
Quand la transaction atomique s'exécute (nouveau owner + ancien rétrogradé)
Alors l'opération réussit en une seule fois (toujours exactement 1 owner actif)

Étant donné un owner qui quitte le groupe (DELETE)
Quand il y a d'autres owners actifs dans le groupe
Alors la suppression réussit (pas le dernier owner)
```

#### Règles métier

- **Index partiel unique** : `group_members(group_id) WHERE role='owner' AND status='active'`
- **Trigger de protection** : `BEFORE UPDATE/DELETE` vérifie la présence d'autres owners
- **Transfert sécurisé** : Processus en 2 étapes (ajout nouveau → suppression ancien)
- **Cohérence garantie** : Impossible d'avoir 0 owner actif par groupe

#### Cas limites

- **Transfert simultané** : Index unique empêche les doublons temporaires
- **Suppression cascade** : Si le groupe est supprimé, pas de vérification owner
- **Désactivation membre** : Trigger vérifie avant perte du rôle owner
- **Performance** : Index partiel léger (seulement owners actifs)

---

### M2.1 — Implémenter l'index partiel et trigger owner

**En tant que** système  
**Je veux** utiliser un index partiel unique et un trigger de protection  
**Afin de** garantir l'unicité et la permanence de l'owner au niveau DB

#### Critères d'acceptation

```gherkin
Étant donné un index partiel sur group_members(group_id) WHERE role='owner' AND status='active'
Quand une insertion viole l'unicité de l'owner
Alors PostgreSQL lève une erreur de contrainte unique
Et l'insertion échoue

Étant donné un trigger BEFORE UPDATE/DELETE sur group_members
Quand une modification supprime le dernier owner actif
Alors le trigger lève "Cannot remove the last active owner of the group"
Et la modification est annulée

Étant donné une modification qui ne touche pas le dernier owner
Quand l'opération UPDATE/DELETE est effectuée
Alors le trigger laisse passer (pas de blocage)
```

#### Règles métier

- **Index partiel performant** : Seulement sur `(group_id)` pour `role='owner' AND status='active'`
- **Fonction trigger** : `ensure_owner_presence()` vérifie les autres owners actifs
- **Transaction atomique** : UPDATE multi-lignes sans état transitoire à 2 owners
- **Protection UPDATE** : Si `OLD.role='owner'` et `NEW.role!='owner'` ou `NEW.status!='active'`
- **Protection DELETE** : Si `OLD.role='owner' AND OLD.status='active'`

#### Cas limites

- **Performance** : Index partiel très léger (peu d'owners par rapport aux membres)
- **Concurrence** : Index unique thread-safe pour les transferts simultanés
- **Maintenance** : Index se met à jour automatiquement avec les changements de statut

---

## EPIC L — Consultation des résultats

### L1 — Consulter une manche fermée

**En tant que** membre  
**Je veux** voir le contenu d'une manche fermée  
**Afin de** revoir les contributions et interactions

#### Critères d'acceptation

```gherkin
Quand j'ouvre une manche avec status='closed'
Alors je vois le prompt, toutes les soumissions, commentaires et votes
Et je peux seulement consulter le contenu (lecture seule)
```

#### Règles métier

- Aucune interaction possible (soumissions, commentaires, votes figés)
- Mode lecture seule uniquement
- Affichage chronologique des contributions

---

### L2 — Visibilité conditionnelle des interactions

**En tant que** membre  
**Je veux** voir les interactions seulement après avoir participé  
**Afin de** préserver l'authenticité de ma propre réponse

#### Critères d'acceptation

```gherkin
Étant donné un round open et que je n'ai pas encore participé (soumission OU vote)
Quand j'ouvre la manche
Alors je vois uniquement le prompt et le formulaire de soumission
Et je ne vois aucune soumission, commentaire ou vote d'autres membres

Étant donné un round open et que j'ai participé (soumission OU vote)
Quand j'ouvre la manche
Alors je vois toutes les soumissions, commentaires et votes
Et je peux interagir (commenter, voter si applicable)
```

#### Règles métier

- Les interactions ne sont visibles qu'après avoir participé (soumission OU vote)
- Une fois la réponse soumise, toutes les interactions deviennent visibles instantanément
- Cette règle s'applique à tous les types de prompts (question, vote, challenge)

#### Cas limites

- Les soumissions sont définitives pour l'auteur et ne peuvent pas être modifiées/supprimées par lui
- La modération admin reste possible via soft delete (masquage)

---

## EPIC N — Planificateur (heure française)

### N1 — Calcul d'open_at/close_at en heure française

**En tant que** système  
**Je veux** planifier à l'heure française  
**Afin de** maintenir la simplicité de l'application

#### Critères d'acceptation

```gherkin
Quand drop_time est connu
Alors open_at/close_at sont calculés en UTC pour le jour scheduled_for_local_date en utilisant le fuseau Europe/Paris
```

---

### N2 — Idempotence des jobs

**En tant que** système  
**Je veux** éviter les doublons  
**Afin de** rester fiable

#### Critères d'acceptation

```gherkin
Quand le cron passe plusieurs fois sur la même fenêtre
Alors un round n'est ouvert/fermé qu'une fois (contrôles de status + clé unique)
```

---

## EPIC O — Feed & Navigation

### O1 — Voir le feed par jours avec image du groupe

**En tant que** membre  
**Je veux** un feed par round (Aujourd'hui, J-1, J-2…) avec l'image du groupe  
**Afin de** m'y retrouver visuellement

#### Critères d'acceptation

```gherkin
Quand j'ouvre l'app
Alors je vois un feed qui agrège les rounds des groupes dont je suis membre, triés par date (open_at) et regroupés par jour
Et chaque round affiche l'image du groupe (ou une image par défaut si aucune)
Et l'image du groupe est cliquable pour accéder aux détails du groupe
Et je peux filtrer le feed par groupe pour ne voir que ses rounds
```

#### Règles métier

- Image redimensionnée automatiquement pour l'affichage (thumbnail)
- Image par défaut si image_path est NULL (groupes utilisent Storage paths)
- Cache des images pour optimiser les performances
- Agrégation multi‑groupes par défaut, avec filtre par groupe disponible

---

### O2 — Voir ma contribution et mes interactions

**En tant que** membre  
**Je veux** retrouver ce que j'ai posté/réagi/voté  
**Afin de** suivre mon activité

#### Critères d'acceptation

```gherkin
Quand j'ouvre "Mon activité"
Alors je vois mes soumissions, commentaires et votes par manche
Et je peux filtrer par type d'activité ou par période
```

#### Règles métier

- Affichage chronologique des contributions
- Accès direct aux manches concernées
- Statistiques simples (nombre de participations)

---

## EPIC P — Actions d'admin simples (sans système de modération dédié)

### P1 — Supprimer une soumission du groupe (owner/admin)

**En tant qu'** owner/admin  
**Je veux** retirer une soumission inappropriée  
**Afin de** maintenir un cadre sain dans le groupe

#### Critères d'acceptation

```gherkin
Étant donné une soumission dans un round de mon groupe
Quand je la supprime en tant qu'owner/admin
Alors la soumission est marquée comme supprimée (soft delete)
Et deleted_by_admin et deleted_at sont définis
Et la soumission disparaît de l'affichage pour tous les membres
Et cette action est possible même après fermeture du round

Étant donné un round ouvert
Quand je supprime une soumission en tant qu'owner/admin
Alors la soumission est marquée comme supprimée (soft delete uniquement)
Et les médias liés sont marqués comme supprimés en cascade
```

#### Règles métier

- **Soft delete uniquement** : En toute circonstance (cohérence et traçabilité)
- **Jamais de suppression physique** : Évite les problèmes de FK et conserve l'historique
- **Traçabilité** : `deleted_by_admin` conserve l'ID du modérateur
- **Permissions** : Seuls owner/admin du groupe peuvent modérer
- **Médias liés** : Soft delete en cascade (conservés mais masqués)

#### Cas limites

- Suppression pendant open ⇒ aucun recalcul de votes (les votes portent sur `target_user_id`, pas sur la soumission). L'affichage masque simplement la soumission et ses médias.

---

### P2 — Supprimer un commentaire du groupe (owner/admin)

**En tant qu'** owner/admin  
**Je veux** retirer un commentaire inapproprié  
**Afin de** maintenir un cadre sain dans la discussion

#### Critères d'acceptation

```gherkin
Étant donné un commentaire dans un round de mon groupe
Quand je le supprime en tant qu'owner/admin
Alors le commentaire est marqué comme supprimé (soft delete)
Et deleted_by_admin et deleted_at sont définis
Et le commentaire disparaît de l'affichage pour tous les membres
Et cette action est possible même après fermeture du round

Étant donné un round ouvert
Quand je supprime un commentaire en tant qu'owner/admin
Alors le commentaire est marqué comme supprimé (soft delete uniquement)
```

#### Règles métier

- **Soft delete uniquement** : En toute circonstance (cohérence avec les soumissions)
- **Jamais de suppression physique** : Évite les problèmes de FK et conserve l'historique
- **Traçabilité** : `deleted_by_admin` conserve l'ID du modérateur
- **Permissions** : Seuls owner/admin du groupe peuvent modérer

---

## EPIC R — Confidentialité & Données

### R1 — Quitter un groupe et couper les notifications

**En tant qu'** utilisateur  
**Je veux** ne plus recevoir de notifications push d'un groupe quitté  
**Afin de** préserver mon calme

#### Critères d'acceptation

```gherkin
Quand je quitte G
Alors aucune notification push de G ne m'est adressée
Et les envois "round_open" pour G ne me ciblent plus
```

---

## EPIC S — Résilience & Erreurs

### S1 — Messages d'erreur clairs

**En tant qu'** utilisateur  
**Je veux** comprendre pourquoi une action échoue  
**Afin de** corriger

#### Critères d'acceptation

```gherkin
Quand une contrainte (ex: 2e soumission) échoue
Alors un message contextuel indique la règle (ex: "Une seule soumission par manche")
```

---

### S2 — Tolérance réseau

**En tant qu'** utilisateur  
**Je veux** que mes actions reprennent après coupure  
**Afin de** ne rien perdre

#### Critères d'acceptation

```gherkin
Quand l'upload échoue
Alors reprise possible ou relance simple (upload idempotent)
```

---

## Notes de conception transverses

### Principes généraux

- **Visibilité conditionnelle** : Les soumissions et interactions ne sont visibles qu'après avoir participé (soumission OU vote)
- **Aucun leaderboard/stats cumulées** : Pas de système de scoring ou de classement
- **Consultation en lecture seule** : Les manches fermées restent consultables sans possibilité d'interaction
- **Pas de modération structurée** : Pas de tables de report/log, seulement suppression par owner/admin

### Contraintes d'unicité

- **1 round/jour/groupe** : Clé unique `(group_id, scheduled_for_local_date)`
- **1 soumission/user/round** : Clé unique `(round_id, author_id)`
- **1 vote/user/round** : Clé unique `(round_id, voter_id)`
- **Réactions typées uniques** : Par type/user/entité

### Architecture technique

- **Base de données** : PostgreSQL avec Supabase
- **Authentification** : Supabase Auth avec Google OAuth uniquement
- **Stockage** : Supabase Storage pour les médias
- **Notifications push** : Système de tokens par appareil
- **Planificateur** : Jobs cron pour l'ouverture/fermeture des manches (pas de scoring)
- **Fuseau horaire** : Calculs en UTC, affichage en heure française (Europe/Paris)

---

_Document généré le $(date) pour l'application Jimboa_
