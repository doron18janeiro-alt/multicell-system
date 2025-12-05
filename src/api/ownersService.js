import { supabase } from "../lib/supabaseClient";

/**
 * Tabela: public.proprietarios
 * Colunas: id (uuid), nome (text), cpf (text), created_at (opcional), updated_at (opcional)
 */

export async function listOwners({ search = "" } = {}) {
  let query = supabase
    .from("proprietarios")
    .select("*")
    .order("nome", { ascending: true });

  if (search) {
    query = query.ilike("nome", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[ownersService.listOwners] Erro:", error);
    throw error;
  }

  return data ?? [];
}

export async function getOwnerById(id) {
  const { data, error } = await supabase
    .from("proprietarios")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[ownersService.getOwnerById] Erro:", error);
    throw error;
  }

  return data;
}

export async function createOwner({ nome, cpf }) {
  const { data, error } = await supabase
    .from("proprietarios")
    .insert([{ nome, cpf }])
    .select()
    .maybeSingle();

  if (error) {
    console.error("[ownersService.createOwner] Erro:", error);
    throw error;
  }

  return data;
}

export async function updateOwner(id, { nome, cpf }) {
  const { data, error } = await supabase
    .from("proprietarios")
    .update({ nome, cpf })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("[ownersService.updateOwner] Erro:", error);
    throw error;
  }

  return data;
}

export async function deleteOwner(id) {
  const { error } = await supabase.from("proprietarios").delete().eq("id", id);

  if (error) {
    console.error("[ownersService.deleteOwner] Erro:", error);
    throw error;
  }

  return true;
}
