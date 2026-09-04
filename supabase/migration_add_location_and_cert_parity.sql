-- À exécuter dans Supabase : SQL Editor > New query > coller > Run
-- (en plus des migrations précédentes)

-- Localisation grossière des visites (pays/ville, jamais l'IP elle-même)
alter table page_views add column if not exists country text;
alter table page_views add column if not exists city text;

-- Donne aux certifications les mêmes capacités que les projets (page dédiée, blocs, bouton)
alter table certifications add column if not exists slug text unique;
alter table certifications add column if not exists blocks jsonb not null default '[]'::jsonb;
alter table certifications add column if not exists link_label text not null default 'Voir le badge';
