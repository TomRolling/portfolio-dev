"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// Enregistre une vue de la page courante, une seule fois au chargement.
// Aucune donnée personnelle : juste le chemin visité et l'horodatage.
export default function PageViewTracker({ path }) {
  useEffect(() => {
    supabase.from("page_views").insert({ path }).then(() => {});
  }, [path]);

  return null;
}
