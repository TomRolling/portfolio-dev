"use client";

import { useEffect } from "react";

// Enregistre une vue de la page courante, une seule fois au chargement.
// Passe par /api/track pour que le pays/la ville soient déduits côté serveur
// (Vercel), sans jamais transmettre ni stocker l'IP du visiteur.
export default function PageViewTracker({ path }) {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    }).catch(() => {});
  }, [path]);

  return null;
}
