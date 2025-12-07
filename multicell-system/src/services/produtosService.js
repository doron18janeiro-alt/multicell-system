import { supabase } from "./supabaseClient";

const withOwnerFilter = (query, proprietarioId) =>
  proprietarioId ? query.eq("proprietario_id", proprietarioId) : query;

export async function listarProdutos(proprietarioId, { busca } = {}) {
  if (!proprietarioId) {
    return { data: [], error: new Error("proprietarioId é obrigatório.") };
  }

  let query = supabase
    .from("produtos")
    .select("*")
    .eq("proprietario_id", proprietarioId)
    .order("nome", { ascending: true });

  if (busca?.trim()) {
    query = query.ilike("nome", `%${busca.trim()}%`);
  }

  return query;
}

export async function criarProduto(proprietarioId, data) {
  if (!proprietarioId) {
    return { data: null, error: new Error("proprietarioId é obrigatório.") };
  }

  const payload = {
    ...data,
    proprietario_id: proprietarioId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return supabase.from("produtos").insert(payload).select().single();
}

export async function atualizarProduto(id, proprietarioId, data) {
  if (!id) {
    return { data: null, error: new Error("ID do produto é obrigatório.") };
  }

  const payload = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  let query = supabase.from("produtos").update(payload).eq("id", id);
  query = withOwnerFilter(query, proprietarioId);

  return query.select().single();
}

export async function removerProduto(id, proprietarioId) {
  if (!id) {
    return { error: new Error("ID do produto é obrigatório.") };
  }

  let query = supabase.from("produtos").delete().eq("id", id);
  query = withOwnerFilter(query, proprietarioId);
  return query;
}
