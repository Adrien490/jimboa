# 🧩 Indexes & Triggers — Jimboa (v1)

Ce document liste, sans SQL, les indexes et triggers recommandés pour le modèle v1. Il est la référence exhaustive; `docs/data-model.md` en contient un résumé orienté produit.

## Objectifs
- Performance: requêtes critiques rapides (sélection quotidienne, feed, RLS, notifications).
- Intégrité: enforcement au niveau base des règles essentielles.
- Simplicité: n’indexer que ce qui sert le produit v1.

## Indexes Recommandés

### Rounds
<a id="rounds"></a>
- UNIQUE `daily_rounds (group_id, scheduled_for_local_date)` — une manche/jour/groupe.
- `daily_rounds (status, open_at)` — job d’ouverture.
- `daily_rounds (status, close_at)` — job de fermeture.
- `daily_rounds (group_id, open_at DESC)` — feed par groupe.

### Prompts
<a id="prompts"></a>
- `prompts (owner_group_id, status, is_enabled)` — sélection locale.
- `prompts (scope, status)` — sélection globale.

### Groupes & Membership
<a id="groupes-membership"></a>
- UNIQUE `group_members (group_id, user_id)`.
- `group_members (group_id, user_id, status)` — contrôles RLS/joins fréquents.
- `group_members (user_id)` — “mes groupes”.
- UNIQUE partiel `group_members (group_id) WHERE role='owner' AND status='active'` — owner unique.
- `groups (owner_id)` — back‑office.
- UNIQUE `groups (join_code)` — code d’invitation (UPPER stocké).

### Interactions
<a id="interactions"></a>
- UNIQUE `submissions (round_id, author_id)`.
- `submissions (round_id, created_at)`.
- UNIQUE `round_votes (round_id, voter_id)`.
- `round_votes (round_id, target_user_id)`.
- `comments (round_id, created_at)`.
- `submission_media (submission_id)`.

### Notifications & Préférences
<a id="notifications-preferences"></a>
- `notifications (status, created_at)` — worker (scan des pending).
- `notifications (user_id, status)` — boîte par destinataire.
- UNIQUE `user_devices (token)`.
- `user_devices (user_id)`.
- PRIMARY KEY `user_group_prefs (user_id, group_id)` — suffit.

### Transferts
<a id="transferts"></a>
- `group_ownership_transfers (group_id, status)`.
- `group_ownership_transfers (to_user_id, status)`.

## Triggers Nécessaires (essentiels, compacts)

### Groupes
<a id="groupes"></a>
- `groups_join_code_normalize` (BEFORE INSERT/UPDATE) — force `join_code = UPPER(join_code)` et format 6 alphanum.
- `touch_groups_updated_at` (BEFORE UPDATE) — met à jour `updated_at`.

### Membership
<a id="membership"></a>
- `protect_last_owner` (BEFORE UPDATE/DELETE ON group_members) — empêche de retirer/déclasser le dernier owner actif.

### Rounds
<a id="rounds-triggers"></a>
- `lock_round_snapshot_after_open` (BEFORE UPDATE ON daily_rounds) — si `status='open'`, interdit toute modif des champs snapshot `resolved_*` / `source_prompt_id`.

### Soumissions
<a id="soumissions"></a>
- `submissions_author_immutable` (BEFORE UPDATE/DELETE ON submissions) — l’auteur ne peut ni éditer ni supprimer; exception: soft delete admin (`deleted_by_admin`, `deleted_at`).

### Commentaires
<a id="commentaires"></a>
- `comments_edit_window` (BEFORE UPDATE/DELETE ON comments) — si round fermé, blocage auteur; exception: soft delete admin.
- `touch_comments_updated_at` (BEFORE UPDATE) — met à jour `updated_at` (seulement si round non fermé).

### Votes
<a id="votes"></a>
- `votes_insert_guard` (BEFORE INSERT ON round_votes) — vérifie: `round.status='open'`, `daily_rounds.resolved_type='vote'`, `target_user_id` ∈ membres actifs du groupe du round.
- `votes_immutable` (BEFORE UPDATE/DELETE ON round_votes) — votes définitifs, aucune modif/suppression.

## Références
- Modèle & contraintes: `docs/data-model.md`
- RLS & sécurité: `docs/rls-policies.md`
- Workflows (jobs): `docs/workflows.md`
