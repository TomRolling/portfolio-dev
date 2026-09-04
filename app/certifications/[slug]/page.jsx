import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProjectDetail from "@/components/ProjectDetail";

export const revalidate = 0;

export default async function CertificationPage({ params }) {
  const { slug } = await params;
  const { data: cert } = await supabase.from("certifications").select("*").eq("slug", slug).single();

  if (!cert) {
    notFound();
  }

  // Réutilise le composant d'affichage des projets : une certification devient
  // simplement une fiche avec "description" = organisme/date au lieu de la stack.
  const year = cert.cert_date ? new Date(cert.cert_date).getFullYear() : null;
  const project = {
    title: cert.name,
    description: [cert.organization, year].filter(Boolean).join(" — "),
    stack: [],
    link: cert.credential_url,
    link_label: cert.link_label,
    slug: cert.slug,
    blocks: cert.blocks,
    content: "",
    images: [],
    video_url: null,
  };

  return <ProjectDetail project={project} basePath="/certifications" backHref="/#certifications" backLabel="Retour aux certifications" />;
}
