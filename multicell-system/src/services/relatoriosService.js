/*
 * Camada centralizada para relatórios e métricas.
 * Caso seja necessário migrar para Edge Functions futuramente, basta substituir
 * as chamadas `supabase.rpc`/`supabase.from` por `fetch('/functions/v1/...')`
 * mantendo a mesma assinatura. Assim isolamos o frontend de mudanças de
 * infraestrutura.
 */

import { supabase } from "./supabaseClient";

const SOMA_SETEDIAS_MS = 6 * 24 * 60 * 60 * 1000;

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfMonth = () => {
  const now = new Date();
  now.setDate(1);
  return startOfDay(now);
};

export async function obterFaturamentoDiario(proprietarioId) {
  const { data, error } = await supabase.rpc("faturamento_diario", {
    proprietario: proprietarioId,
  });

  if (error) {
    console.error("[relatorios] faturamento_diario", error);
    throw error;
  }

  return (data || []).map((item) => ({
    dia: item.dia ?? item.date ?? item.day,
    total: Number(item.total) || 0,
  }));
}

export async function obterTopProdutos(proprietarioId) {
  const { data, error } = await supabase.rpc("top_produtos", {
    proprietario: proprietarioId,
  });

  if (error) {
    console.error("[relatorios] top_produtos", error);
    throw error;
  }

  return (data || []).map((item) => ({
    produto: item.produto || item.nome || item.descricao || "Produto",
    quantidade: Number(item.quantidade || item.qtd) || 0,
  }));
}

export async function obterVendasRecentes(proprietarioId) {
  const inicioPeriodo = startOfDay(
    new Date(Date.now() - SOMA_SETEDIAS_MS)
  ).toISOString();

  const { data, error, count } = await supabase
    .from("vendas")
    .select(
      "id,data_venda,forma_pagamento,total_liquido,cliente:clientes(nome)",
      { count: "exact" }
    )
    .eq("proprietario_id", proprietarioId)
    .gte("data_venda", inicioPeriodo)
    .order("data_venda", { ascending: false })
    .limit(10);

  if (error) {
    console.error("[relatorios] vendas_recentes", error);
    throw error;
  }

  return {
    periodoInicio: inicioPeriodo,
    total: count || 0,
    itens: data || [],
  };
}

export async function obterResumoMensal(proprietarioId) {
  const inicioMes = startOfMonth().toISOString();

  const { data, error } = await supabase
    .from("vendas")
    .select("id,total_bruto,total_liquido,desconto,data_venda,forma_pagamento")
    .eq("proprietario_id", proprietarioId)
    .gte("data_venda", inicioMes);

  if (error) {
    console.error("[relatorios] resumo_mensal", error);
    throw error;
  }

  const totalLiquido = (data || []).reduce(
    (acc, venda) => acc + (Number(venda.total_liquido) || 0),
    0
  );
  const totalBruto = (data || []).reduce(
    (acc, venda) => acc + (Number(venda.total_bruto) || 0),
    0
  );
  const descontos = (data || []).reduce(
    (acc, venda) => acc + (Number(venda.desconto) || 0),
    0
  );
  const quantidade = data?.length || 0;
  const ticketMedio = quantidade ? totalLiquido / quantidade : 0;

  return {
    inicioMes,
    totalLiquido,
    totalBruto,
    descontos,
    quantidade,
    ticketMedio,
  };
}

export function faturamentoDiario(id) {
  return supabase.rpc("faturamento_diario", { proprietario: id });
}

export function topProdutos(id) {
  return supabase.rpc("top_produtos", { proprietario: id });
}

/*
 * Migração futura para Edge Functions:
 * 1. Substitua a chamada `supabase.rpc('faturamento_diario', { loja })` por
 *    `await fetch('/functions/v1/faturamento_diario', { method: 'POST', body: JSON.stringify({ proprietarioId }) })`.
 * 2. Faça o mesmo para as demais funções, mantendo o retorno no mesmo formato
 *    ({ itens, total, etc. }) para não romper o restante da aplicação.
 * 3. Centralizar a mudança aqui garante que nenhuma tela precise ser alterada.
 */
