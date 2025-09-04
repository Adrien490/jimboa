# User Stories - Application Jimboa

Ce document détaille toutes les user stories organisées par épiques pour l'application Jimboa, une plateforme de jeux sociaux en groupe avec des manches quotidiennes.

## Table des matières

- [EPIC A — Authentification & Profil (Google OAuth)](#epic-a--authentification--profil-google-oauth)
- [EPIC B — Appareils & Notifications](#epic-b--appareils--notifications)
- [EPIC C — Groupes (création, rôles, invitations)](#epic-c--groupes-création-rôles-invitations)
- [EPIC D — Réglages de groupe](#epic-d--réglages-de-groupe)
- [EPIC E — Prompts (banque, tags, sélection)](#epic-e--prompts-banque-tags-sélection)
- [EPIC F — Cycle de vie d'une manche (round)](#epic-f--cycle-de-vie-dune-manche-round)
- [EPIC G — Soumissions](#epic-g--soumissions)
- [EPIC H — Médias (images/vidéos/audio/fichiers)](#epic-h--médias-imagesvidéosaudiofichiers)
- [EPIC I — Commentaires](#epic-i--commentaires)
- [EPIC K — Votes (prompts type "vote")](#epic-k--votes-prompts-type-vote)
- [EPIC L — Consultation des résultats](#epic-l--consultation-des-résultats)
- [EPIC M — Intégrité & Accès](#epic-m--intégrité--accès)
- [EPIC N — Fuseaux horaires & Planificateur](#epic-n--fuseaux-horaires--planificateur)
- [EPIC O — Feed & Navigation](#epic-o--feed--navigation)
- [EPIC P — Actions d'admin simples](#epic-p--actions-dadmin-simples-sans-système-de-modération-dédié)
- [EPIC R — Confidentialité & Données](#epic-r--confidentialité--données)
- [EPIC S — Résilience & Erreurs](#epic-s--résilience--erreurs)
- [Notes de conception transverses](#notes-de-conception-transverses)

---

## EPIC A — Authentification & Profil (Google OAuth)

### A1 — Créer automatiquement un profil à la première connexion Google

**En tant que** nouvel utilisateur  
**Je veux** qu'un profil soit créé à partir de mon compte Google  
**Afin de** pouvoir rejoindre/créer un groupe

#### Critères d'acceptation

```gherkin
Étant donné un utilisateur qui se connecte pour la première fois via Google OAuth
Quand la session est validée par Supabase Auth avec Google
Alors une entrée profiles(id=auth.users.id) est créée avec created_at et updated_at et un display_name par défaut basé sur le nom Google (ex: prénom du compte Google ou nom complet)
Et l'image_path est initialisé avec l'URL de la photo de profil Google si disponible
```

#### Règles métier

- `profiles.id = auth.users.id`
- Display_name par défaut = `given_name` ou `name` du profil Google
- Avatar par défaut = `picture` du profil Google si disponible

#### Cas limites

- Multi-login simultané ⇒ idempotence (conflit ignoré)
- Photo Google indisponible ⇒ image_path reste NULL

---

### A2 — Mettre à jour mon display_name et mon avatar

**En tant que** membre  
**Je veux** modifier mon pseudo et mon avatar  
**Afin de** m'identifier clairement dans le groupe

#### Critères d'acceptation

```gherkin
Étant donné un profil existant avec des données Google par défaut
Quand je change display_name ou image_path
Alors updated_at est rafraîchi et le feed affiche le nouveau nom/avatar
```

#### Règles métier

- Avatar = chemin Storage (URL signée côté app) ou URL Google
- Possibilité de conserver l'avatar Google ou d'uploader un avatar personnalisé

#### Cas limites

- Nom vide ⇒ refuser, proposer le nom Google précédent
- Avatar Google supprimé ⇒ fallback vers avatar par défaut

---

### A3 — Supprimer mon compte Google (droit à l'oubli)

**En tant qu'** utilisateur connecté via Google  
**Je veux** supprimer mon compte et mes données  
**Afin de** retirer mes informations de l'application

#### Critères d'acceptation

```gherkin
Étant donné un utilisateur Google qui confirme la suppression
Quand j'exécute "Supprimer mon compte"
Alors le profil Supabase est supprimé/anonymisé, la session Google est révoquée et mes contributions suivent la politique définie (suppression ou anonymisation)
```

#### Règles métier

- Si owner unique d'un groupe actif ⇒ blocage tant que la propriété n'est pas transférée ou le groupe supprimé
- Révocation de l'accès Google OAuth pour l'application

#### Cas limites

- Contributions historiques conservées anonymisées si besoin (ex: "Utilisateur supprimé")
- Échec de révocation Google ⇒ suppression locale quand même effectuée
- Owner de plusieurs groupes ⇒ doit traiter chaque groupe individuellement

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

### B2 — Préférences de push par groupe

**En tant que** membre  
**Je veux** couper le push sur certains groupes  
**Afin de** contrôler mes alertes

#### Critères d'acceptation

```gherkin
Étant donné un groupe G
Quand je mets mute=true ou push=false
Alors aucune notification de G ne m'est envoyée
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
Alors une notif "round_open" est envoyée aux membres, sauf si group_settings.notifications_enabled=false ou user_group_prefs.push=false
```

---

### B4 — Rappel avant fermeture (opt-in)

**En tant que** membre non-participant  
**Je veux** un rappel "bientôt fermé"  
**Afin de** poster/voter à temps

#### Critères d'acceptation

```gherkin
Étant donné un round open et close_at dans X min
Quand je n'ai pas encore soumis/voté selon le type
Alors je reçois "round_close_soon" (si autorisé par prefs)
```

---

## EPIC C — Groupes (création, rôles, invitations)

### C1 — Créer un groupe (amis/couple)

**En tant qu'** utilisateur  
**Je veux** créer un groupe avec un type et une image  
**Afin de** jouer avec mon cercle avec une identité visuelle

#### Critères d'acceptation

```gherkin
Étant donné un utilisateur U
Quand je crée le groupe {name, type, timezone, image_path?}
Alors groups est créé avec owner_id=U, et U est inséré dans group_members avec role='owner'
Et si une image est fournie, elle est stockée dans image_path
```

#### Règles métier

- Image de profil facultative lors de la création
- Formats supportés : JPEG, PNG, WebP
- Taille maximale : 2MB

#### Cas limites

- Timezone invalide ⇒ refuser
- Format d'image invalide ⇒ refuser l'upload, groupe créé sans image
- Image trop volumineuse ⇒ redimensionnement automatique ou refus

---

### C2 — Gérer le code d'invitation permanent

**En tant qu'** owner/admin  
**Je veux** gérer le code d'invitation du groupe  
**Afin de** contrôler l'accès au groupe

#### Critères d'acceptation

```gherkin
Étant donné un groupe nouvellement créé
Alors un code d'invitation permanent est généré automatiquement (6 caractères alphanumériques)
Et le code est stocké en hash sécurisé dans groups.join_code (SHA-256 + salt)

Quand je régénère le code d'invitation
Alors groups.join_code est mis à jour avec le nouveau hash
Et l'ancien code devient invalide immédiatement

Quand je désactive les invitations (join_enabled=false)
Alors les tentatives d'utilisation du code échouent
Même si le code hash correspond à groups.join_code
```

#### Règles métier

- Code permanent sans expiration ni quota d'utilisation
- Stockage sécurisé uniquement en hash (code original jamais stocké)
- Rate limiting : 5 tentatives de join par IP/heure
- Régénération invalide instantanément l'ancien code

#### Cas limites

- Code compromis ⇒ régénération immédiate recommandée
- Tentatives multiples échouées ⇒ blocage temporaire IP

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
Alors le code est vérifié contre groups.join_code (comparaison de hash)
Et j'entre dans group_members avec role='member'
Et je reçois une confirmation de rejointe

Étant donné un code invalide ou un groupe avec join_enabled=false
Quand je tente de rejoindre
Alors l'action échoue avec un message d'erreur générique
Et la tentative est comptabilisée pour le rate limiting
```

#### Règles métier

- Vérification par comparaison de hash (jamais de code en clair)
- `join_enabled` doit être true pour accepter les invitations
- Rate limiting : maximum 5 tentatives par IP/heure
- Messages d'erreur génériques pour éviter l'énumération

#### Cas limites

- Déjà membre ⇒ message "déjà dans le groupe"
- Code inexistant ⇒ même message que code invalide (sécurité)
- Limite de tentatives atteinte ⇒ blocage temporaire avec message explicite
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

### C5 — Promouvoir/rétrograder un admin ou transférer la propriété

**En tant qu'** owner unique  
**Je veux** gérer les admins ou transférer la propriété  
**Afin de** déléguer ou changer de propriétaire

#### Critères d'acceptation

```gherkin
Étant donné un membre M
Quand je le promeus admin
Alors role='admin'

Quand je rétrograde un admin
Alors role='member'

Quand je transfère la propriété à un membre/admin
Alors son role='owner' et mon role='admin' (ou 'member' selon choix)
```

#### Règles métier

- Un groupe doit avoir exactement 1 owner
- Le transfert de propriété est irréversible (sauf nouveau transfert par le nouveau owner)

#### Cas limites

- Impossible de se rétrograder soi-même en tant qu'owner sans transférer la propriété
- Le nouveau owner doit accepter le transfert

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
Alors quitter est bloqué jusqu'à ce que je transfère la propriété ou supprime le groupe
```

#### Règles métier

- L'owner ne peut pas quitter sans transférer la propriété
- Alternative : l'owner peut supprimer le groupe entier

---

### C7 — Modifier l'image de profil du groupe

**En tant qu'** owner ou admin  
**Je veux** changer l'image de profil du groupe  
**Afin de** personnaliser l'identité visuelle du groupe

#### Critères d'acceptation

```gherkin
Étant donné que je suis owner ou admin du groupe
Quand je upload une nouvelle image de profil
Alors image_path est mis à jour avec le nouveau chemin
Et updated_at du groupe est rafraîchi
Et l'ancienne image est supprimée du storage (si elle existe)

Quand je supprime l'image de profil
Alors image_path devient NULL
Et l'image est supprimée du storage
```

#### Règles métier

- Formats supportés : JPEG, PNG, WebP
- Taille maximale : 2MB
- Redimensionnement automatique vers plusieurs tailles (thumbnail, medium, large)
- Seuls owner et admins peuvent modifier l'image

#### Cas limites

- Upload échoué ⇒ conserver l'ancienne image
- Format invalide ⇒ refuser avec message d'erreur
- Image corrompue ⇒ refuser l'upload

---

### C8 — Supprimer un groupe (owner uniquement)

**En tant qu'** owner unique  
**Je veux** supprimer définitivement le groupe  
**Afin de** le fermer sans transférer la propriété

#### Critères d'acceptation

```gherkin
Étant donné que je suis l'owner unique du groupe
Quand je confirme la suppression du groupe
Alors le groupe, tous ses rounds, soumissions, commentaires et données associées sont supprimés définitivement
Et tous les membres sont automatiquement retirés du groupe
Et l'image de profil du groupe est supprimée du storage
```

#### Règles métier

- Seul l'owner peut supprimer le groupe
- Action irréversible avec confirmation obligatoire
- Suppression en cascade de toutes les données liées (y compris l'image)

#### Cas limites

- Rounds actifs en cours ⇒ avertissement mais suppression autorisée
- Notification aux membres avant suppression (optionnel)
- Échec de suppression de l'image ⇒ continuer la suppression du groupe

---

## EPIC D — Réglages de groupe

### D1 — Définir heure de drop & durée d'ouverture

**En tant qu'** owner/admin  
**Je veux** régler drop_time et close_after_hours  
**Afin d'** adapter la cadence

#### Critères d'acceptation

```gherkin
Quand je définis ces champs (ou NULL pour héritage app)
Alors les prochains rounds sont planifiés avec ces valeurs (fuseau du groupe)
```

#### Cas limites

- Modifier le jour J n'affecte pas un round déjà open

---

### D2 — Activer/désactiver les notifications du groupe

**En tant qu'** owner/admin  
**Je veux** basculer notifications_enabled  
**Afin de** contrôler le bruit

#### Critères d'acceptation

```gherkin
Quand notifications_enabled=false
Alors aucune notif "open/close_soon" n'est émise à l'échelle du groupe (les notifs sociales restent régies par prefs individuels si implémentées)
```

---

## EPIC E — Prompts Hybrides (Global + Local)

### E1 — Gérer la banque globale (app creator uniquement)

**En tant que** créateur de l'app  
**Je veux** parcourir et gérer la banque globale de prompts  
**Afin de** maintenir un catalogue de qualité pour tous les groupes

#### Critères d'acceptation

```gherkin
Étant donné que je suis le créateur de l'app (identifié par email .env)
Quand j'accède à l'interface d'admin
Alors je vois tous les prompts globaux (tous statuts confondus)
Et je peux filtrer par statut, type, tags
Et je peux créer, éditer, approuver, rejeter, archiver
Et je peux voir les statistiques d'usage dans les groupes
Et je peux gérer les suggestions en attente
```

#### Règles métier

- Accès exclusivement réservé au créateur de l'app
- Aucun autre utilisateur ne peut parcourir la banque globale
- Interface d'administration complète avec toutes les actions

---

### E2 — Créer un prompt local original

**En tant que** owner/admin de groupe  
**Je veux** créer un prompt spécifique à mon groupe  
**Afin de** personnaliser l'expérience (événements privés, blagues internes, langue locale)

#### Critères d'acceptation

```gherkin
Étant donné que je suis owner/admin d'un groupe
Quand je crée un nouveau prompt local depuis "Mes prompts locaux"
Alors il est ajouté à group_prompts avec cloned_from_global=NULL
Et il est immédiatement actif pour mon groupe
Et je peux définir type, titre, corps, tags, métadonnées
Et il n'apparaît que dans mon groupe (pas de modération globale)
Et seuls les owners/admins peuvent le voir dans l'interface de gestion
```

#### Règles métier

- Création directe sans validation (liberté locale)
- Visible uniquement dans le groupe créateur
- Accès à l'interface de création restreint aux owners/admins
- Possibilité de suggestion vers banque globale plus tard

---

### E3 — Suggérer un prompt local vers la banque globale

**En tant que** membre de groupe  
**Je veux** proposer qu'un prompt local réussi soit ajouté à la banque globale  
**Afin de** partager une bonne idée avec toute la communauté

#### Critères d'acceptation

```gherkin
Étant donné un prompt local qui a généré beaucoup d'engagement dans mon groupe
Quand je clique "Suggérer pour la banque globale"
Alors une entrée est créée dans prompt_suggestions avec status='pending'
Et le créateur de l'app reçoit une notification
Et je peux ajouter un commentaire expliquant pourquoi ce prompt est intéressant
Et je peux voir le statut de ma suggestion
```

#### Règles métier

- Tout membre peut suggérer (pas seulement owner/admin)
- Statistiques d'engagement automatiquement incluses
- Possibilité de retirer sa suggestion avant traitement
- Historique des suggestions par utilisateur

---

### E4 — Modérer les suggestions (app creator)

**En tant que** créateur de l'app  
**Je veux** examiner et traiter les suggestions de prompts locaux  
**Afin de** enrichir la banque globale avec les meilleures contributions

#### Critères d'acceptation

```gherkin
Étant donné une suggestion de prompt avec status='pending'
Quand je l'examine dans l'interface d'admin
Alors je vois le prompt original, les stats d'engagement, et le commentaire du suggéreur
Et je peux approuver (crée un global_prompt), rejeter avec feedback, ou demander modifications
Et le suggéreur reçoit une notification du résultat
Et si approuvé, le prompt devient disponible dans la banque globale
```

---

### E5 — Sélectionner le prompt du jour (owner/admin)

**En tant qu'** owner/admin de groupe  
**Je veux** choisir le prompt de demain parmi mes prompts locaux  
**Afin de** créer l'expérience parfaite pour mon groupe

#### Critères d'acceptation

```gherkin
Étant donné que je planifie le prompt de demain
Quand j'ouvre le sélecteur de prompts
Alors je vois uniquement mes prompts locaux actifs (group_prompts)
Et je peux filtrer par type, tags, ou récence d'utilisation
Et je peux prévisualiser chaque prompt avant sélection
Et je peux programmer à l'avance plusieurs jours
Et je peux activer la sélection automatique parmi mes prompts locaux
```

#### Règles métier

- Accès uniquement aux prompts locaux du groupe
- Pas d'accès aux prompts globaux pour la sélection
- Sélection manuelle ou automatique parmi les prompts locaux uniquement

---

## EPIC F — Cycle de vie d'une manche (round)

### F1 — Planifier la manche quotidienne

**En tant que** système  
**Je veux** garantir un round/jour/groupe  
**Afin de** tenir la cadence

#### Critères d'acceptation

```gherkin
Quand la veille à T (cron)
Alors créer daily_rounds pour D+1 si absent (UNIQUE (group_id, scheduled_for))
```

---

### F2 — Ouvrir la manche

**En tant que** système  
**Je veux** passer le round à open à l'heure locale  
**Afin de** lancer la participation

#### Critères d'acceptation

```gherkin
Quand now() >= open_at & status='scheduled'
Alors status='open' et notif "round_open" (si autorisée)
```

---

### F3 — Rappel "dernière ligne droite"

**En tant que** système  
**Je veux** prévenir avant close_at  
**Afin de** maximiser la participation

#### Critères d'acceptation

```gherkin
Quand now() = close_at - Δ
Alors notif "round_close_soon" aux non-participants
```

---

### F4 — Fermer la manche

**En tant que** système  
**Je veux** passer open → closed  
**Afin de** figer la manche

#### Critères d'acceptation

```gherkin
Quand now() >= close_at & status='open'
Alors status='closed'
```

#### Règles métier

- Idempotent (pas de double fermeture)
- Les soumissions, votes et commentaires sont figés

---

## EPIC G — Soumissions

> **Principe** : 1 soumission par user & par manche. Visibilité conditionnelle : toutes les soumissions sont masquées jusqu'à ce qu'on ait soumis sa propre réponse. Pas d'édition après création. Suppression possible pendant la fenêtre ouverte (libère le quota).

### G1 — Créer une soumission (1 par user)

**En tant que** membre  
**Je veux** répondre au prompt  
**Afin de** participer

#### Critères d'acceptation

```gherkin
Étant donné un round open
Quand je poste
Alors submissions est créé avec (round_id, author_id) unique
Et la soumission devient visible par les membres ayant déjà soumis leur réponse
Et je ne peux plus créer d'autre soumission pour ce round
```

#### Règles métier

- La soumission est visible uniquement par ceux ayant déjà participé (mode "blind" jusqu'à participation)
- Pas d'édition possible après création
- Une seule soumission par utilisateur par round

#### Cas limites

- Tentative 2e soumission ⇒ rejet avec message explicite
- Round fermé ⇒ création impossible

---

### G2 — Supprimer ma soumission pendant la fenêtre

**En tant que** membre  
**Je veux** retirer ma réponse  
**Afin de** la remplacer ou m'abstenir

#### Critères d'acceptation

```gherkin
Quand je supprime avant close_at
Alors la soumission est retirée, mon quota redevient disponible
```

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

> **Principe** : Tout le contenu du round (soumissions, discussion, votes) est visible uniquement après avoir soumis sa propre réponse. Les commentaires sont liés au round (question) et non aux soumissions individuelles. Chaque utilisateur accède au contenu complet individuellement après sa participation.

### I1 — Commenter sur la question du jour

**En tant que** membre  
**Je veux** commenter globalement sur la question du jour  
**Afin de** participer à la discussion collective du groupe

#### Critères d'acceptation

```gherkin
Étant donné un round ouvert et que j'ai soumis ma réponse
Quand je publie un commentaire sur la question du jour
Alors comments {round_id, author_id, body} est créé
Et le commentaire apparaît dans la discussion globale sous la question
Et tous les membres ayant soumis leur réponse peuvent le voir
```

#### Règles métier

- **Visibilité conditionnelle individuelle** : Chaque utilisateur voit la discussion uniquement après avoir soumis sa propre réponse
- Discussion globale commune à tous les membres ayant participé
- Commentaires visibles immédiatement après publication (pour ceux qui ont soumis)
- Ordre chronologique d'affichage

#### Cas limites

- Non-membre du groupe ⇒ refus
- Pas encore soumis de réponse ⇒ discussion globale masquée

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
```

#### Règles métier

- Modification/suppression impossible après fermeture du round
- Seul l'auteur peut éditer/supprimer son commentaire
- Les commentaires restent dans l'ordre chronologique après édition

---

## EPIC K — Votes (prompts type "vote")

### K1 — Voter une fois par manche

**En tant que** membre  
**Je veux** voter  
**Afin d'** exprimer mon choix

#### Critères d'acceptation

```gherkin
Étant donné un round open de type vote
Quand je vote {target_user_id, reason?}
Alors round_votes (round_id, voter_id) est unique
```

#### Règles métier

- `voter_id <> target_user_id`

#### Cas limites

- Non-membre ⇒ refus

---

### K2 — Changer mon vote avant fermeture

**En tant que** membre  
**Je veux** modifier  
**Afin de** corriger une erreur

#### Critères d'acceptation

```gherkin
Quand je renvoie un vote pendant open
Alors l'entrée existante est mise à jour (idempotence)
```

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
Étant donné un round open et que je n'ai pas encore soumis ma réponse
Quand j'ouvre la manche
Alors je vois uniquement le prompt et le formulaire de soumission
Et je ne vois aucune soumission, commentaire ou vote d'autres membres

Étant donné un round open et que j'ai soumis ma réponse
Quand j'ouvre la manche
Alors je vois toutes les soumissions, commentaires et votes
Et je peux interagir (commenter, voter si applicable)
```

#### Règles métier

- Les interactions ne sont visibles qu'après avoir soumis sa propre réponse
- Une fois la réponse soumise, toutes les interactions deviennent visibles instantanément
- Cette règle s'applique à tous les types de prompts (question, vote, challenge)

#### Cas limites

- Suppression de sa soumission ⇒ les interactions redeviennent invisibles
- Re-soumission après suppression ⇒ les interactions redeviennent visibles

---

## EPIC M — Intégrité & Accès

### M1 — Empêcher actions hors groupe

**En tant que** système  
**Je veux** valider l'appartenance  
**Afin de** protéger le groupe

#### Critères d'acceptation

```gherkin
Quand un user tente submit/comment/react/vote
Alors vérifier qu'il est membre du group_id du round cible, sinon refuser
```

---

### M2 — Owner unique toujours membre (invariant)

**En tant que** système  
**Je veux** forcer l'inclusion de l'owner unique  
**Afin de** garantir la gouvernance

#### Critères d'acceptation

```gherkin
Quand un groupe est créé ou owner_id change
Alors l'owner est présent dans group_members(role='owner')
Et il ne peut y avoir qu'un seul membre avec role='owner'
```

#### Règles métier

- Exactement 1 owner par groupe (contrainte d'unicité)

#### Cas limites

- Tentative de retrait de l'owner unique ⇒ refuser
- Tentative de promotion de deux owners simultanément ⇒ refuser

---

## EPIC N — Fuseaux horaires & Planificateur

### N1 — Calcul d'open_at/close_at par fuseau du groupe

**En tant que** système  
**Je veux** planifier à l'heure locale  
**Afin de** respecter le groupe

#### Critères d'acceptation

```gherkin
Quand drop_time et close_after_hours sont connus
Alors open_at/close_at sont calculés en UTC pour le jour scheduled_for
```

---

### N2 — Changement de fuseau

**En tant qu'** owner  
**Je veux** modifier timezone  
**Afin d'** aligner l'équipe

#### Critères d'acceptation

```gherkin
Quand je change timezone
Alors les futurs rounds utilisent le nouveau fuseau (les open_at/close_at déjà définis ne changent pas)
```

---

### N3 — Idempotence des jobs

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
Alors je vois le round du jour en tête avec son état (open/closed) et les précédents en dessous
Et chaque round affiche l'image du groupe (ou une image par défaut si aucune)
Et l'image du groupe est cliquable pour accéder aux détails du groupe
```

#### Règles métier

- Image redimensionnée automatiquement pour l'affichage (thumbnail)
- Image par défaut si image_path est NULL
- Cache des images pour optimiser les performances

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
**Je veux** retirer une soumission  
**Afin de** maintenir un cadre sain

#### Critères d'acceptation

```gherkin
Étant donné une soumission S du groupe
Quand je la supprime
Alors S, ses médias et commentaires liés sont retirés
```

#### Règles métier

- Pas de log structuré (conformément au périmètre)

#### Cas limites

- Suppression pendant open ⇒ recalcul local (ex. si votes dépendants)

---

### P2 — Supprimer un commentaire du groupe (owner/admin)

**En tant qu'** owner/admin  
**Je veux** retirer un commentaire  
**Afin de** supprimer un contenu inapproprié

#### Critères d'acceptation

```gherkin
Quand je supprime
Alors le commentaire disparaît
```

---

## EPIC R — Confidentialité & Données

### R1 — Quitter un groupe et couper les notifs

**En tant qu'** utilisateur  
**Je veux** ne plus recevoir de push d'un groupe quitté  
**Afin de** préserver mon calme

#### Critères d'acceptation

```gherkin
Quand je quitte G
Alors les envois "open/close_soon" pour G ne me ciblent plus
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

- **Visibilité conditionnelle** : Les soumissions et interactions ne sont visibles qu'après avoir soumis sa propre réponse
- **Aucun leaderboard/stats cumulées** : Pas de système de scoring ou de classement
- **Consultation en lecture seule** : Les manches fermées restent consultables sans possibilité d'interaction
- **Pas de modération structurée** : Pas de tables de report/log, seulement suppression par owner/admin

### Contraintes d'unicité

- **1 round/jour/groupe** : Clé unique `(group_id, scheduled_for)`
- **1 soumission/user/round** : Clé unique `(round_id, author_id)`
- **1 vote/user/round** : Clé unique `(round_id, voter_id)`
- **Réactions typées uniques** : Par type/user/entité

### Architecture technique

- **Base de données** : PostgreSQL avec Supabase
- **Authentification** : Supabase Auth avec Google OAuth uniquement
- **Stockage** : Supabase Storage pour les médias
- **Notifications push** : Système de tokens par appareil
- **Planificateur** : Jobs cron pour l'ouverture/fermeture des manches (pas de scoring)
- **Fuseaux horaires** : Calculs en UTC, affichage en heure locale du groupe

---

_Document généré le $(date) pour l'application Jimboa_
