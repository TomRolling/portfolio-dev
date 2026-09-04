# Portfolio — Tom Rolling

Site en Next.js (App Router). Le design vient du prototype validé (thème terminal, palette Nord).

## Lancer en local

Il faut Node.js installé (version 18 ou plus récente).

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000

## Structure

```
app/
  layout.jsx      -> layout racine + métadonnées (titre, description)
  page.jsx         -> page d'accueil, affiche le composant Homepage
  globals.css       -> styles globaux + Tailwind
components/
  Homepage.jsx      -> tout le contenu de la page (hero, à propos, projets, contact)
public/
  jardin-idle/      -> le jeu Jardin Idle, servi tel quel sur /jardin-idle
```

## Déployer sur Vercel

1. Créer un compte sur https://vercel.com (peut se faire avec GitHub)
2. Pousser ce dossier sur un dépôt GitHub (voir plus bas si tu n'as pas encore de compte GitHub)
3. Sur Vercel : "Add New Project" → importer le dépôt GitHub → laisser les réglages par défaut (Vercel détecte Next.js automatiquement) → Deploy
4. Le site sera accessible sur une URL du type `portfolio-tom.vercel.app`, modifiable dans les réglages du projet

## Créer un dépôt GitHub (si pas encore fait)

```bash
git init
git add .
git commit -m "Premier commit du portfolio"
```

Puis créer un nouveau dépôt vide sur https://github.com/new, et suivre les instructions affichées pour le lier et pousser (`git remote add origin ...` puis `git push`).

## Prochaine étape

Une fois déployé, on connectera Supabase pour rendre les projets dynamiques (ajout/modif depuis une interface d'admin, sans toucher au code).

## Configuration Supabase

1. Crée un projet sur https://supabase.com
2. Dans **SQL Editor**, colle et exécute le contenu de `supabase/schema.sql` — ça crée les tables `projects`, `certifications`, `messages` et `page_views`, active la sécurité (RLS), et insère ton projet Jardin Idle

   ⚠️ Si tu as un projet Supabase déjà configuré avec une version précédente de ce schéma, exécute plutôt uniquement les fichiers `supabase/migration_*.sql` que tu n'as pas encore exécutés (`migration_add_messages.sql`, `migration_add_pageviews.sql`, `migration_add_project_details.sql`), pour ajouter les tables/colonnes manquantes sans tout recréer.
3. Dans **Project Settings > API Keys** (onglet "Publishable and secret API keys"), récupère `Project URL` et la clé `Publishable key` (commence par `sb_publishable_...`)
4. Copie `.env.local.example` vers `.env.local` et colle-y ces deux valeurs
5. Redémarre `npm run dev` — la page d'accueil va maintenant chercher les projets dans Supabase au lieu d'une liste codée en dur

### Créer ton compte admin

Il n'y a pas de formulaire d'inscription publique sur `/admin` (volontaire, pour éviter que n'importe qui puisse créer un compte). Pour te créer un accès :

1. Dans le dashboard Supabase, va dans **Authentication > Users**
2. Clique **Add user** > **Create new user**
3. Renseigne ton email et un mot de passe
4. Va sur `http://localhost:3000/admin` et connecte-toi avec ces identifiants

Une fois connecté, tu peux ajouter/modifier/supprimer tes projets et certifications — ils apparaissent immédiatement sur la page d'accueil.

⚠️ Ne commite jamais `.env.local` (déjà exclu par `.gitignore`) et ne partage jamais la clé **Secret** (`sb_secret_...`) de Supabase — seule la clé **Publishable** (`sb_publishable_...`) doit être utilisée ici.
