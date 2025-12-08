import { supabase } from "./services/supabaseClient";

const safeDate = () => new Date().toISOString();
const withOwner = (ownerId) => (ownerId ? { usuario_id: ownerId } : {});

export { supabase };

const handleError = (label, error) => {
  if (!error) return null;
  console.error(`[Supabase] ${label}`, error);
  return error;
};

export async function loadProdutos(ownerId) {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .match(withOwner(ownerId))
    .order("created_at", { ascending: false });
  handleError("carregar produtos", error);
  return data || [];
}

export async function createProduto(payload, ownerId) {
  const body = {
    ...payload,
    created_at: safeDate(),
    ...withOwner(ownerId),
  };
  const { data, error } = await supabase
    .from("produtos")
    .insert(body)
    .select()
    .single();
  handleError("criar produto", error);
  return data;
}

export async function updateProduto(id, patch, ownerId) {
  const { data, error } = await supabase
    .from("produtos")
    .update({ ...patch, updated_at: safeDate() })
    .eq("id", id)
    .match(withOwner(ownerId))
    .select()
    .single();
  handleError("atualizar produto", error);
  return data;
}

export async function deleteProduto(id, ownerId) {
  const { error } = await supabase
    .from("produtos")
    .delete()
    .eq("id", id)
    .match(withOwner(ownerId));
  handleError("excluir produto", error);
}

export async function loadVendas(ownerId, { inicio, fim, limite = 50 } = {}) {
  let query = supabase
    .from("vendas")
    .select("*")
    .match(withOwner(ownerId))
    .order("created_at", { ascending: false })
    .limit(limite);

  if (inicio) query = query.gte("created_at", inicio);
  if (fim) query = query.lte("created_at", fim);

  const { data, error } = await query;
  handleError("carregar vendas", error);
  return data || [];
}

export async function createVenda(venda, itensParaEstoque = [], ownerId) {
  const body = {
    ...venda,
    created_at: venda?.created_at || safeDate(),
    ...withOwner(ownerId),
  };
  const { data, error } = await supabase
    .from("vendas")
    .insert(body)
    .select()
    .single();
  if (handleError("registrar venda", error)) return null;

  for (const item of itensParaEstoque) {
    if (!item.id) continue;
    await supabase.rpc("decrementar_estoque", {
      pid: item.id,
      qtd: item.quantidade || 0,
    });
  }
  return data;
}

export async function loadOrdens(ownerId, { search } = {}) {
  let query = supabase
    .from("os")
    .select("*")
    .match(withOwner(ownerId))
    .order("data_entrada", { ascending: false });

  if (search) {
    const safe = search.trim();
    if (safe) {
      query = query.or(
        `cliente_nome.ilike.%${safe}%,aparelho.ilike.%${safe}%,imei.ilike.%${safe}%`
      );
    }
  }

  const { data, error } = await query;
  handleError("carregar OS", error);
  return data || [];
}

export async function createOrdem(payload, ownerId) {
  const body = {
    ...payload,
    data_entrada: payload?.data_entrada || safeDate(),
    status: payload?.status || "aberta",
    ...withOwner(ownerId),
  };
  const { data, error } = await supabase
    .from("os")
    .insert(body)
    .select()
    .single();
  handleError("criar OS", error);
  return data;
}

export async function updateOrdem(id, patch, ownerId) {
  const { data, error } = await supabase
    .from("os")
    .update({ ...patch, updated_at: safeDate() })
    .eq("id", id)
    .match(withOwner(ownerId))
    .select()
    .single();
  handleError("atualizar OS", error);
  return data;
}

export async function loadConfiguracao(ownerId) {
  const { data, error } = await supabase
    .from("configuracoes")
    .select("*")
    .match(withOwner(ownerId))
    .limit(1)
    .single();
  handleError("carregar configuracoes", error);
  return data;
}

export async function saveConfiguracao(cfg, ownerId) {
  const body = { ...cfg, ...withOwner(ownerId) };
  if (cfg.id) {
    const { error } = await supabase
      .from("configuracoes")
      .update(body)
      .eq("id", cfg.id)
      .match(withOwner(ownerId));
    handleError("salvar configuracoes", error);
  } else {
    const { error } = await supabase.from("configuracoes").insert(body);
    handleError("salvar configuracoes", error);
  }
}

export async function loadHistoricoVendas(ownerId, periodo = {}) {
  const { inicio, fim } = periodo;
  let query = supabase
    .from("vendas")
    .select("*")
    .match(withOwner(ownerId))
    .order("created_at", { ascending: false });
  if (inicio) query = query.gte("created_at", inicio);
  if (fim) query = query.lte("created_at", fim);
  const { data, error } = await query;
  handleError("historico de vendas", error);
  return data || [];
}
