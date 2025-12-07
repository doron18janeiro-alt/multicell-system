import { supabase } from "./supabaseClient";

const CONFIG_ID = "system-config";

const sanitizeText = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const normalizeTheme = (value) => {
  const allowed = new Set(["dark", "light", "multicell"]);
  const normalized =
    typeof value === "string" ? value.toLowerCase() : "multicell";
  return allowed.has(normalized) ? normalized : "multicell";
};

export async function getConfig() {
  const { data, error } = await supabase
    .from("configuracoes")
    .select("*")
    .eq("id", CONFIG_ID)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("[ConfigService] Erro ao carregar configurações", error);
    return { data: null, error };
  }

  return { data: data || null, error: null };
}

export async function saveConfig(payload = {}) {
  const body = {
    id: CONFIG_ID,
    nome_loja: sanitizeText(payload.nome_loja),
    cnpj: sanitizeText(payload.cnpj),
    telefone: sanitizeText(payload.telefone),
    email: sanitizeText(payload.email),
    endereco: sanitizeText(payload.endereco),
    cidade: sanitizeText(payload.cidade),
    uf: sanitizeText(payload.uf)?.toUpperCase(),
    tema: normalizeTheme(payload.tema),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("configuracoes")
    .upsert(
      { ...body, created_at: payload.created_at || new Date().toISOString() },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) {
    console.error("[ConfigService] Erro ao salvar configurações", error);
    return { data: null, error };
  }

  return { data, error: null };
}
