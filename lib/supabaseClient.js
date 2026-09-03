import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Variables Supabase manquantes. Copie .env.local.example vers .env.local et renseigne tes clés."
  );
}

// Un seul client, utilisable côté serveur (Server Components) et côté navigateur
// (composants "use client"). La clé "anon" est publique par conception :
// la vraie protection vient des règles RLS définies dans supabase/schema.sql.
export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
