import { supabase } from "./services/supabaseClient";

const safeDate = () => new Date().toISOString();

export { supabase };

export async function loadProdutos() {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Erro ao carregar produtos:", error.message);
    return [];
  }
  return data || [];
}

export async function createProduto(payload) {
  const body = {
    ...payload,
    created_at: safeDate(),
  };
  const { data, error } = await supabase.from("produtos").insert(body).select().single();
  if (error) {
    console.error("Erro ao criar produto:", error.message);
    return null;
  }
  return data;
}

export async function updateProduto(id, patch) {
  const { data, error } = await supabase.from("produtos").update(patch).eq("id", id).select().single();
  if (error) {
    console.error("Erro ao atualizar produto:", error.message);
    return null;
  }
  return data;
}

export async function deleteProduto(id) {
  const { error } = await supabase.from("produtos").delete().eq("id", id);
  if (error) console.error("Erro ao excluir produto:", error.message);
}

export async function loadVendas() {
  const { data, error } = await supabase
    .from("vendas")
    .select("*")
    .order("data_hora", { ascending: false });
  if (error) {
    console.error("Erro ao carregar vendas:", error.message);
    return [];
  }
  return data || [];
}

export async function createVenda(venda, itensParaEstoque = []) {
  const body = {
    ...venda,
    data_hora: venda.data_hora || safeDate(),
    created_at: safeDate(),
  };
  const { data, error } = await supabase.from("vendas").insert(body).select().single();
  if (error) {
    console.error("Erro ao registrar venda:", error.message);
    return null;
  }
  for (const item of itensParaEstoque) {
    if (!item.id) continue;
    await supabase.rpc("decrementar_estoque", {
      pid: item.id,
      qtd: item.quantidade || 0,
    });
  }
  return data;
}

export async function loadOrdens() {
  const { data, error } = await supabase
    .from("ordens")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Erro ao carregar ordens:", error.message);
    return [];
  }
  return data || [];
}

export async function createOrdem(payload) {
  const body = { ...payload, created_at: safeDate() };
  const { data, error } = await supabase.from("ordens").insert(body).select().single();
  if (error) {
    console.error("Erro ao criar OS:", error.message);
    return null;
  }
  return data;
}

export async function updateOrdem(id, patch) {
  const { data, error } = await supabase.from("ordens").update(patch).eq("id", id).select().single();
  if (error) console.error("Erro ao atualizar OS:", error.message);
  return data;
}

export async function loadConfiguracao() {
  const { data, error } = await supabase.from("configuracoes").select("*").limit(1).single();
  if (error) {
    console.error("Erro ao carregar configuracoes:", error.message);
    return null;
  }
  return data;
}

export async function saveConfiguracao(cfg) {
  if (cfg.id) {
    const { error } = await supabase.from("configuracoes").update(cfg).eq("id", cfg.id);
    if (error) console.error("Erro ao salvar configuracoes:", error.message);
  } else {
    const { error } = await supabase.from("configuracoes").insert(cfg);
    if (error) console.error("Erro ao salvar configuracoes:", error.message);
  }
}

export async function loadHistoricoVendas(periodo = {}) {
  const { inicio, fim } = periodo;
  let query = supabase.from("vendas").select("*").order("data_hora", { ascending: false });
  if (inicio) query = query.gte("data_hora", inicio);
  if (fim) query = query.lte("data_hora", fim);
  const { data, error } = await query;
  if (error) {
    console.error("Erro ao carregar historico:", error.message);
    return [];
  }
  return data || [];
}
