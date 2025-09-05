# 🔒 RLS & Security

## Principes

- Visibilité conditionnelle unifiée: tout (soumissions, commentaires, votes) est visible après participation, définie comme soumission OU vote.
- Archives après fermeture: lecture seule pour les membres ACTUELS du groupe.
- Rôles groupe: owner/admin/member via `group_members` (statut `active`).
- Immutabilité sélective: votes définitifs; soumissions/comm. non éditables après fermeture (sauf soft delete admin).

## Activation RLS (schéma public)

Activer RLS sur toutes les tables applicatives (extrait):

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_prompt_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_group_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_ownership_transfers ENABLE ROW LEVEL SECURITY;
```

## Helpers RLS

### Fonction membre (factorisée)

```sql
CREATE OR REPLACE FUNCTION is_member(gid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM group_members gm
    WHERE gm.group_id = is_member.gid
      AND gm.user_id = auth.uid()
      AND gm.status = 'active'
  );
$$;

GRANT EXECUTE ON FUNCTION is_member(uuid) TO authenticated;
```

## Politique type (ex: comments)

```sql
USING (
  /* Membre actuel du groupe du round (factorisé) */
  is_member((SELECT dr.group_id FROM daily_rounds dr WHERE dr.id = comments.round_id))
  AND (
    /* Archives accessibles aux membres actuels */
    (SELECT status FROM daily_rounds WHERE id = comments.round_id) = 'closed'
    /* Ou visibilité après participation (soumission OU vote) */
    OR EXISTS (
      SELECT 1 FROM round_participations rp
      WHERE rp.round_id = comments.round_id AND rp.user_id = auth.uid()
    )
  )
)
```

## Performances & Index

- Index composites: `(round_id, author_id)` et `(round_id, voter_id)`
- Jointures fréquentes: `(group_id, user_id, status)`
- Anti‑répétition: `daily_rounds (group_id, source_prompt_id, open_at DESC)`

```sql
-- Index support participation
CREATE INDEX IF NOT EXISTS idx_submissions_round_author ON submissions(round_id, author_id);
CREATE INDEX IF NOT EXISTS idx_round_votes_round_voter ON round_votes(round_id, voter_id);
CREATE INDEX IF NOT EXISTS idx_daily_rounds_group_source_open_at ON daily_rounds(group_id, source_prompt_id, open_at DESC);

-- Voir section round_participations pour le schéma + index dédiés
```

## Sécurité

- SECURITY DEFINER + search_path contrôlé
- GRANT EXECUTE sur les fonctions RLS aux rôles d'application

Voir aussi: `docs/data-model.md#-row-level-security-rls---visibilité-conditionnelle`.

## round_participations — Pourquoi c’est utile (v1)
<a id="round-participations"></a>

- RLS plus rapides et plus simples: remplace deux EXISTS (soumissions/votes) par un seul EXISTS sur une petite table indexée `(round_id, user_id)`.
- Unifie la règle « visibilité après participation » pour `submissions`, `comments`, `round_votes` avec le même plan.
- Robuste aux soft delete: si une soumission est soft‑deleted, la participation reste vraie.
- Compteurs & UX en O(1): `participants_count` rapide; “Tu as participé ?” sans toucher aux tables lourdes.
- Temps réel plus net: une seule subscription (INSERT sur `round_participations`) débloque l’UI post‑participation.

### Comment ça marche (v1)

Schéma minimal:

```sql
CREATE TABLE round_participations(
  round_id uuid NOT NULL,
  user_id  uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (round_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_round_participations_round ON round_participations(round_id);
```

Alimentation (idempotente):

```sql
-- Après insertion d’une soumission
CREATE TRIGGER rp_from_submissions
AFTER INSERT ON submissions
FOR EACH ROW EXECUTE FUNCTION rp_upsert_from_submission();

-- Après insertion d’un vote
CREATE TRIGGER rp_from_votes
AFTER INSERT ON round_votes
FOR EACH ROW EXECUTE FUNCTION rp_upsert_from_vote();

-- Fonctions d’UPSERT (esprit)
CREATE OR REPLACE FUNCTION rp_upsert_from_submission() RETURNS trigger AS $$
BEGIN
  INSERT INTO round_participations(round_id, user_id)
  VALUES (NEW.round_id, NEW.author_id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION rp_upsert_from_vote() RETURNS trigger AS $$
BEGIN
  INSERT INTO round_participations(round_id, user_id)
  VALUES (NEW.round_id, NEW.voter_id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
```

Jamais de DELETE sur `round_participations` en cas de soft delete de contenu.

Policies RLS (exemple comments):

```sql
USING (
  is_member((SELECT dr.group_id FROM daily_rounds dr WHERE dr.id = comments.round_id))
  AND (
    (SELECT status FROM daily_rounds WHERE id = comments.round_id) = 'closed'
    OR EXISTS (
      SELECT 1 FROM round_participations rp
      WHERE rp.round_id = comments.round_id AND rp.user_id = auth.uid()
    )
  )
)
```

Même logique copiée pour `submissions` et `round_votes`.

Usages additionnels concrets:

- Feed: tag “Participé / Pas encore” sans jointures lourdes.
- Notifications: ne pas pousser ceux qui ont déjà participé.
- Insights admin: taux de participation par jour/groupe sans scanner médias/réponses.
- Anti‑doublon logique: vote puis réponse (ou inverse) → 1 seule ligne (PK).

Alternatives & arbitrage:

- Sans table: fonction/VIEW matérialisée `UNION DISTINCT` `submissions`/`round_votes`.
  - ✅ pas de table en plus
  - ❌ OR entre deux grosses tables, plans variables, coûts qui montent avec l’historique
- Avec table (obligatoire en v1):
  - ✅ RLS stables, rapides, simples
  - ✅ Résilient aux soft deletes
  - ✅ Parfait pour les compteurs
  - 🔸 Besoin de 2 triggers (submissions, votes)

Détails de solidité:

- Concurrence: UPSERT sur PK `(round_id, user_id)` est sûr.
- Sécurité: INSERT via triggers/worker (service role). SELECT soumis aux règles d’appartenance; possible de joindre `daily_rounds` en lecture.

Migration (backfill) simple:

```sql
INSERT INTO round_participations(round_id, user_id)
SELECT round_id, author_id FROM submissions
UNION
SELECT round_id, voter_id  FROM round_votes
ON CONFLICT DO NOTHING;
```

Références: indexes/triggers liés dans `docs/db-indexes-triggers.md#interactions` et `#rounds-triggers`.

### Risques / garde‑fous

- Dérive de vérité: si l’INSERT de participation échoue mais que la soumission/le vote est créé.
  - Mitigation: triggers dans la même transaction (par défaut en DB) et métrique “submissions+votes ≈ participations” (écarts alertés).
- Suppression: ne jamais supprimer de lignes de `round_participations` lors d’un soft‑delete de contenu.
- Sécurité: interdire aux clients d’écrire directement dans `round_participations` (INSERT via triggers/serveur uniquement). Mettre RLS strict: aucun INSERT/UPDATE/DELETE pour `authenticated`.

## Storage (Supabase) — voir `docs/infra-setup.md`

- Bucket `submissions` avec structure de chemin: `submissions/<group_id>/<round_id>/<submission_id>/<filename>`
- Policies `storage.objects` sur `bucket_id` + `name LIKE` + appartenance via `is_member(...)`
- Suppressions asynchrones via table tampon `storage_deletions` + Edge Function/cron

## RPC — join_group_by_code(code TEXT)

```sql
CREATE OR REPLACE FUNCTION join_group_by_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT := UPPER(TRIM(p_code));
  v_group RECORD;
  v_result JSONB;
BEGIN
  -- Validation format [A-Z0-9]{6}
  IF v_code !~ '^[A-Z0-9]{6}$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_code_format');
  END IF;

  -- Trouver le groupe sans dépendre de RLS membership
  SELECT id, join_enabled INTO v_group FROM groups WHERE join_code = v_code;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_code');
  END IF;
  IF v_group.join_enabled IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'error', 'join_disabled');
  END IF;

  -- Insérer le membre (idempotent)
  INSERT INTO group_members(group_id, user_id, role, status)
  VALUES (v_group.id, auth.uid(), 'member', 'active')
  ON CONFLICT (group_id, user_id) DO NOTHING;

  v_result := jsonb_build_object('ok', true, 'group_id', v_group.id);
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION join_group_by_code(TEXT) TO authenticated;
```

<!-- Section `group_prompt_policies` supprimée (plus de curation par prompt côté groupe) -->

## Matrix RLS (par table)

Nota: Les verbes sont donnés sous l’angle des rôles applicatifs (utilisateur authentifié avec RLS, jobs/worker via service role non-RLS).

### profiles

- SELECT: `authenticated` (lecture de base — nom/avatar). Option stricte: limiter certains champs aux membres partageant un groupe.
- INSERT: via Auth (création automatique côté serveur).
- UPDATE: self only (id = auth.uid()).
- DELETE: interdit.

### groups

- SELECT: membres du groupe uniquement (join via `group_members`).
- INSERT: serveur (création groupe par un utilisateur authentifié, puis insertion membership owner).
- UPDATE: owner/admin du groupe.
- DELETE: owner‑only.

### group_members

- SELECT: membres du groupe.
- INSERT: via action join côté serveur (code d’invitation) ou création de groupe (owner).
- UPDATE: rôles par owner‑only; leave self autorisé (sauf si dernier owner actif).
- DELETE: leave self autorisé (sauf dernier owner); autres suppressions par owner/admin.

### group_settings

- SELECT: membres du groupe.
- INSERT: serveur à la création du groupe.
- UPDATE: owner/admin.
- DELETE: cascade via suppression groupe.

### prompts

- SELECT: prompts globaux `status='approved'`; prompts locaux visibles aux membres du groupe propriétaire via `is_member(prompts.owner_group_id)` (tous statuts pour UI d’admin local, filtrés côté UI pour `pending/approved/rejected/archived`).
- INSERT: local par owner/admin; suggestions locales par members (créées `status='pending'`). Global par app creator.
- UPDATE: `status`/`is_enabled` sur prompts locaux (owner/admin). Global: app creator. Édition contenu locale: owner/admin; globale: app creator.
- DELETE: local par owner/admin (selon politique produit); global par app creator.

### prompt_tags

- SELECT: authenticated (lecture catalogue `audience`).
- INSERT/UPDATE/DELETE: app creator (gestion des tags d’audience).

### group_prompt_blocks

- SELECT: membres du groupe.
- INSERT/DELETE: owner/admin du groupe (UNIQUE(group_id, prompt_id)).

### daily_rounds

- SELECT: membres du groupe via `is_member(daily_rounds.group_id)`.
- INSERT/UPDATE: jobs/scheduler (service role). Les membres n’écrivent pas ces lignes.
- DELETE: cascade via suppression du groupe.

### submissions

- SELECT: membre `active` du groupe du round via `is_member((SELECT dr.group_id FROM daily_rounds dr WHERE dr.id = submissions.round_id))` ET (round `closed` OU `EXISTS (SELECT 1 FROM round_participations rp WHERE rp.round_id = submissions.round_id AND rp.user_id = auth.uid())`).
- INSERT: membre actif du groupe (contrôle membership + statut round `open`). Unicité `(round_id, author_id)`.
- UPDATE: auteur non autorisé (soumission définitive); owner/admin: soft delete (`deleted_by_admin`, `deleted_at`).
- DELETE: interdit (soft delete uniquement).

### submission_media

- SELECT: hérite de la visibilité de la `submission` par jointure.
- INSERT: auteur de la `submission` uniquement (ou service pour import). Taille/MIME validés côté serveur.
- UPDATE/DELETE: via opérations sur `submission` (soft delete en cascade logique au besoin).

### comments

- SELECT: mêmes règles que `submissions` (membre `active` via `is_member((SELECT dr.group_id FROM daily_rounds dr WHERE dr.id = comments.round_id))` + fermé OU participation via `round_participations`).
- INSERT: membre actif du groupe ET round non fermé.
- UPDATE: auteur avant fermeture; après fermeture: owner/admin uniquement pour soft delete (`deleted_by_admin`, `deleted_at`).
- DELETE: interdit (soft delete uniquement).

### round_votes

- SELECT: mêmes règles que `submissions` (membre `active` via `is_member((SELECT dr.group_id FROM daily_rounds dr WHERE dr.id = round_votes.round_id))` + fermé OU participation via `round_participations`).
- INSERT: membre actif du groupe, round type vote, contrainte UNIQUE `(round_id, voter_id)`.
- UPDATE/DELETE: interdits (votes définitifs; triggers bloquent toute modification/suppression).

### notifications

- SELECT: destinataire seulement (`notifications.user_id = auth.uid()`).
- INSERT: worker/serveur (service role) lors d’un événement.
- UPDATE: worker (mise à jour `status`).
- DELETE: housekeeping (service role) si nécessaire.

### user_devices

- SELECT: self only.
- INSERT/UPSERT: self only; contrainte d’unicité token globale (un token = un user).
- UPDATE/DELETE: self only (purge token invalide par worker autorisé).

### group_ownership_transfers

- SELECT: `from_user_id` OU `to_user_id` OU owner/admin de `group_id` (au minimum les deux acteurs voient la demande).
- INSERT: owner du groupe (initiateur).
- UPDATE: destinataire (accept/reject) via action serveur atomique.
- DELETE: serveur (expiration/annulation) ou owner si pending.

### round_participations

- SELECT: membres du groupe du round uniquement (via jointure `daily_rounds` → `group_id` et `is_member(...)`).
- INSERT/UPDATE/DELETE: aucun pour `authenticated` (INSERT réalisés par triggers/worker en service role uniquement).

## Triggers & Intégrité (résumé)

- groups: normalisation `join_code` en UPPER + validation format.
- group_members: index partiel UNIQUE (1 owner actif/groupe) + trigger empêchant suppression/désactivation du dernier owner.
- daily_rounds: validation cohérence prompt ↔ group quand `source_prompt_id` est défini (même groupe si local; global autorisé si `allow_global_prompts=true`).
- round_votes: intégrité target (target_user_id ∈ membres actifs du groupe du round); blocage UPDATE/DELETE (votes définitifs).
- comments: blocage UPDATE/DELETE auteur après fermeture; exception soft delete admin (`deleted_by_admin`, `deleted_at`).
- submissions: blocage UPDATE/DELETE auteur (soumission définitive); exception soft delete admin.

## Notes d’implémentation

- RLS: utiliser `WITH CHECK` sur INSERT/UPDATE pour vérifier membership et statuts nécessaires.
- Fonctions SECURITY DEFINER: verrouiller `search_path` et limiter les privilèges; GRANT EXECUTE aux rôles applicatifs.
- Index support: `(round_id, author_id)`, `(round_id, voter_id)`, `(group_id, user_id, status)`, `UNIQUE(group_id, scheduled_for_local_date)`, `UNIQUE(group_id, prompt_id)`.
