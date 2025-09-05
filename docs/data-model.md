# 🗄️ Modèle de données (ERD)

## 🔗 Relations principales

```mermaid
erDiagram
    profiles ||--o{ group_members : "membre de"
    groups ||--|| group_settings : "paramètres"
    groups ||--o{ group_members : "contient"
    groups ||--o{ daily_rounds : "manches"
    profiles ||--o{ submissions : "auteur"
    profiles ||--o{ comments : "commentaire"
    profiles ||--o{ round_votes : "voteur"
    daily_rounds ||--o{ submissions : "soumissions"
    daily_rounds ||--o{ round_votes : "votes"
    daily_rounds ||--o{ comments : "discussion globale"
    submissions ||--o{ submission_media : "médias"

    %% Catalogue unifié
    prompts ||--o{ prompt_tag_links : "taggé"
    prompt_tags ||--o{ prompt_tag_links : "tag"
    groups ||--o{ prompts : "prompts locaux scope='group' (owner_group_id)"

    %% Politiques globales par groupe (pas d'overrides)
    groups ||--o{ group_prompt_policies : "politique par prompt"
    prompts ||--o{ group_prompt_policies : "politique par groupe"

    %% Sélection, anti-répétition, snapshot
    %% v1: snapshot inline dans daily_rounds (pas de table dédiée)

    %% Suggestions unifiées: prompts avec status='pending' (scope='group' ou 'global')

    %% Notifications & préférences
    profiles ||--o{ user_devices : "appareils"
    profiles ||--o{ user_group_prefs : "préférences"
    groups ||--o{ user_group_prefs : "pour groupe"
    profiles ||--o{ notifications : "destinataire"
    groups ||--o{ notifications : "contexte"
    groups ||--o{ group_ownership_transfers : "transferts de propriété"
    profiles ||--o{ group_ownership_transfers : "from_user_id"
    profiles ||--o{ group_ownership_transfers : "to_user_id"
```

## 📱 Notifications & Préférences

```mermaid
erDiagram
    profiles ||--o{ user_devices : "appareils"
    profiles ||--o{ user_group_prefs : "préférences"
    groups ||--o{ user_group_prefs : "pour groupe"
    profiles ||--o{ notifications : "destinataire"
    groups ||--o{ notifications : "contexte"
    groups ||--o{ group_ownership_transfers : "transferts de propriété"
    profiles ||--o{ group_ownership_transfers : "from_user_id (initiateur)"
    profiles ||--o{ group_ownership_transfers : "to_user_id (destinataire)"
```

## 📊 Dictionnaire des tables (v1)

### 👤 Utilisateurs & Groupes

| Table              | Champs principaux                                                                                                           | Contraintes & remarques                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **profiles**       | `id` (=auth), `display_name`, `image_url`, `created_at`, `updated_at`                                                       | FK → `auth.users(id)` ; `display_name` non vide ; `image_url` = URL absolue (Google ou Storage signée)                                                                                     |
| **groups**         | `name`, `owner_id`, `join_enabled`, `join_code`, `image_path`, `is_active`, `created_at`, `updated_at`                      | `owner_id` → `profiles` ; **invariant owner unique** ; `join_code` en clair **UNIQUE + normalisé UPPER** ; `image_path` = chemin Storage ; **heure française fixe** ; index sur `owner_id` |
| **group_members**  | `group_id`, `user_id`, `role` (`owner`\|`admin`\|`member`), `status` (`active`\|`inactive`\|`banned`\|`left`), `created_at` | `UNIQUE(group_id, user_id)` ; **1 seul `owner` actif** par groupe (index partiel) ; FK vers `groups` et `profiles`                                                                         |
| **group_settings** | `group_id` (PK), `drop_time` (HH:MM, nullable pour héritage app), `notifications_enabled` (bool, défaut `true`), `allow_global_prompts` (bool, défaut `true`), `global_catalog_mode` (`'all'`\|`'allowlist'`, défaut `'all'`), `group_audience_tag_id` (NULL, FK→`prompt_tags.id`)             | 1:1 avec `groups` ; **durée de manche fixe 1 jour local (constante applicative)** ; `allow_global_prompts` active la sélection mixte ; `global_catalog_mode` = politique globale par défaut ; préférence d'audience optionnelle (catégorie `audience`)                                                                                                         |

### 🎯 Catalogue & Manches (unifié)

| Table                    | Champs principaux                                                                                                                                                                                                                              | Contraintes & remarques                                                                                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **prompts**              | `id` (PK), `scope` (`global`\|`group`), `owner_group_id` (NULL si global), `type` (`question`\|`vote`\|`challenge`), `title`, `body`, `metadata` (jsonb), `status` (`pending`\|`approved`\|`rejected`\|`archived`), `min_group_size` (int, NULL), `max_group_size` (int, NULL), `created_by`, `reviewed_by`, `reviewed_at`, `created_at`, `updated_at` | Catalogue unique. Si `scope='group'` ⇒ `owner_group_id` NOT NULL. Les prompts globaux sont modérés et partagés; pas d’édition locale du texte pour les globaux.                           |
| **group_prompt_policies**| `group_id`, `prompt_id`, `policy` (`default`\|`allow`\|`block`), `created_at`                                                                                                                                                                | Politique tri‑state par groupe sur les prompts globaux. UNIQUE(`group_id`,`prompt_id`).                                                                                                    |
| **daily_rounds**         | `group_id`, `scheduled_for_local_date` (DATE FR), `status` (`scheduled`\|`open`\|`closed`), `open_at` (timestamptz), `close_at` (timestamptz), `source_prompt_id` (UUID, NULL), `resolved_type`, `resolved_title`, `resolved_body`, `resolved_metadata` (jsonb), `resolved_tags` (jsonb), `created_at`, `updated_at` | `UNIQUE(group_id, scheduled_for_local_date)` ; **exactement 1 jour local** entre `open_at` et `close_at`. Snapshot inline (immuable) dans `daily_rounds`; `source_prompt_id` sert aussi à l’anti‑répétition. |
| **submissions**          | `round_id`, `author_id`, `content_text`, `created_at`, `deleted_by_admin` (NULL), `deleted_at` (NULL)                                                                                                                                        | `UNIQUE(round_id, author_id)` ; définitives ; **soft delete admin** autorisé ; FK vers `daily_rounds` et `profiles`.                                                                        |
| **submission_media**     | `submission_id`, `storage_path`, `kind` (`image`\|`video`\|`audio`\|`file`), `metadata` (jsonb), `created_at`                                                                                                                              | 0..n médias par soumission ; validations de taille/format.                                                                                                                                  |

### 💬 Interactions

| Table           | Champs principaux                                                                                           | Contraintes & remarques                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **comments**    | `round_id`, `author_id`, `body`, `created_at`, `updated_at`, `deleted_at` (NULL), `deleted_by_admin` (NULL) | Éditables/supprimables **jusqu'à** fermeture ; **soft delete admin** autorisé après fermeture |
| **round_votes** | `round_id`, `voter_id`, `target_user_id`, `reason` (NULL), `created_at`                                     | `UNIQUE(round_id, voter_id)` ; **auto‑vote autorisé** ; `reason` libre et optionnel           |

### 🔔 Notifications & Préférences

| Table                         | Champs principaux                                                        | Contraintes & remarques                                                                 |
| ----------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **notifications**             | `user_id`, `group_id`, `type`, `payload` (jsonb), `status`, `created_at` | Types: `round_open`… ; file d'envoi ; `status` (`pending`\|`sent`\|`failed`)            |
| **user_devices**              | `user_id`, `platform` (`ios`\|`android`\|`web`), `token`, `created_at`   | **UNIQUE(token)** ; 1 token ne peut appartenir qu'à un seul compte                      |
| **user_group_prefs**          | `user_id`, `group_id`, `mute` (bool), `push` (bool)                      | `UNIQUE(user_id, group_id)` ; préférences par groupe                                    |
| **group_ownership_transfers** | `group_id`, `from_user_id`, `to_user_id`, `status`, `created_at`         | Transferts de propriété avec acceptation ; `status` (`pending`\|`accepted`\|`rejected`) |

### 🏷️ Tagging

| Table                | Champs principaux                                                                                                       | Contraintes & remarques                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **prompt_tags**      | `id`, `name`, `category` (`audience`) | Taxonomie à facettes; ex. **Audience**: `couple`, `friends`, `family`, `coworkers`, `roommates` |
| **prompt_tag_links** | `prompt_id`, `tag_id`                                                                                                    | UNIQUE(`prompt_id`,`tag_id`) ; cardinalité audience = 1 max (contrainte applicative/trigger)    |

#### Taxonomie à facettes (recommandée)

- **Audience**: couple, friends, family, coworkers, roommates…
 
 

#### Cardinalité par facette (règle applicative)

- Un seul tag par prompt pour: `audience`.
- `type` reste une colonne (`question`|`vote`|`challenge`) — pas de facette `modality`.
 

Note: “couple” et “friends” sont des valeurs de la facette **Audience**. Éviter de les mélanger avec des thèmes/tons/modalités. Ne pas inclure de facette “Seasonality / Event”.

Le tag Audience est informatif pour v1, et peut devenir filtre dur v1.1 (voir plus bas) si tu ajoutes une préférence d’audience au niveau du groupe.

Préférence d'audience (niveau groupe)

- Champ: `group_settings.group_audience_tag_id` (nullable) → référence un tag de catégorie `audience`.
- Contrainte recommandée: vérification que le tag référencé a bien `category='audience'` (via trigger/constraint applicative).
- Sélection (v1.1): si défini, filtrer/prioriser les prompts éligibles qui portent ce tag; sinon considérer tous les prompts éligibles. Fallback: si aucun prompt ne matche, revenir à l'ensemble des prompts éligibles pour ne jamais bloquer l'ouverture.

## ⚖️ Contraintes métier (DB & applicatif)

- **1 round/jour/groupe** : `UNIQUE(group_id, scheduled_for_local_date)`
- **1 soumission/user/round** : `UNIQUE(round_id, author_id)`
- **1 vote/user/round** : `UNIQUE(round_id, voter_id)`
- **Owner unique** : index partiel `UNIQUE(group_id) WHERE role='owner'` dans `group_members`
- **Réactions typées uniques** : `UNIQUE(entity_type, entity_id, user_id, type)`
- **Sélection quotidienne** : candidats = prompts `scope='group'` (owner_group_id=group_id) approuvés + (si `allow_global_prompts=true`) prompts `scope='global'` approuvés filtrés par `global_catalog_mode`/`group_prompt_policies` ; anti‑répétition N=7 calculée à la volée via `daily_rounds.source_prompt_id`

## 🕐 Gestion des temps, fuseaux et DST

### Problématique

Le calcul `close_at = open_at + INTERVAL '24 hours'` pose problème lors des changements d'heure (DST) car :

- Les jours peuvent faire 23h ou 25h lors des transitions DST
- Cela provoque une dérive si on relie la création à "24h après fermeture"
- Le comportement n'est pas intuitif pour les utilisateurs

### Solution implémentée

**Stockage** :

- `group_settings.drop_time` : heure française (TIME sans timezone, ex: "14:30")
- `daily_rounds.scheduled_for_local_date` : date française
- **Fuseau fixe** : Toute l'application fonctionne en heure française (Europe/Paris)

**Calcul des horaires** :

1. `open_at` = ZonedDateTime(date_française, drop_time, "Europe/Paris") → UTC
2. `close_at` = ZonedDateTime(date_française+1, drop_time, "Europe/Paris") → UTC

**Clé d'unicité** : `UNIQUE(group_id, scheduled_for_local_date)`

**Bénéfices** :

- Pas de dérive temporelle
- Comportement intuitif lors des changements d'heure DST
- Simplicité produit : "un prompt par jour en heure française"
- Cohérence : toujours à la même heure française
- **Architecture simplifiée** : pas de gestion multi-fuseaux

### Règle de création de manche

**Invariant simple** :

- **Création J à J-1** : Un round pour le jour J est créé la veille (J-1) à l'heure `drop_time`
- **Condition unique** : s'il n'existe pas encore de `daily_round` pour `(group_id, scheduled_for_local_date=J)`
- **Jobs fréquents** : Toutes les 5-10 min en at-least-once + idempotence
- **Pas de dépendance** : Aucune relation avec l'heure de fermeture de la manche précédente

**Avantages** :

- ✅ **Simplicité** : Une seule règle claire
- ✅ **Prévisibilité** : Création systématique pour chaque jour français
- ✅ **Robustesse** : Pas de dérive temporelle
- ✅ **Idempotence** : Peut tourner à haute fréquence sans risque

**Migration** : remplacer toutes les mentions "24h après fermeture" par "un round par jour français à l'heure drop_time"

### Configuration anti-répétition

**Fenêtre d'exclusion** : N=7 derniers prompts utilisés par défaut

- Paramétrable via constante applicative
- Évite la monotonie tout en permettant la rotation
- Si moins de N prompts actifs, sélection parmi tous les disponibles
- Si aucun prompt éligible n'est disponible à J-1, créer le `daily_round` en `scheduled` sans snapshot et retenter la sélection à l'ouverture; aucune notification n'est envoyée tant que le snapshot n'est pas créé

## 🔐 Règles de sécurité

- **Appartenance stricte** : Toute action (soumettre/commenter/voter) requiert membership du groupe
- **Owner unique** : Exactement 1 owner par groupe, non révoquable sans transfert
- **Heure française fixe** : Toute l'application en Europe/Paris, planification française, stockage UTC
 

## 🔒 Row Level Security (RLS) - Visibilité conditionnelle

**Principe** : Les interactions d'une manche ne sont visibles qu'après avoir soumis sa propre réponse.

### Politiques de visibilité

- **`submissions`** : Visibles si le round est fermé OU si l'utilisateur a participé (soumission OU vote)
- **`comments`** : Visibles si le round est fermé OU si l'utilisateur a participé (soumission OU vote)
- **`round_votes`** : Visibles si le round est fermé OU si l'utilisateur a participé (soumission OU vote)

### Mécanisme de gamification

Cette approche crée un **effet de mystère** qui encourage la participation :

1. L'utilisateur voit le prompt mais pas les réponses des autres
2. Il doit soumettre sa propre réponse pour débloquer le contenu
3. Une fois sa réponse soumise, tout devient visible en temps réel
4. Après fermeture du round, tout reste consultable par tous les membres

### Implémentation RLS unifiée

**Fonction de participation** :

```sql
CREATE OR REPLACE FUNCTION user_has_participated(round_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM submissions s WHERE s.round_id = user_has_participated.round_id AND s.author_id = user_has_participated.user_id
  ) OR EXISTS (
    SELECT 1 FROM round_votes v WHERE v.round_id = user_has_participated.round_id AND v.voter_id = user_has_participated.user_id
  );
END;
$$;
```

Notes RLS/bootstrapping:

- La fonction est créée/possédée par le owner des tables (ex: `postgres`) et exécute avec ses privilèges (SECURITY DEFINER), évitant une boucle RLS lors des sous‑requêtes.
- `GRANT EXECUTE ON FUNCTION user_has_participated(UUID, UUID) TO authenticated;` (et `anon` si nécessaire).
- La politique RLS continue d'utiliser `auth.uid()` comme `user_id` d'appel: `user_has_participated(round_id, auth.uid())`.

**Politique RLS type** :

```sql
-- Exemple pour comments
USING (
  (SELECT status FROM daily_rounds WHERE id = round_id) = 'closed'
  OR user_has_participated(round_id, auth.uid())
)
```

## 🔐 Triggers de contrôle temporel

**Objectif** : Empêcher l'édition/suppression des commentaires après fermeture du round.
**Exception** : Les admins/owners peuvent effectuer un soft delete pour modération.

### Règles de modération admin

**Soft delete admin** : Mécanisme de modération après fermeture

- **Champs** : `deleted_by_admin` (user_id), `deleted_at` (timestamp)
- **Trigger exception** : Autorise UPDATE si `deleted_by_admin: NULL → NOT NULL`
- **Affichage** : Commentaires soft deleted masqués pour tous les membres
- **Permissions** : Seuls owner/admin du groupe peuvent modérer
- **Traçabilité** : Conservation de l'ID du modérateur pour audit

### Triggers implémentés

- **`comments`** : Empêche modification/suppression auteur après fermeture, autorise soft delete admin (`deleted_by_admin`, `deleted_at`)
- **`round_votes`** : Bloque toute modification des votes (définitifs) + validation d'intégrité à l'insertion
- **`submissions`** : Empêche modification/suppression des soumissions, sauf soft delete admin
- **`daily_rounds`** : Validation cohérence round ↔ prompt (même groupe)
- **`groups`** : Normalisation automatique des `join_code` en UPPER + validation format

## 🔐 Intégrité et contrôle d'accès

### M1 - Contraintes croisées (actions ⇒ membre du groupe)

**Objectif** : Empêcher soumissions/commentaires/votes d'utilisateurs non-membres du groupe.

**Implémentation** : Triggers de validation ou politiques RLS vérifiant l'appartenance au groupe avant toute action.

### M2 - Owner unique et toujours membre

**Objectif** : Garantir qu'il y a toujours exactement 1 owner par groupe.

**Implémentation** : Index partiel d'unicité + triggers empêchant la suppression du dernier owner actif.

## 📈 Index de performance

### Index stratégiques

- **Activité utilisateur** : `author_id`, `voter_id`, `user_id` sur les tables d'interaction
- **Support RLS** : Index composites `(round_id, author_id)` pour la visibilité conditionnelle
- **Jointures fréquentes** : `(group_id, user_id, status)` pour les vérifications de membership
- **Jobs automatisés** : Index sur `status` et `close_at` pour les rounds ouverts
- **Notifications** : Index partiel sur les notifications non lues

## 🗑️ Suppression en cascade

- **ON DELETE CASCADE** activé sur toutes les FK vers `groups.id` :
  - `group_members.group_id` → suppression des membres
  - `group_settings.group_id` → suppression des paramètres
  - `daily_rounds.group_id` → suppression des manches
  - `prompts.owner_group_id` → suppression des prompts locaux
  - `group_ownership_transfers.group_id` → suppression des transferts
  - `user_group_prefs.group_id` → suppression des préférences
  - `notifications.group_id` → suppression des notifications
- **Suppression Storage asynchrone** : Images de groupe et médias associés supprimés en arrière-plan
- **Suppression transitive** : Les FK des tables liées aux manches sont aussi supprimées (submissions, comments, votes, etc.)
