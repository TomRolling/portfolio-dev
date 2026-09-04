import { supabase } from "@/lib/supabaseClient";
import CertificationsListPage from "@/components/CertificationsListPage";

export const revalidate = 0;

export const metadata = {
  title: "Certifications",
  description: "Les certifications de Tom Rolling.",
};

export default async function AllCertificationsPage() {
  const { data: certifications } = await supabase.from("certifications").select("*").order("sort_order", { ascending: true });
  return <CertificationsListPage certifications={certifications ?? []} />;
}
