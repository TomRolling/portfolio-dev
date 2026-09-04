-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run

-- Table des projets
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  stack text[] not null default '{}',
  link text,
  link_label text not null default 'En savoir plus',
  slug text unique,
  content text not null default '',
  images text[] not null default '{}',
  video_url text,
  blocks jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Table des certifications
create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text not null default '',
  cert_date date,
  credential_url text,
  link_label text not null default 'Voir le badge',
  slug text unique,
  blocks jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Active la sécurité au niveau des lignes (RLS) sur les deux tables
alter table projects enable row level security;
alter table certifications enable row level security;

-- Tout le monde peut lire (le site public doit pouvoir afficher les projets)
create policy "Lecture publique des projets"
  on projects for select
  using (true);

create policy "Lecture publique des certifications"
  on certifications for select
  using (true);

-- Seul un utilisateur connecté (toi, via /admin) peut modifier
create policy "Ecriture reservee aux utilisateurs connectes (projets)"
  on projects for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Ecriture reservee aux utilisateurs connectes (certifications)"
  on certifications for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Table du trafic (nombre de visites, sans données personnelles)
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  country text,
  city text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on page_views (created_at);

alter table page_views enable row level security;

-- N'importe quel visiteur peut enregistrer une vue (nécessaire pour le comptage)
create policy "Enregistrement public des vues"
  on page_views for insert
  with check (true);

-- Seul toi (connecté) peux consulter les statistiques
create policy "Lecture du trafic reservee aux utilisateurs connectes"
  on page_views for select
  using (auth.role() = 'authenticated');

-- Table des messages envoyés depuis le formulaire de contact
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

-- N'importe qui peut envoyer un message (le formulaire public doit fonctionner)
create policy "Envoi public de messages"
  on messages for insert
  with check (true);

-- Seul toi (connecté) peux lire ou supprimer les messages reçus
create policy "Lecture des messages reservee aux utilisateurs connectes"
  on messages for select
  using (auth.role() = 'authenticated');

create policy "Suppression des messages reservee aux utilisateurs connectes"
  on messages for delete
  using (auth.role() = 'authenticated');

-- Bucket de stockage pour les images de projets (lecture publique)
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

create policy "Lecture publique des images de projets"
  on storage.objects for select
  using (bucket_id = 'project-images');

create policy "Ajout d'images reserve aux utilisateurs connectes"
  on storage.objects for insert
  with check (bucket_id = 'project-images' and auth.role() = 'authenticated');

create policy "Suppression d'images reservee aux utilisateurs connectes"
  on storage.objects for delete
  using (bucket_id = 'project-images' and auth.role() = 'authenticated');

insert into projects (title, description, stack, link, link_label, slug, content, sort_order) values (
  'Jardin Idle',
  'Jeu incrémental (idle game) de jardinage développé en solo : on clique, on améliore son jardin, on débloque des recherches et un système de prestige. Sauvegarde locale, progression hors-ligne, météo dynamique, et installation en PWA pour jouer même sans connexion.',
  array['JavaScript', 'HTML / CSS', 'PWA (Service Worker)'],
  '/jardin-idle',
  'Jouer au jeu',
  'jardin-idle',
  'Jardin Idle est un jeu incrémental développé en solo, du concept à la mise en ligne. Le joueur cultive et développe son jardin au fil du temps, débloque des recherches, et peut faire un "prestige" pour recommencer avec des bonus permanents.',
  1
);
