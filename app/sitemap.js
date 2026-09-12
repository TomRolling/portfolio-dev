import { supabase } from "@/lib/supabaseClient";
import { site } from "@/lib/site";
export default async function sitemap() {
  const [{ data: projects }, { data: certifications }] = await Promise.all([
    supabase.from("projects").select("slug"),
    supabase.from("certifications").select("slug"),
  ]);

  const staticRoutes = ["", "/contact", "/projets", "/certifications"].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
  }));

  const projectRoutes = (projects ?? [])
    .filter((p) => p.slug)
    .map((p) => ({ url: `${site.url}/projets/${p.slug}`, lastModified: new Date() }));

  const certRoutes = (certifications ?? [])
    .filter((c) => c.slug)
    .map((c) => ({ url: `${site.url}/certifications/${c.slug}`, lastModified: new Date() }));

  return [...staticRoutes, ...projectRoutes, ...certRoutes];
}
