/*
 * Camada centralizada para relatórios e métricas.
 * Caso seja necessário migrar para Edge Functions futuramente, basta substituir
 * as chamadas `supabase.rpc`/`supabase.from` por `fetch('/functions/v1/...')`
 * mantendo a mesma assinatura. Assim isolamos o frontend de mudanças de
 * infraestrutura.
 */

import { supabase } from "./supabaseClient";

const paymentOptions = new Set(["dinheiro", "cartao", "pix", "outro"]);

const normalizeFormaPagamento = (value) => {
  if (typeof value !== "string") return "outro";
  const normalized = value.toLowerCase();
  return paymentOptions.has(normalized) ? normalized : "outro";
};

const emptyResumoVendas = () => ({
  total: 0,
  quantidade: 0,
  porPagamento: {
    dinheiro: 0,
    cartao: 0,
    pix: 0,
    outro: 0,
  },
});

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
      "id,criado_em,forma_pagamento,total_liquido,total_bruto,total,cliente:clientes(nome)",
      { count: "exact" }
    )
    .eq("proprietario_id", proprietarioId)
    .gte("criado_em", inicioPeriodo)
    .order("criado_em", { ascending: false })
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

export async function obterResumoVendas(
  ownerId,
  { dataInicial, dataFinal } = {}
) {
  if (!ownerId) {
    return {
      data: emptyResumoVendas(),
      error: new Error("Sessão expirada."),
    };
  }

  let query = supabase
    .from("vendas")
    .select(
      "total_liquido,total_bruto,total,desconto,forma_pagamento,criado_em"
    )
    .eq("proprietario_id", ownerId)
    .order("criado_em", { ascending: false });

  if (dataInicial) {
    query = query.gte("criado_em", dataInicial);
  }

  if (dataFinal) {
    const end = new Date(dataFinal);
    if (!Number.isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);
      query = query.lte("criado_em", end.toISOString());
    } else {
      query = query.lte("criado_em", dataFinal);
    }
  }

  const { data, error } = await query;

  const resumo = emptyResumoVendas();

  if (error) {
    console.error("[relatorios] resumo_vendas", error);
    return { data: resumo, error };
  }

  const rows = data || [];
  resumo.quantidade = rows.length;

  rows.forEach((row) => {
    const valor =
      Number(row.total_liquido ?? row.total_bruto ?? row.total ?? 0) || 0;
    resumo.total += valor;
    const pagamento = normalizeFormaPagamento(row.forma_pagamento);
    resumo.porPagamento[pagamento] += valor;
  });

  return { data: resumo, error: null };
}

export async function obterResumoMensal(proprietarioId) {
  const inicioMes = startOfMonth().toISOString();

  const { data, error } = await supabase
    .from("vendas")
    .select(
      "id,total_bruto,total_liquido,total,desconto,criado_em,forma_pagamento"
    )
    .eq("proprietario_id", proprietarioId)
    .gte("criado_em", inicioMes);

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
