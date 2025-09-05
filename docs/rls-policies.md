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

## Sécurité

- SECURITY DEFINER + search_path contrôlé
- GRANT EXECUTE sur les fonctions RLS aux rôles d'application

Voir aussi: `docs/data-model.md#-row-level-security-rls---visibilité-conditionnelle`.

## Curation des prompts globaux par groupe (owner seulement)

Objectif: permettre au groupe de bloquer/autoriser certains prompts globaux via `group_prompt_policies`, mais réserver la modification à l'owner.

Recommandations RLS (exemples):

```sql
-- Table: group_prompt_policies
ALTER TABLE group_prompt_policies ENABLE ROW LEVEL SECURITY;

-- Lecture: visible aux membres du groupe
CREATE POLICY gpp_select_members ON group_prompt_policies
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_prompt_policies.group_id
      AND gm.user_id = auth.uid()
      AND gm.status = 'active'
  )
);

-- Modification: réservée à l'owner
CREATE POLICY gpp_modify_owner ON group_prompt_policies
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_prompt_policies.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'owner'
      AND gm.status = 'active'
  )
);

CREATE POLICY gpp_update_owner ON group_prompt_policies
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_prompt_policies.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'owner'
      AND gm.status = 'active'
  )
) WITH CHECK (
  TRUE
);

CREATE POLICY gpp_delete_owner ON group_prompt_policies
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_prompt_policies.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'owner'
      AND gm.status = 'active'
  )
);
```

Notes:
- Les admins peuvent consulter mais ne peuvent pas modifier `group_prompt_policies`.
- Réserver le per‑prompt `block/allow` à l'owner via `group_prompt_policies`.
