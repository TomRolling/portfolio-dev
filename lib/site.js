// Source unique des informations du site réutilisées à plusieurs endroits
// (métadonnées SEO, image de partage, sitemap, robots).
// Les textes propres à une page (le paragraphe « À propos », celui de la page
// contact) restent dans leur composant : ce sont des textes rédigés, pas des
// constantes. Ici on ne centralise que ce qui doit rester identique partout.
export const site = {
  url: "https://tomrolling.vercel.app",
  name: "Tom Rolling",
  title: "Tom Rolling — Développeur",
  // Sous-titre de l'image de partage
  tagline: "Développeur autodidacte, BTS SIO",
  description:
    "Tom Rolling, développeur autodidacte titulaire d'un BTS SIO. Projets personnels en Python, PHP et JavaScript. Actuellement en recherche d'un poste.",
};
