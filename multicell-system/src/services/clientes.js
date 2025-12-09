import { supabase } from "@/services/supabaseClient";

const TABLE = "clientes";

const sanitize = (value) => {
  const text = value?.toString().trim();
  return text?.length ? text : null;
};

const withOwner = (query, proprietarioId) =>
  proprietarioId ? query.eq("proprietario_id", proprietarioId) : query;

const handleResult = (label, { data, error }, fallback = null) => {
  if (error) {
    const message = error.message || `Erro em ${label}`;
    console.error("Clientes:erro", message);
    return { data: fallback, error: message };
  }
  return { data: data ?? fallback, error: null };
};

const normalizePayload = (data = {}) => ({
  nome: sanitize(data.nome) || "",
  telefone: sanitize(data.telefone),
  cpf: sanitize(data.cpf),
  email: sanitize(data.email),
  observacoes: sanitize(data.observacoes),
  updated_at: new Date().toISOString(),
});

export async function listarClientes(proprietarioId, { busca } = {}) {
  if (!proprietarioId) {
    const message = "proprietarioId é obrigatório.";
    console.error("[Clientes] listarClientes:", message);
    return { data: [], error: message };
  }

  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("proprietario_id", proprietarioId)
    .order("nome", { ascending: true });

  if (busca?.trim()) {
    const termo = busca.trim();
    query = query.or(
      `nome.ilike.%${termo}%,telefone.ilike.%${termo}%,cpf.ilike.%${termo}%`
    );
  }

  const result = await query;
  return handleResult("listarClientes", result, []);
}

export async function criarCliente(proprietarioId, data) {
  if (!proprietarioId) {
    const message = "proprietarioId é obrigatório.";
    console.error("[Clientes] criarCliente:", message);
    return { data: null, error: message };
  }

  const payload = {
    ...normalizePayload(data),
    proprietario_id: proprietarioId,
    created_at: new Date().toISOString(),
  };

  if (!payload.nome) {
    const message = "Nome do cliente é obrigatório.";
    console.error("[Clientes] criarCliente:", message);
    return { data: null, error: message };
  }

  const result = await supabase
    .from(TABLE)
    .insert(payload, { returning: "representation" })
    .select()
    .single();

  return handleResult("criarCliente", result, null);
}

export async function atualizarCliente(id, proprietarioId, data) {
  if (!id) {
    const message = "ID do cliente é obrigatório.";
    console.error("[Clientes] atualizarCliente:", message);
    return { data: null, error: message };
  }

  const payload = normalizePayload(data);

  let query = supabase
    .from(TABLE)
    .update(payload, { returning: "representation" })
    .eq("id", id);

  query = withOwner(query, proprietarioId);

  const result = await query.select().single();
  return handleResult("atualizarCliente", result, null);
}

export async function removerCliente(id, proprietarioId) {
  if (!id) {
    const message = "ID do cliente é obrigatório.";
    console.error("[Clientes] removerCliente:", message);
    return { data: null, error: message };
  }

  let query = supabase
    .from(TABLE)
    .delete({ returning: "representation" })
    .eq("id", id);
  query = withOwner(query, proprietarioId);

  const result = await query.select().maybeSingle();
  return handleResult("removerCliente", result, null);
}

// --- ClientsService (nomes mantidos) ---

export async function listClients({ search = "", proprietarioId } = {}) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("nome", { ascending: true });

  if (proprietarioId) {
    query = query.eq("proprietario_id", proprietarioId);
  }

  if (search?.trim()) {
    const termo = search.trim();
    query = query.or(
      `nome.ilike.%${termo}%,cpf.ilike.%${termo}%,telefone.ilike.%${termo}%`
    );
  }

  const result = await query;
  return handleResult("listClients", result, []);
}

export async function getClientById(id, proprietarioId) {
  if (!id) {
    const message = "ID do cliente é obrigatório.";
    console.error("[Clientes] getClientById:", message);
    return { data: null, error: message };
  }

  let query = supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (proprietarioId) {
    query = query.eq("proprietario_id", proprietarioId);
  }

  const result = await query;
  return handleResult("getClientById", result, null);
}

export async function createClient({
  nome,
  telefone,
  email,
  cpf,
  proprietario_id,
}) {
  const payload = {
    nome: sanitize(nome) || "",
    telefone: sanitize(telefone),
    email: sanitize(email),
    cpf: sanitize(cpf),
    proprietario_id: proprietario_id || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!payload.nome) {
    const message = "Nome do cliente é obrigatório.";
    console.error("[Clientes] createClient:", message);
    return { data: null, error: message };
  }

  const result = await supabase
    .from(TABLE)
    .insert(payload, { returning: "representation" })
    .select()
    .maybeSingle();

  return handleResult("createClient", result, null);
}

export async function updateClient(
  id,
  { nome, telefone, email, cpf, proprietario_id }
) {
  if (!id) {
    const message = "ID do cliente é obrigatório.";
    console.error("[Clientes] updateClient:", message);
    return { data: null, error: message };
  }

  const payload = {
    nome: sanitize(nome),
    telefone: sanitize(telefone),
    email: sanitize(email),
    cpf: sanitize(cpf),
    proprietario_id: proprietario_id || null,
    updated_at: new Date().toISOString(),
  };

  let query = supabase
    .from(TABLE)
    .update(payload, { returning: "representation" })
    .eq("id", id)
    .maybeSingle();

  const result = await query;
  return handleResult("updateClient", result, null);
}

export async function deleteClient(id, proprietarioId) {
  if (!id) {
    const message = "ID do cliente é obrigatório.";
    console.error("[Clientes] deleteClient:", message);
    return { data: null, error: message };
  }

  let query = supabase
    .from(TABLE)
    .delete({ returning: "representation" })
    .eq("id", id);
  query = withOwner(query, proprietarioId);

  const result = await query.select().maybeSingle();
  return handleResult("deleteClient", result, null);
}
