import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProjectDetail from "@/components/ProjectDetail";

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: project } = await supabase.from("projects").select("title, description").eq("slug", slug).single();
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const { data: project } = await supabase.from("projects").select("*").eq("slug", slug).single();

  if (!project) {
    notFound();
  }

  return <ProjectDetail project={project} />;
}
