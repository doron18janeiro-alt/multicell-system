import { supabase } from "./supabaseClient";

const ownerFilter = (proprietarioId) =>
  proprietarioId
    ? `loja_id.eq.${proprietarioId},proprietario_id.eq.${proprietarioId}`
    : undefined;

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

const sanitizeFotos = (value) => {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item) => typeof item === "string" && item.length);
};

function normalizeProdutoPayload(payload = {}) {
  const normalized = {
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

  const fotos = sanitizeFotos(payload.fotos);
  if (fotos !== undefined) {
    normalized.fotos = fotos;
  }

  return normalized;
}

export async function listProdutos(proprietarioId, { busca, categoria } = {}) {
  if (!proprietarioId) {
    return { data: [], error: new Error("proprietarioId é obrigatório.") };
  }

  let query = supabase
    .from("produtos")
    .select("*")
    .or(ownerFilter(proprietarioId))
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

export async function getProduto(id, proprietarioId) {
  if (!id)
    return { error: new Error("ID do produto é obrigatório"), data: null };

  let query = supabase.from("produtos").select("*").eq("id", id);
  if (proprietarioId) {
    query = query.or(ownerFilter(proprietarioId));
  }

  const { data, error } = await query.single();

  if (error) {
    console.error("[EstoqueService] Erro ao buscar produto", error);
  }

  return { data, error };
}

export async function createProduto(proprietarioId, payload) {
  if (!proprietarioId) {
    return { error: new Error("proprietarioId é obrigatório."), data: null };
  }
  const normalized = normalizeProdutoPayload(payload);
  if (!normalized.nome) {
    return { error: new Error("Nome do produto é obrigatório."), data: null };
  }
  normalized.created_at = new Date().toISOString();
  normalized.proprietario_id = proprietarioId;
  normalized.loja_id = proprietarioId;

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

export async function updateProduto(id, proprietarioId, payload) {
  if (!id)
    return { error: new Error("ID do produto é obrigatório"), data: null };
  const normalized = normalizeProdutoPayload({
    ...payload,
    ativo: payload.ativo,
  });
  if (!normalized.nome) {
    delete normalized.nome; // evita sobrescrever com undefined
  }

  let query = supabase.from("produtos").update(normalized).eq("id", id);
  if (proprietarioId) {
    query = query.or(ownerFilter(proprietarioId));
  }

  const { data, error } = await query.select().single();

  if (error) {
    console.error("[EstoqueService] Erro ao atualizar produto", error);
  }

  return { data, error };
}

export async function inativarProduto(id, proprietarioId) {
  if (!id)
    return { error: new Error("ID do produto é obrigatório"), data: null };

  let query = supabase
    .from("produtos")
    .update({ ativo: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (proprietarioId) {
    query = query.or(ownerFilter(proprietarioId));
  }

  const { data, error } = await query.select().single();

  if (error) {
    console.error("[EstoqueService] Erro ao inativar produto", error);
  }

  return { data, error };
}
