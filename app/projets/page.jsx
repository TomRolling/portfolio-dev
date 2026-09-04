import { supabase } from "@/lib/supabaseClient";
import ProjectsListPage from "@/components/ProjectsListPage";

export const revalidate = 0;

export const metadata = {
  title: "Projets",
  description: "Tous les projets de développement de Tom Rolling.",
};

export default async function AllProjectsPage() {
  const { data: projects } = await supabase.from("projects").select("*").order("sort_order", { ascending: true });
  return <ProjectsListPage projects={projects ?? []} />;
}
