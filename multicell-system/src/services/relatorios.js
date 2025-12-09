import { supabase } from "@/services/supabaseClient";

const paymentOptions = new Set(["dinheiro", "cartao", "pix", "outro"]);

const normalizeFormaPagamento = (value) => {
  if (typeof value !== "string") return "outro";
  const normalized = value.toLowerCase();
  return paymentOptions.has(normalized) ? normalized : "outro";
};

const emptyResumoVendas = () => ({
  total: 0,
  quantidade: 0,
  desconto: 0,
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

const handleResult = (label, { data, error }, fallback = null) => {
  if (error) {
    const message = error.message || `Erro em ${label}`;
    console.error("Relatorios:erro", message);
    return { data: fallback, error: message };
  }
  return { data: data ?? fallback, error: null };
};

export async function obterFaturamentoDiario(proprietarioId) {
  const result = await supabase.rpc("faturamento_diario", {
    proprietario: proprietarioId,
  });

  const mapped = (result.data || []).map((item) => ({
    dia: item.dia ?? item.date ?? item.day,
    total: Number(item.total) || 0,
  }));

  return handleResult(
    "obterFaturamentoDiario",
    { ...result, data: mapped },
    []
  );
}

export async function obterTopProdutos(proprietarioId) {
  const result = await supabase.rpc("top_produtos", {
    proprietario: proprietarioId,
  });

  const mapped = (result.data || []).map((item) => ({
    produto: item.produto || item.nome || item.descricao || "Produto",
    quantidade: Number(item.quantidade || item.qtd) || 0,
  }));

  return handleResult("obterTopProdutos", { ...result, data: mapped }, []);
}

export async function obterVendasRecentes(proprietarioId) {
  const inicioPeriodo = startOfDay(
    new Date(Date.now() - SOMA_SETEDIAS_MS)
  ).toISOString();

  const { data, error } = await supabase.rpc("vendas_recentes", {
    proprietario: proprietarioId,
    data_inicio: inicioPeriodo,
    limite: 10,
  });

  if (error) {
    console.error("vendas_recentes erro:", error.message);
    return { data: null, error };
  }

  const itens = (data || []).map((item) => ({
    id: item.id,
    data: item.data || item.data_venda || item.criado_em,
    data_venda: item.data_venda || item.data,
    criado_em: item.criado_em,
    forma_pagamento: item.forma_pagamento,
    valor_total: item.total || item.total_bruto || item.total_liquido,
    total_liquido: item.total_liquido,
    total_bruto: item.total_bruto,
    total: item.total,
    desconto: item.desconto,
    cliente_nome: item.cliente_nome,
  }));

  const payload = {
    periodoInicio: inicioPeriodo,
    total: itens.length,
    itens,
  };

  return { data: payload, error: null };
}

export async function obterResumoVendas(
  ownerId,
  { dataInicial, dataFinal } = {}
) {
  if (!ownerId) {
    const message = "Sessão expirada.";
    console.error("[Relatorios] obterResumoVendas:", message);
    return {
      data: emptyResumoVendas(),
      error: message,
    };
  }

  const end = dataFinal ? new Date(dataFinal) : null;
  const dataFim =
    end && !Number.isNaN(end.getTime())
      ? new Date(end.setHours(23, 59, 59, 999)).toISOString()
      : dataFinal || null;

  const { data, error } = await supabase.rpc("vendas_resumo", {
    proprietario: ownerId,
    data_inicio: dataInicial || null,
    data_fim: dataFim,
  });

  if (error) {
    console.error("vendas_resumo erro:", error.message);
    return { data: null, error };
  }

  const resumo = emptyResumoVendas();
  const row = data?.[0];

  if (row) {
    resumo.quantidade = Number(row.quantidade) || 0;
    resumo.total =
      Number(row.total_liquido ?? row.total_bruto ?? row.total ?? 0) || 0;
    const pagamentos = row.por_pagamento || {};
    resumo.porPagamento = {
      dinheiro: Number(pagamentos.dinheiro) || 0,
      cartao: Number(pagamentos.cartao) || 0,
      pix: Number(pagamentos.pix) || 0,
      outro: Number(pagamentos.outro) || 0,
    };
    resumo.desconto = Number(row.total_desconto) || 0;
  }

  return { data: resumo, error: null };
}

export async function obterResumoMensal(proprietarioId) {
  const inicioMes = startOfMonth().toISOString();
  const { data, error } = await supabase.rpc("vendas_mensal", {
    proprietario: proprietarioId,
    referencia: inicioMes,
  });

  if (error) {
    console.error("vendas_mensal erro:", error.message);
    return { data: null, error };
  }

  const row = data?.[0];
  const quantidade = Number(row?.quantidade) || 0;
  const totalValor =
    Number(row?.total_liquido ?? row?.total_bruto ?? row?.total ?? 0) || 0;
  const descontos = Number(row?.total_desconto) || 0;
  const ticketMedio = quantidade ? totalValor / quantidade : 0;

  return {
    data: {
      inicioMes,
      totalValor,
      descontos,
      quantidade,
      ticketMedio,
      totalLiquido: totalValor,
    },
    error: null,
  };
}

export async function faturamentoDiario(id) {
  const result = await supabase.rpc("faturamento_diario", { proprietario: id });
  return handleResult("faturamentoDiario", result, result.data || []);
}

export async function topProdutos(id) {
  const result = await supabase.rpc("top_produtos", { proprietario: id });
  return handleResult("topProdutos", result, result.data || []);
}

export async function obterDashboardTotais(proprietarioId, dias = 7) {
  const { data: rpcData, error } = await supabase.rpc("dashboard_totais", {
    proprietario: proprietarioId,
    dias,
  });

  if (error) {
    console.error("dashboard_totais erro:", error.message);
    return { data: null, error };
  }

  const row = rpcData?.[0] || {};
  const payload = {
    total_clientes: Number(row.total_clientes) || 0,
    total_produtos: Number(row.total_produtos) || 0,
    total_vendas: Number(row.total_vendas) || 0,
    total_liquido: Number(row.total_liquido) || 0,
    ticket_medio: Number(row.ticket_medio) || 0,
    faturamento_hoje: Number(row.faturamento_hoje) || 0,
    faturamento_periodo: Number(row.faturamento_periodo) || 0,
    estoque_baixo: Number(row.estoque_baixo) || 0,
    os_abertas: Number(row.os_abertas) || 0,
    despesas_abertas: Number(row.despesas_abertas) || 0,
  };

  return { data: payload, error: null };
}

export async function obterEstoqueResumo(proprietarioId) {
  const { data: rpcData, error } = await supabase.rpc("estoque_resumo", {
    proprietario: proprietarioId,
  });

  if (error) {
    console.error("estoque_resumo erro:", error.message);
    return { data: null, error };
  }

  const row = rpcData?.[0] || {};
  const payload = {
    total_produtos: Number(row.total_produtos) || 0,
    ativos: Number(row.ativos) || 0,
    estoque_total: Number(row.estoque_total) || 0,
    estoque_baixo: Number(row.estoque_baixo) || 0,
    valor_total_estocado: Number(row.valor_total_estocado) || 0,
  };

  return { data: payload, error: null };
}

export async function obterEstoqueAlertas(proprietarioId, limite = 10) {
  const { data: rpcData, error } = await supabase.rpc("estoque_alertas", {
    proprietario: proprietarioId,
    limite,
  });

  if (error) {
    console.error("estoque_alertas erro:", error.message);
    return { data: null, error };
  }

  const itens = (rpcData || []).map((row) => ({
    id: row.id,
    nome: row.nome,
    quantidade: row.quantidade,
    estoque_minimo: row.estoque_minimo,
    categoria: row.categoria,
    preco_venda: row.preco_venda,
  }));

  return { data: itens, error: null };
}

export async function obterFluxoFinanceiro(
  proprietarioId,
  { dataInicial, dataFinal } = {}
) {
  const end = dataFinal ? new Date(dataFinal) : null;
  const dataFim =
    end && !Number.isNaN(end.getTime())
      ? new Date(end.setHours(23, 59, 59, 999)).toISOString()
      : dataFinal || null;

  const { data: rpcData, error } = await supabase.rpc("financeiro_fluxo", {
    proprietario: proprietarioId,
    data_inicio: dataInicial || null,
    data_fim: dataFim,
  });

  if (error) {
    console.error("financeiro_fluxo erro:", error.message);
    return { data: null, error };
  }

  const row = rpcData?.[0] || {};
  const payload = {
    entradas: Number(row.entradas) || 0,
    saidas: Number(row.saidas) || 0,
    saldo: Number(row.saldo) || 0,
  };

  return { data: payload, error: null };
}
