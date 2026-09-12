import "./globals.css";

const siteUrl = "https://tomrolling.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tom Rolling — Développeur",
    template: "%s — Tom Rolling",
  },
  description: "Tom Rolling, développeur autodidacte titulaire d'un BTS SIO. Projets personnels en Python, PHP et JavaScript — actuellement en recherche d'un poste.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Tom Rolling",
    title: "Tom Rolling — Développeur",
    description: "Tom Rolling, développeur autodidacte titulaire d'un BTS SIO. Projets personnels en Python, PHP et JavaScript — actuellement en recherche d'un poste.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tom Rolling — Développeur",
    description: "Tom Rolling, développeur autodidacte titulaire d'un BTS SIO. Projets personnels en Python, PHP et JavaScript — actuellement en recherche d'un poste.",
  },
  verification: {
    google: "xJlIDXsa0B_6PQ6lWaPSzMlT__PWNCS5pbR1O_PxV90",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
