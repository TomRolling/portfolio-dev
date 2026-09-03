import Homepage from "@/components/Homepage";
import { supabase } from "@/lib/supabaseClient";

// Toujours recharger les données les plus récentes (pas de cache statique),
// pour que les modifications faites depuis /admin apparaissent tout de suite.
export const revalidate = 0;

export default async function Page() {
  const [{ data: projects }, { data: certifications }] = await Promise.all([
    supabase.from("projects").select("*").order("sort_order", { ascending: true }),
    supabase.from("certifications").select("*").order("sort_order", { ascending: true }),
  ]);

  return <Homepage projects={projects ?? []} certifications={certifications ?? []} />;
}
