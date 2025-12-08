import { createClient } from "@supabase/supabase-js";

if (
  !import.meta.env.VITE_SUPABASE_URL ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  console.warn(
    "[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configurados."
  );
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
