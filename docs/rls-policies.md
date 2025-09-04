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

