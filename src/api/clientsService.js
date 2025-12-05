import { supabase } from "../lib/supabaseClient";

/**
 * Tabela: public.clientes
 * Colunas: id (uuid), nome, telefone, email, cpf, proprietario_id, updated_at (timestamp)
 * O link proprietário_id pode ser definido:
 *   - Pelo backfill
 *   - Pela função que fizemos no banco
 */

export async function listClients({ search = "" } = {}) {
  let query = supabase
    .from("clientes")
    .select("*")
    .order("nome", { ascending: true });

  if (search) {
    // pesquisa simples por nome, cpf ou telefone
    query = query.or(
      `nome.ilike.%${search}%,cpf.ilike.%${search}%,telefone.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("[clientsService.listClients] Erro:", error);
    throw error;
  }

  return data ?? [];
}

export async function getClientById(id) {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[clientsService.getClientById] Erro:", error);
    throw error;
  }

  return data;
}

export async function createClient({ nome, telefone, email, cpf }) {
  const { data, error } = await supabase
    .from("clientes")
    .insert([
      {
        nome,
        telefone,
        email,
        cpf,
        // proprietario_id pode ficar NULL e o banco resolve
      },
    ])
    .select()
    .maybeSingle();

  if (error) {
    console.error("[clientsService.createClient] Erro:", error);
    throw error;
  }

  return data;
}

export async function updateClient(id, { nome, telefone, email, cpf }) {
  const { data, error } = await supabase
    .from("clientes")
    .update({ nome, telefone, email, cpf })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("[clientsService.updateClient] Erro:", error);
    throw error;
  }

  return data;
}

export async function deleteClient(id) {
  const { error } = await supabase.from("clientes").delete().eq("id", id);

  if (error) {
    console.error("[clientsService.deleteClient] Erro:", error);
    throw error;
  }

  return true;
}
