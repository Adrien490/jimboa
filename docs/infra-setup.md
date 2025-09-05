# 🧰 Infra Setup — Supabase CLI

## 0) Pré‑requis (macOS)

```bash
brew install supabase/tap/supabase
supabase --version
```

## 1) Initialiser le dossier infra

Dans la racine du repo Next.js :

```bash
supabase init
# crée ./supabase (migrations, seed, config.toml)
```

## 2) Lier le projet local à ton projet Supabase « remote »

Récupère le Project Ref (format xxxxxx) dans le dashboard.

```bash
supabase login                # ouvre le navigateur
supabase link --project-ref <TON_PROJECT_REF>
```

## 3) Créer des migrations versionnées

```bash
supabase migration new 001_init_schema
# édite ./supabase/migrations/<timestamp>_001_init_schema.sql
```

Exemple de squelette (voir migrations fournies dans ce repo) :

```sql
BEGIN;
-- Tables, RLS, fonctions, triggers, index…
COMMIT;
```

Mets toutes les policies RLS, GRANT, triggers et indexes dans les migrations.

## 4) Lancer en local (tester)

```bash
supabase start                    # démarre Postgres+Studio local
supabase db reset --local         # applique les migrations
supabase db seed --local          # optionnel (fichier seed fourni)
```

## 5) Pousser les migrations en remote (staging/prod)

```bash
# Assure‑toi d’être linké au bon projet
supabase db push
```

## 6) Générer une migration depuis un diff local

```bash
supabase db diff --linked --schema public --file 002_add_rls_and_triggers
```

## 7) Boucles d’itération sûres

- Petites migrations, atomiques, idempotentes
- Toujours `BEGIN; ... COMMIT;`
- Messages d’erreur explicites dans triggers (utiles pour l’UI)
- Ajouter les GRANT nécessaires (SECURITY DEFINER + droits authenticated/anon)
- Vérifier les `FOR INSERT WITH CHECK` (RLS)

## 8) Multi‑environnements

- 2 projets Supabase : dev et prod
- `supabase link` sur chacun selon branche/CI
- CI/CD : sur `main` → `supabase db push` prod; sur `develop` → dev

## 9) Extensions & types (Postgres)

Dans une migration d’init :

```sql
-- Optionnels selon besoins
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- UUID gen, etc.
CREATE EXTENSION IF NOT EXISTS pg_cron;    -- planification SQL
CREATE EXTENSION IF NOT EXISTS pg_net;     -- HTTP (Edge func alternative)
CREATE EXTENSION IF NOT EXISTS citext;     -- texte case‑insensitive (join_code)
```

`join_code`: soit trigger `UPPER`, soit colonne `citext` + UNIQUE (unicité case‑insensitive) tout en stockant en clair.

## 10) Cron — création quotidienne des rounds

Approche fiable/idempotente avec `pg_cron` + SQL atomique :

```sql
-- Exemple: fonction qui ouvre un round planifié
CREATE OR REPLACE FUNCTION job_open_round(p_round_id uuid)
RETURNS void LANGUAGE sql AS $$
  UPDATE daily_rounds
  SET status = 'open'
  WHERE id = p_round_id
    AND status = 'scheduled'
    AND resolved_type IS NOT NULL
    AND now() >= open_at;
$$;

-- Création J-1 (par groupe) — INSERT ... ON CONFLICT DO NOTHING
CREATE OR REPLACE FUNCTION job_create_tomorrow_rounds()
RETURNS void LANGUAGE sql AS $$
  INSERT INTO daily_rounds(group_id, scheduled_for_local_date, status, open_at, close_at)
  SELECT g.id, CURRENT_DATE + INTERVAL '1 day', 'scheduled',
         /* calcul Europe/Paris côté app/worker */ NULL, NULL
  FROM groups g
  ON CONFLICT (group_id, scheduled_for_local_date) DO NOTHING;
$$;

-- Planification (exemple)
SELECT cron.schedule('create_rounds', '*/10 * * * *', $$SELECT job_create_tomorrow_rounds();$$);
```

Alternative: appeler une Edge Function (Supabase Functions) depuis `pg_cron`/`pg_net`.

## 11) Storage — buckets, policies, nettoyage

### Structure des chemins
- Bucket `submissions`: `submissions/<group_id>/<round_id>/<submission_id>/<filename>`

### Policies `storage.objects`

Lecture (esprit) :

```sql
CREATE POLICY storage_read_submissions ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'submissions'
  AND (
    -- is_member sur group_id extrait du chemin
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = split_part(name, '/', 2)::uuid
        AND gm.user_id = auth.uid()
        AND gm.status = 'active'
    )
  )
);
```

Écriture: stricte (l’auteur de la submission ou service). Selon flux, vérifier qu’on écrit sous le bon `group_id/round_id/submission_id`.

Astuce: à la place de `split_part(name, ...)`, stocker `group_id` en métadonnée objet et la joindre dans la policy.

### Suppression asynchrone

- Table tampon `storage_deletions(id, bucket, path, status, created_at, processed_at, last_error)`
- Triggers `ON DELETE` appuient cette table (au lieu d’appeler l’API Storage directement depuis SQL)
- Job cron/Edge Function lit les `status='pending'`, appelle l’API Storage `remove(paths)`, marque `processed_at`/`status`

## 12) Realtime & PWA Push

- Realtime: canaux privés par groupe, payload minimal; s’appuyer sur RLS pour les vues côté client.
- PWA Web Push: côté `user_devices(platform='web')`, stocker `token` (endpoint), et `endpoint`/`p256dh`/`auth` (VAPID). Gestion opt‑in/opt‑out via `user_group_prefs`.
