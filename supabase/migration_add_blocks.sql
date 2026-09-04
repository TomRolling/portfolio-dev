-- À exécuter dans Supabase : SQL Editor > New query > coller > Run
-- (tu as déjà exécuté migration_add_project_details.sql, donc juste ça en plus)

alter table projects add column if not exists blocks jsonb not null default '[]'::jsonb;
