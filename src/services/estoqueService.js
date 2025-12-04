import { supabase } from "./supabaseClient";

const normalizeMoney = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : 0;
};

const normalizeInteger = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.trunc(numeric));
};

const sanitizeString = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

function normalizeProdutoPayload(payload = {}) {
  return {
    nome: payload.nome?.trim(),
    codigo: sanitizeString(payload.codigo),
    categoria: sanitizeString(payload.categoria),
    preco_custo: normalizeMoney(payload.preco_custo),
    preco_venda: normalizeMoney(payload.preco_venda),
    quantidade: normalizeInteger(payload.quantidade),
    observacoes: sanitizeString(payload.observacoes),
    ativo: payload.ativo !== undefined ? Boolean(payload.ativo) : true,
    updated_at: new Date().toISOString(),
  };
}

export async function listProdutos({ busca, categoria } = {}) {
  let query = supabase
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .order("updated_at", { ascending: false });

  if (busca) {
    const term = busca.trim();
    if (term) {
      const filter = `nome.ilike.%${term}%,codigo.ilike.%${term}%`;
      query = query.or(filter);
    }
  }

  if (categoria && categoria !== "todos") {
    query = query.eq("categoria", categoria);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[EstoqueService] Erro ao listar produtos", error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

export async function getProduto(id) {
  if (!id)
    return { error: new Error("ID do produto é obrigatório"), data: null };

  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[EstoqueService] Erro ao buscar produto", error);
  }

  return { data, error };
}

export async function createProduto(payload) {
  const normalized = normalizeProdutoPayload(payload);
  if (!normalized.nome) {
    return { error: new Error("Nome do produto é obrigatório."), data: null };
  }
  normalized.created_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("produtos")
    .insert(normalized)
    .select()
    .single();

  if (error) {
    console.error("[EstoqueService] Erro ao criar produto", error);
  }

  return { data, error };
}

export async function updateProduto(id, payload) {
  if (!id)
    return { error: new Error("ID do produto é obrigatório"), data: null };
  const normalized = normalizeProdutoPayload({
    ...payload,
    ativo: payload.ativo,
  });
  if (!normalized.nome) {
    delete normalized.nome; // evita sobrescrever com undefined
  }

  const { data, error } = await supabase
    .from("produtos")
    .update(normalized)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[EstoqueService] Erro ao atualizar produto", error);
  }

  return { data, error };
}

export async function inativarProduto(id) {
  if (!id)
    return { error: new Error("ID do produto é obrigatório"), data: null };

  const { data, error } = await supabase
    .from("produtos")
    .update({ ativo: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[EstoqueService] Erro ao inativar produto", error);
  }

  return { data, error };
}
