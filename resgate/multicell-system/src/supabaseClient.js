import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://utcaazucxyxoxofoltsb.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y2FhenVjeHl4b3hvZm9sdHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjA2MzIsImV4cCI6MjA4MDE5NjYzMn0.i_dsj6OSpeS3YikrdsWQcfi9ejSEuezlOafcpbYEnA0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function carregarProdutos() {
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

export async function criarProduto(dados) {
  const payload = {
    nome: dados.nome,
    categoria: dados.categoria,
    quantidade: Number(dados.quantidade) || 0,
    preco_compra: Number(dados.preco_compra || dados.precoCompra) || 0,
    preco_venda: Number(dados.preco_venda || dados.precoVenda) || 0,
    foto_url: dados.foto_url || dados.imagem || null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("produtos")
    .insert([payload])
    .select()
    .single();
  if (error) {
    console.error("Erro ao criar produto:", error.message);
    return null;
  }
  return data;
}

export async function carregarVendas() {
  const { data, error } = await supabase
    .from("vendas")
    .select("*")
    .order("data", { ascending: false });
  if (error) {
    console.error("Erro ao carregar vendas:", error.message);
    return [];
  }
  return data || [];
}

export async function registrarVenda(itens, pagamento) {
  if (!itens?.length) return null;
  const total = itens.reduce(
    (sum, item) =>
      sum +
      (Number(item.preco_venda ?? item.precoVenda ?? 0) || 0) *
        (Number(item.quantidade) || 0),
    0
  );

  const vendaPayload = {
    itens,
    pagamento,
    total,
    data: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("vendas").insert([vendaPayload]).select().single();
  if (error) {
    console.error("Erro ao registrar venda:", error.message);
    return null;
  }

  // Atualiza estoque
  for (const item of itens) {
    const novaQuantidade = Math.max(
      0,
      (Number(item.quantidadeDisponivel) ||
        Number(item.quantidadeEstoque) ||
        Number(item.quantidadeEstoqueAtual) ||
        0) - Number(item.quantidade || 0)
    );
    await supabase.from("produtos").update({ quantidade: novaQuantidade }).eq("id", item.id);
  }

  return data;
}

export async function atualizarProduto(id, patch) {
  const payload = {
    ...patch,
    preco_compra: patch.preco_compra ?? patch.precoCompra,
    preco_venda: patch.preco_venda ?? patch.precoVenda,
    foto_url: patch.foto_url ?? patch.imagem,
  };
  delete payload.precoCompra;
  delete payload.precoVenda;
  delete payload.imagem;
  const { data, error } = await supabase.from("produtos").update(payload).eq("id", id).select().single();
  if (error) {
    console.error("Erro ao atualizar produto:", error.message);
    throw error;
  }
  return data;
}

export async function deletarProduto(id) {
  const { error } = await supabase.from("produtos").delete().eq("id", id);
  if (error) {
    console.error("Erro ao deletar produto:", error.message);
    throw error;
  }
}

export function subscribeRealtime(onProdutos, onVendas) {
  const channel = supabase.channel("multicell-realtime");
  if (onProdutos) {
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "produtos" },
      onProdutos
    );
  }
  if (onVendas) {
    channel.on("postgres_changes", { event: "*", schema: "public", table: "vendas" }, onVendas);
  }
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}

export async function uploadOSPhotos(files = []) {
  const bucket = supabase.storage.from("os_fotos");
  const urls = [];
  for (const file of files) {
    const fileExt = file.name.split(".").pop();
    const path = `os-${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadError } = await bucket.upload(path, file, { upsert: true });
    if (uploadError) {
      console.error("Erro ao subir foto OS:", uploadError.message);
      continue;
    }
    const { data } = bucket.getPublicUrl(path);
    if (data?.publicUrl) urls.push(data.publicUrl);
  }
  return urls;
}

export async function listarOS() {
  const { data, error } = await supabase
    .from("os")
    .select("*")
    .order("data_abertura", { ascending: false });
  if (error) {
    console.error("Erro ao carregar OS:", error.message);
    return [];
  }
  return data || [];
}

export async function criarOS(payload) {
  const { data, error } = await supabase.from("os").insert([payload]).select().single();
  if (error) {
    console.error("Erro ao criar OS:", error.message);
    return null;
  }
  return data;
}

export async function atualizarStatusOS(id, status) {
  const { error } = await supabase.from("os").update({ status }).eq("id", id);
  if (error) {
    console.error("Erro ao atualizar status OS:", error.message);
  }
}

export function subscribeRealtimeOS(onOS) {
  const channel = supabase.channel("multicell-os-realtime");
  if (onOS) {
    channel.on("postgres_changes", { event: "*", schema: "public", table: "os" }, onOS);
  }
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}

export const OS_TABLE_SQL = `
create extension if not exists "uuid-ossp";
create table public.os (
  id uuid primary key default uuid_generate_v4(),
  protocolo text,
  criado_em timestamp with time zone default now(),
  nome_cliente text,
  telefone text,
  aparelho text,
  senha_aparelho text,
  defeito_relatado text,
  defeito_constatado text,
  acessorios jsonb,
  estado_aparelho text,
  valor numeric,
  entrada numeric,
  previsao_entrega text,
  tecnico text,
  status text,
  fotos text[]
);
`;

// -------- Service Orders (service_orders) --------
export async function listarServiceOrders() {
  const { data, error } = await supabase
    .from("service_orders")
    .select("*")
    .order("data_abertura", { ascending: false });
  if (error) {
    console.error("Erro ao listar service_orders:", error.message);
    return [];
  }
  return data || [];
}

export async function criarServiceOrder(body) {
  const { data, error } = await supabase.from("service_orders").insert([body]).select().single();
  if (error) {
    console.error("Erro ao criar service_order:", error.message);
    return null;
  }
  return data;
}

export async function concluirServiceOrder(id) {
  const data_fechamento = new Date().toISOString();
  const { data, error } = await supabase
    .from("service_orders")
    .update({ status: "Concluido", data_fechamento })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("Erro ao concluir service_order:", error.message);
    return null;
  }
  return data;
}

export async function criarVendaServico(os) {
  const payload = {
    id_os: os.id,
    descricao: `Servico: ${os.servico}`,
    valor: Number(os.valor) || 0,
    pagamento: "Pendente",
    data: new Date().toISOString(),
  };
  const { error } = await supabase.from("vendas").insert([payload]);
  if (error) console.error("Erro ao gerar venda do servico:", error.message);
}

export async function carregarSettings() {
  const { data, error } = await supabase.from("settings").select("*").limit(1).single();
  if (error) {
    console.error("Erro ao carregar settings:", error.message);
    return null;
  }
  return data;
}

async function fetchAllServiceOrders() {
  const { data, error } = await supabase.from("service_orders").select("*");
  if (error) {
    console.error("Erro ao obter servicos:", error.message);
    return [];
  }
  return data || [];
}

export async function totalServicosMes() {
  const servicos = await fetchAllServiceOrders();
  const mes = new Date().getMonth();
  return servicos.filter((s) => new Date(s.data_abertura || s.data).getMonth() === mes).length;
}

export async function totalFaturadoServicos() {
  const servicos = await fetchAllServiceOrders();
  return servicos
    .filter((s) => s.status === "Concluido" || s.status === "Concluido")
    .reduce((sum, s) => sum + (Number(s.valor) || 0), 0);
}

export async function servicosAbertos() {
  const servicos = await fetchAllServiceOrders();
  return servicos.filter((s) => (s.status || "").toLowerCase() === "aberto").length;
}

export async function servicosConcluidos() {
  const servicos = await fetchAllServiceOrders();
  return servicos.filter((s) => (s.status || "").toLowerCase().includes("concluido")).length;
}
