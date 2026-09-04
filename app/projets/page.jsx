import { supabase } from "@/lib/supabaseClient";
import ProjectsListPage from "@/components/ProjectsListPage";

export const revalidate = 0;

export default async function AllProjectsPage() {
  const { data: projects } = await supabase.from("projects").select("*").order("sort_order", { ascending: true });
  return <ProjectsListPage projects={projects ?? []} />;
}
