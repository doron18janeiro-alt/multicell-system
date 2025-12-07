import { supabase } from "./supabaseClient";

const withOwnerFilter = (query, proprietarioId) =>
  proprietarioId ? query.eq("proprietario_id", proprietarioId) : query;

export async function listarClientes(proprietarioId, { busca } = {}) {
  if (!proprietarioId) {
    return { data: [], error: new Error("proprietarioId é obrigatório.") };
  }

  let query = supabase
    .from("clientes")
    .select("*")
    .eq("proprietario_id", proprietarioId)
    .order("nome", { ascending: true });

  if (busca?.trim()) {
    const termo = busca.trim();
    query = query.or(
      `nome.ilike.%${termo}%,telefone.ilike.%${termo}%,cpf.ilike.%${termo}%`
    );
  }

  return query;
}

export async function criarCliente(proprietarioId, data) {
  if (!proprietarioId) {
    return { data: null, error: new Error("proprietarioId é obrigatório.") };
  }

  const payload = {
    ...normalizarPayload(data),
    proprietario_id: proprietarioId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return supabase.from("clientes").insert(payload).select().single();
}

export async function atualizarCliente(id, proprietarioId, data) {
  if (!id) {
    return { data: null, error: new Error("ID do cliente é obrigatório.") };
  }

  const payload = {
    ...normalizarPayload(data),
    updated_at: new Date().toISOString(),
  };

  let query = supabase.from("clientes").update(payload).eq("id", id);
  query = withOwnerFilter(query, proprietarioId);

  return query.select().single();
}

export async function removerCliente(id, proprietarioId) {
  if (!id) {
    return { error: new Error("ID do cliente é obrigatório.") };
  }

  let query = supabase.from("clientes").delete().eq("id", id);
  query = withOwnerFilter(query, proprietarioId);

  return query;
}

function normalizarPayload(data = {}) {
  const sanitize = (value) => {
    const limpado = value?.toString().trim();
    return limpado?.length ? limpado : null;
  };

  return {
    nome: sanitize(data.nome) || "",
    telefone: sanitize(data.telefone),
    cpf: sanitize(data.cpf),
    email: sanitize(data.email),
    observacoes: sanitize(data.observacoes),
  };
}
