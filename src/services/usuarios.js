import { supabase } from "@/services/supabaseClient";

const OWNER_TABLE = "proprietarios";

const handleResult = (label, { data, error }, fallback = null) => {
  if (error) {
    const message = error.message || `Erro em ${label}`;
    console.error(`[Usuarios] ${label}:`, message);
    return { data: fallback, error: message };
  }
  return { data: data ?? fallback, error: null };
};

export async function listOwners({ search = "" } = {}) {
  let query = supabase
    .from(OWNER_TABLE)
    .select("*")
    .order("nome", { ascending: true });

  if (search?.trim()) {
    query = query.ilike("nome", `%${search.trim()}%`);
  }

  const result = await query;
  return handleResult("listOwners", result, []);
}

export async function getOwnerById(id) {
  if (!id) {
    const message = "ID é obrigatório.";
    console.error("[Usuarios] getOwnerById:", message);
    return { data: null, error: message };
  }

  const result = await supabase
    .from(OWNER_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return handleResult("getOwnerById", result, null);
}

export async function createOwner({ nome, cpf }) {
  const payload = {
    nome: nome?.trim() || "",
    cpf: cpf?.trim() || null,
  };

  if (!payload.nome) {
    const message = "Nome é obrigatório.";
    console.error("[Usuarios] createOwner:", message);
    return { data: null, error: message };
  }

  const result = await supabase
    .from(OWNER_TABLE)
    .insert(payload, { returning: "representation" })
    .select()
    .maybeSingle();

  return handleResult("createOwner", result, null);
}

export async function updateOwner(id, { nome, cpf }) {
  if (!id) {
    const message = "ID é obrigatório.";
    console.error("[Usuarios] updateOwner:", message);
    return { data: null, error: message };
  }

  const payload = {
    nome: nome?.trim() || null,
    cpf: cpf?.trim() || null,
  };

  const result = await supabase
    .from(OWNER_TABLE)
    .update(payload, { returning: "representation" })
    .eq("id", id)
    .select()
    .maybeSingle();

  return handleResult("updateOwner", result, null);
}

export async function deleteOwner(id) {
  if (!id) {
    const message = "ID é obrigatório.";
    console.error("[Usuarios] deleteOwner:", message);
    return { data: null, error: message };
  }

  const result = await supabase
    .from(OWNER_TABLE)
    .delete({ returning: "representation" })
    .eq("id", id)
    .select()
    .maybeSingle();

  return handleResult("deleteOwner", result, null);
}
