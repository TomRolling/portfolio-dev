"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { setAdminDevice } from "@/lib/tracking";

const palette = {
  bg: "#2E3440",
  border: "#434C5E",
  text: "#E5E9F0",
  muted: "#9AA5B1",
  green: "#A3BE8C",
  red: "#BF616A",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    // Cet appareil est le tien : ses visites ne sont plus comptées dans le trafic.
    setAdminDevice(true);
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="font-mono min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: palette.bg, color: palette.text }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 rounded" style={{ border: `1px solid ${palette.border}` }}>
        <h1 className="text-lg font-semibold mb-6">
          <span style={{ color: palette.green }}>$ </span>admin --login
        </h1>

        <label className="block text-xs mb-1" style={{ color: palette.muted }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 text-sm rounded outline-none"
          style={{ backgroundColor: "transparent", border: `1px solid ${palette.border}`, color: palette.text }}
        />

        <label className="block text-xs mb-1" style={{ color: palette.muted }}>Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 text-sm rounded outline-none"
          style={{ backgroundColor: "transparent", border: `1px solid ${palette.border}`, color: palette.text }}
        />

        {error && <p className="text-xs mb-4" style={{ color: palette.red }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium rounded"
          style={{ backgroundColor: palette.green, color: palette.bg }}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
