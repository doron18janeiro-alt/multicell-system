import { supabase } from "@/services/supabaseClient";

const TABLE = "produtos";

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

const withOwner = (query, proprietarioId) =>
  proprietarioId ? query.eq("proprietario_id", proprietarioId) : query;

const normalizeProdutoPayload = (payload = {}) => {
  const normalized = {
    nome: sanitizeString(payload.nome) || "",
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
};

const handleResult = (label, { data, error }, fallbackData = null) => {
  if (error) {
    const message = error.message || `Erro em ${label}`;
    console.error("Produtos:erro", message);
    return { data: fallbackData, error: message };
  }
  return { data: data ?? fallbackData, error: null };
};

export async function listarProdutos(proprietarioId, { busca } = {}) {
  if (!proprietarioId) {
    const message = "proprietarioId é obrigatório.";
    console.error("[Produtos] listarProdutos:", message);
    return { data: [], error: message };
  }

  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("proprietario_id", proprietarioId)
    .order("nome", { ascending: true });

  if (busca?.trim()) {
    query = query.ilike("nome", `%${busca.trim()}%`);
  }

  const result = await query;
  return handleResult("listarProdutos", result, []);
}

export async function criarProduto(proprietarioId, data) {
  if (!proprietarioId) {
    const message = "proprietarioId é obrigatório.";
    console.error("[Produtos] criarProduto:", message);
    return { data: null, error: message };
  }

  const payload = {
    ...normalizeProdutoPayload(data),
    proprietario_id: proprietarioId,
    created_at: new Date().toISOString(),
  };

  if (!payload.nome) {
    const message = "Nome do produto é obrigatório.";
    console.error("[Produtos] criarProduto:", message);
    return { data: null, error: message };
  }

  const result = await supabase
    .from(TABLE)
    .insert(payload, { returning: "representation" })
    .select()
    .single();

  return handleResult("criarProduto", result, null);
}

export async function atualizarProduto(id, proprietarioId, data) {
  if (!id) {
    const message = "ID do produto é obrigatório.";
    console.error("[Produtos] atualizarProduto:", message);
    return { data: null, error: message };
  }

  const payload = {
    ...normalizeProdutoPayload({ ...data, ativo: data?.ativo }),
  };

  let query = supabase
    .from(TABLE)
    .update(payload, { returning: "representation" })
    .eq("id", id);

  query = withOwner(query, proprietarioId);

  const result = await query.select().single();
  return handleResult("atualizarProduto", result, null);
}

export async function removerProduto(id, proprietarioId) {
  if (!id) {
    const message = "ID do produto é obrigatório.";
    console.error("[Produtos] removerProduto:", message);
    return { data: null, error: message };
  }

  let query = supabase
    .from(TABLE)
    .delete({ returning: "representation" })
    .eq("id", id);
  query = withOwner(query, proprietarioId);

  const result = await query.select().maybeSingle();
  return handleResult("removerProduto", result, null);
}

// --- Estoque (nomes originais preservados) ---

export async function listProdutos(proprietarioId, { busca, categoria } = {}) {
  if (!proprietarioId) {
    const message = "proprietarioId é obrigatório.";
    console.error("[Produtos] listProdutos:", message);
    return { data: [], error: message };
  }

  let query = withOwner(supabase.from(TABLE).select("*"), proprietarioId)
    .eq("ativo", true)
    .order("updated_at", { ascending: false });

  if (busca?.trim()) {
    const term = busca.trim();
    query = query.or(`nome.ilike.%${term}%,codigo.ilike.%${term}%`);
  }

  if (categoria && categoria !== "todos") {
    query = query.eq("categoria", categoria);
  }

  const result = await query;
  return handleResult("listProdutos", result, []);
}

export async function getProduto(id, proprietarioId) {
  if (!id) {
    const message = "ID do produto é obrigatório.";
    console.error("[Produtos] getProduto:", message);
    return { data: null, error: message };
  }

  let query = supabase.from(TABLE).select("*").eq("id", id);
  query = withOwner(query, proprietarioId);

  const result = await query.single();
  return handleResult("getProduto", result, null);
}

export async function createProduto(proprietarioId, payload) {
  if (!proprietarioId) {
    const message = "proprietarioId é obrigatório.";
    console.error("[Produtos] createProduto:", message);
    return { data: null, error: message };
  }

  const normalized = normalizeProdutoPayload(payload);
  if (!normalized.nome) {
    const message = "Nome do produto é obrigatório.";
    console.error("[Produtos] createProduto:", message);
    return { data: null, error: message };
  }

  normalized.created_at = new Date().toISOString();
  normalized.proprietario_id = proprietarioId;

  const result = await supabase
    .from(TABLE)
    .insert(normalized, { returning: "representation" })
    .select()
    .single();

  return handleResult("createProduto", result, null);
}

export async function updateProduto(id, proprietarioId, payload) {
  if (!id) {
    const message = "ID do produto é obrigatório.";
    console.error("[Produtos] updateProduto:", message);
    return { data: null, error: message };
  }

  const normalized = normalizeProdutoPayload({
    ...payload,
    ativo: payload?.ativo,
  });
  if (!normalized.nome) {
    delete normalized.nome;
  }

  let query = supabase
    .from(TABLE)
    .update(normalized, { returning: "representation" })
    .eq("id", id);

  query = withOwner(query, proprietarioId);

  const result = await query.select().single();
  return handleResult("updateProduto", result, null);
}

export async function inativarProduto(id, proprietarioId) {
  if (!id) {
    const message = "ID do produto é obrigatório.";
    console.error("[Produtos] inativarProduto:", message);
    return { data: null, error: message };
  }

  let query = supabase
    .from(TABLE)
    .update(
      { ativo: false, updated_at: new Date().toISOString() },
      { returning: "representation" }
    )
    .eq("id", id);

  query = withOwner(query, proprietarioId);

  const result = await query.select().single();
  return handleResult("inativarProduto", result, null);
}
