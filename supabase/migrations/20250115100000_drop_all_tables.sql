-- Nettoyage complet de toutes les tables Jimboa

-- Supprimer tous les jobs cron existants (ignorer les erreurs si ils n'existent pas)
DO $$ 
BEGIN
    PERFORM cron.unschedule('jimboa-schedule-rounds-daily');
    PERFORM cron.unschedule('jimboa-open-rounds');
    PERFORM cron.unschedule('jimboa-close-rounds');
    PERFORM cron.unschedule('jimboa-reminders');
EXCEPTION 
    WHEN OTHERS THEN NULL;
END $$;

-- Supprimer toutes les politiques RLS existantes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Supprimer toutes les politiques sur les tables du schéma public
    FOR r IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- Supprimer toutes les tables en cascade (ordre important)
DROP TABLE IF EXISTS join_attempts CASCADE;
DROP TABLE IF EXISTS user_group_prefs CASCADE;
DROP TABLE IF EXISTS user_devices CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS round_votes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS submission_media CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS daily_rounds CASCADE;
DROP TABLE IF EXISTS prompt_tag_links CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS prompt_tags CASCADE;
DROP TABLE IF EXISTS group_settings CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Supprimer les types énumérés
DROP TYPE IF EXISTS media_kind CASCADE;
DROP TYPE IF EXISTS round_status CASCADE;
DROP TYPE IF EXISTS prompt_type CASCADE;
DROP TYPE IF EXISTS group_type CASCADE;
DROP TYPE IF EXISTS member_role CASCADE;

-- Supprimer le schéma app et toutes ses fonctions
DROP SCHEMA IF EXISTS app CASCADE;

-- Supprimer les triggers et fonctions du schéma public
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Supprimer les buckets storage
DO $$ 
BEGIN
    PERFORM storage.delete_bucket('avatars');
EXCEPTION 
    WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
    PERFORM storage.delete_bucket('group-images');
EXCEPTION 
    WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
    PERFORM storage.delete_bucket('submissions');
EXCEPTION 
    WHEN OTHERS THEN NULL;
END $$;
