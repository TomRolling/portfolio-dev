import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

// Enregistre une vue de page. La localisation vient des en-têtes que Vercel
// ajoute automatiquement en périphérie de son réseau (pays/ville). L'adresse
// IP du visiteur n'est jamais lue ni stockée ici.
export async function POST(request) {
  try {
    const { path } = await request.json();
    const country = request.headers.get("x-vercel-ip-country") || null;
    const rawCity = request.headers.get("x-vercel-ip-city");
    const city = rawCity ? decodeURIComponent(rawCity) : null;

    await supabase.from("page_views").insert({ path, country, city });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
