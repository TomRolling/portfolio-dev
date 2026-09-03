-- À exécuter dans Supabase : SQL Editor > New query > coller > Run
-- (à faire une seule fois, en plus de supabase/schema.sql déjà exécuté)

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

create policy "Envoi public de messages"
  on messages for insert
  with check (true);

create policy "Lecture des messages reservee aux utilisateurs connectes"
  on messages for select
  using (auth.role() = 'authenticated');

create policy "Suppression des messages reservee aux utilisateurs connectes"
  on messages for delete
  using (auth.role() = 'authenticated');
