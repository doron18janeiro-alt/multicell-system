import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingKeys = [];
if (!supabaseUrl) missingKeys.push("VITE_SUPABASE_URL");
if (!supabaseAnonKey) missingKeys.push("VITE_SUPABASE_ANON_KEY");

if (missingKeys.length > 0) {
  const message = `[Supabase] Variáveis ausentes: ${missingKeys.join(
    ", "
  )} – confira seu arquivo .env`;
  console.error(message);
  throw new Error(message);
}

const PLACEHOLDER_TOKENS = ["COLOQUE", "YOUR_PROJECT", "YOUR_PUBLIC"];

const hasPlaceholder = (value = "") =>
  PLACEHOLDER_TOKENS.some((token) => value.toUpperCase().includes(token));

const isValidHttpUrl = (value = "") => /^https?:\/\//i.test(value);

if (hasPlaceholder(supabaseUrl) || !isValidHttpUrl(supabaseUrl)) {
  const message =
    "[Supabase] VITE_SUPABASE_URL parece inválida. Use a URL copiada do dashboard (https://xxx.supabase.co).";
  console.error(message);
  throw new Error(message);
}

if (hasPlaceholder(supabaseAnonKey)) {
  const message =
    "[Supabase] VITE_SUPABASE_ANON_KEY não pode conter placeholders. Cole a chave pública anon do projeto.";
  console.error(message);
  throw new Error(message);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
