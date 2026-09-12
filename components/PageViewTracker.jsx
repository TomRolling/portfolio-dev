"use client";

import { useEffect } from "react";
import { isAdminDevice, markPathSeen } from "@/lib/tracking";

// Enregistre une vue de la page courante, une seule fois par onglet et par page.
// Passe par /api/track pour que le pays/la ville soient déduits côté serveur
// (Vercel), sans jamais transmettre ni stocker l'IP du visiteur.
export default function PageViewTracker({ path }) {
  useEffect(() => {
    // Tes propres visites (appareil déjà connecté à l'admin) ne sont pas comptées,
    // et un rafraîchissement ne recompte pas la même page.
    if (isAdminDevice() || !markPathSeen(path)) return;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    }).catch(() => {});
  }, [path]);

  return null;
}
