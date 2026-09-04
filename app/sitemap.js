import { supabase } from "@/lib/supabaseClient";

const siteUrl = "https://tomrolling.vercel.app";

export default async function sitemap() {
  const [{ data: projects }, { data: certifications }] = await Promise.all([
    supabase.from("projects").select("slug"),
    supabase.from("certifications").select("slug"),
  ]);

  const staticRoutes = ["", "/contact", "/projets", "/certifications"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const projectRoutes = (projects ?? [])
    .filter((p) => p.slug)
    .map((p) => ({ url: `${siteUrl}/projets/${p.slug}`, lastModified: new Date() }));

  const certRoutes = (certifications ?? [])
    .filter((c) => c.slug)
    .map((c) => ({ url: `${siteUrl}/certifications/${c.slug}`, lastModified: new Date() }));

  return [...staticRoutes, ...projectRoutes, ...certRoutes];
}
