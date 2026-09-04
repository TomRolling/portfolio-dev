import "./globals.css";

const siteUrl = "https://tomrolling.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tom Rolling — Développeur",
    template: "%s — Tom Rolling",
  },
  description: "Portfolio de développeur de Tom Rolling — projets, compétences et contact.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Tom Rolling",
    title: "Tom Rolling — Développeur",
    description: "Portfolio de développeur de Tom Rolling — projets, compétences et contact.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
