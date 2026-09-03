-- À exécuter dans Supabase : SQL Editor > New query > coller > Run
-- (à faire une seule fois, en plus des migrations précédentes)

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on page_views (created_at);

alter table page_views enable row level security;

create policy "Enregistrement public des vues"
  on page_views for insert
  with check (true);

create policy "Lecture du trafic reservee aux utilisateurs connectes"
  on page_views for select
  using (auth.role() = 'authenticated');
