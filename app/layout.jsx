import "./globals.css";

export const metadata = {
  title: "Tom Rolling — Développeur",
  description: "Portfolio de développeur de Tom Rolling — projets, compétences et contact.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
