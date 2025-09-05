# 🔒 RLS & Security

## Principes

- Visibilité conditionnelle: interactions visibles après participation (soumission OU vote)
- Rôles groupe: owner/admin/member via `group_members`
- Immutabilité sélective: votes définitifs; soumissions/comm. non éditables après fermeture (sauf soft delete admin)

## Fonction de participation

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

## Politique type (ex: comments)

```sql
USING (
  (SELECT status FROM daily_rounds WHERE id = round_id) = 'closed'
  OR user_has_participated(round_id, auth.uid())
)
```

## Performances & Index

- Index composites: `(round_id, author_id)` et `(round_id, voter_id)`
- Jointures fréquentes: `(group_id, user_id, status)`

```sql
-- Index support participation
CREATE INDEX IF NOT EXISTS idx_submissions_round_author ON submissions(round_id, author_id);
CREATE INDEX IF NOT EXISTS idx_round_votes_round_voter ON round_votes(round_id, voter_id);

-- (Optionnel V1.1)
CREATE MATERIALIZED VIEW IF NOT EXISTS round_participations AS
SELECT DISTINCT round_id, author_id AS user_id FROM submissions
UNION
SELECT DISTINCT round_id, voter_id AS user_id FROM round_votes;

CREATE UNIQUE INDEX IF NOT EXISTS idx_round_participations_unique
  ON round_participations(round_id, user_id);
```

## Sécurité

- SECURITY DEFINER + search_path contrôlé
- GRANT EXECUTE sur les fonctions RLS aux rôles d'application

Voir aussi: `docs/data-model.md#-row-level-security-rls---visibilité-conditionnelle`.

<!-- Section `group_prompt_policies` supprimée (plus de curation par prompt côté groupe) -->
