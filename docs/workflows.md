# ⚙️ Workflow d'orchestration (Jobs)

## 🔄 Principes

- **Idempotence stricte** : transitions contrôlées par `status` + clés uniques
- **Horodatage** : `open_at` et `close_at` calculés en UTC selon le **fuseau du groupe** et `drop_time`
- **Durée fixe** : `close_at = open_at + INTERVAL '24 hours'`
- **Locks** : advisory lock par `group_id` pour éviter les doubles transitions

## 📅 Création planifiée (toutes les heures)

**Objectif** : si la dernière manche est `closed` **depuis ≥ 24h**, créer `scheduled` pour `CURRENT_DATE` (fuseau du groupe), en choisissant un prompt **local actif** non utilisé récemment.

Pseudo‑SQL :

```sql
WITH last_closed AS (
  SELECT g.id AS group_id,
         MAX(dr.close_at) AS last_close_at
  FROM groups g
  LEFT JOIN daily_rounds dr ON dr.group_id = g.id
  GROUP BY g.id
), eligible_groups AS (
  SELECT lg.group_id
  FROM last_closed lg
  JOIN groups g ON g.id = lg.group_id
  WHERE g.is_active = TRUE
    AND (lg.last_close_at IS NULL OR lg.last_close_at <= NOW() - INTERVAL '24 hours')
)
INSERT INTO daily_rounds (group_id, group_prompt_id, scheduled_for, status, created_at, updated_at)
SELECT eg.group_id,
       (
         SELECT gp.id FROM group_prompts gp
         WHERE gp.group_id = eg.group_id
           AND gp.is_active = TRUE
           AND gp.id NOT IN (
             SELECT dr.group_prompt_id
             FROM daily_rounds dr
             WHERE dr.group_id = eg.group_id
             ORDER BY dr.scheduled_for DESC
             LIMIT 7 -- fenêtre glissante anti-répétition
           )
         ORDER BY random() LIMIT 1
       ) AS group_prompt_id,
       (NOW() AT TIME ZONE 'UTC')::date AS scheduled_for,
       'scheduled', NOW(), NOW()
FROM eligible_groups eg
ON CONFLICT DO NOTHING;
```

## 🔓 Ouverture (toutes les 5 min)

**Objectif** : passer `scheduled` → `open` à l'heure locale `drop_time`.

```sql
UPDATE daily_rounds dr
SET status = 'open',
    open_at = NOW(),
    close_at = NOW() + INTERVAL '24 hours',
    updated_at = NOW()
FROM groups g
JOIN group_settings gs ON gs.group_id = g.id
    WHERE dr.group_id = g.id
  AND dr.status = 'scheduled'
  AND (
    -- calcul "il est l'heure" dans le fuseau du groupe
    (NOW() AT TIME ZONE g.timezone)::date >= dr.scheduled_for
    AND to_char(NOW() AT TIME ZONE g.timezone, 'HH24:MI') >= to_char(gs.drop_time, 'HH24:MI')
  );
```

## 🔒 Fermeture (toutes les 5 min)

```sql
UPDATE daily_rounds
SET status = 'closed', updated_at = NOW()
WHERE status = 'open' AND close_at <= NOW();
```

## 🔒 Garanties d'intégrité

- **Transitions** : `scheduled → open → closed` uniquement
- **Index** : `(group_id, scheduled_for)` unique ; index sur `status`, `open_at`, `close_at`
- **Verrous** : advisory lock `pg_try_advisory_lock(group_id)` autour des jobs

## 📊 Monitoring des jobs

### Métriques à surveiller

- **Temps d'exécution** : Durée de chaque job
- **Échecs** : Nombre d'erreurs par type de job
- **Latence** : Délai entre l'heure prévue et l'exécution effective
- **Throughput** : Nombre de groupes traités par minute

### Alertes critiques

- **Job bloqué** : Aucune exécution depuis > 1h
- **Échec massif** : > 10% d'échecs sur une période
- **Dérive horaire** : Ouvertures avec > 5min de retard
