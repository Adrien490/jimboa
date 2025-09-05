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

