-- À exécuter dans Supabase : SQL Editor > New query > coller > Run

-- Nouvelles colonnes pour des fiches projet détaillées
alter table projects add column if not exists slug text unique;
alter table projects add column if not exists content text not null default '';
alter table projects add column if not exists images text[] not null default '{}';
alter table projects add column if not exists video_url text;
alter table projects add column if not exists link_label text not null default 'En savoir plus';

-- Contenu de la fiche projet sous forme de blocs reordonnables (titre, texte, image, video)
alter table projects add column if not exists blocks jsonb not null default '[]'::jsonb;

update projects set slug = 'jardin-idle' where title = 'Jardin Idle' and slug is null;
update projects set link_label = 'Jouer au jeu' where title = 'Jardin Idle' and link_label = 'En savoir plus';

-- Bucket de stockage pour les images de projets (lecture publique)
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- Tout le monde peut voir les images (nécessaire pour qu'elles s'affichent sur le site)
create policy "Lecture publique des images de projets"
  on storage.objects for select
  using (bucket_id = 'project-images');

-- Seul toi (connecté) peux ajouter/modifier/supprimer des images
create policy "Ajout d'images reserve aux utilisateurs connectes"
  on storage.objects for insert
  with check (bucket_id = 'project-images' and auth.role() = 'authenticated');

create policy "Suppression d'images reservee aux utilisateurs connectes"
  on storage.objects for delete
  using (bucket_id = 'project-images' and auth.role() = 'authenticated');
