import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProjectDetail from "@/components/ProjectDetail";

export const revalidate = 0;

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const { data: project } = await supabase.from("projects").select("*").eq("slug", slug).single();

  if (!project) {
    notFound();
  }

  return <ProjectDetail project={project} />;
}
