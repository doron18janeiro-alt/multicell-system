import { supabase } from "./supabaseClient";

const withOwnerFilter = (query, proprietarioId) =>
  proprietarioId ? query.eq("proprietario_id", proprietarioId) : query;

const paymentOptions = new Set(["dinheiro", "cartao", "pix", "outro"]);

const normalizeFormaPagamento = (value) => {
  if (typeof value !== "string") return "outro";
  const normalized = value.toLowerCase();
  return paymentOptions.has(normalized) ? normalized : "outro";
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function sanitizeItens(itens = []) {
  return itens
    .map((item, index) => {
      const quantidade = Math.max(0, Math.trunc(toNumber(item.quantidade, 0)));
      const precoUnitario = Math.max(
        0,
        Number(
          toNumber(item.preco_unitario ?? item.precoUnitario, 0).toFixed(2)
        )
      );
      const descricao = (
        item.descricao ||
        item.nome ||
        `Item ${index + 1}`
      ).trim();

      if (!quantidade || !precoUnitario || !descricao) return null;

      const subtotal = Number((quantidade * precoUnitario).toFixed(2));

      return {
        produto_id: item.produto_id || item.produtoId || null,
        descricao,
        quantidade,
        preco_unitario: precoUnitario,
        subtotal,
      };
    })
    .filter(Boolean);
}

export async function createVenda(
  proprietarioId,
  { cabecalho = {}, itens = [] } = {}
) {
  if (!proprietarioId) {
    return { error: new Error("proprietarioId é obrigatório."), data: null };
  }
  const itensSanitizados = sanitizeItens(itens);

  if (!itensSanitizados.length) {
    return {
      error: new Error(
        "Adicione ao menos um item válido antes de salvar a venda."
      ),
    };
  }

  const total = itensSanitizados.reduce((sum, item) => sum + item.subtotal, 0);

  const payload = {
    data: cabecalho.data || new Date().toISOString(),
    cliente_nome: cabecalho.cliente_nome?.trim() || null,
    total,
    forma_pagamento: normalizeFormaPagamento(cabecalho.forma_pagamento),
    observacoes: cabecalho.observacoes?.trim() || null,
    proprietario_id: proprietarioId,
  };

  const { data: venda, error: vendaError } = await supabase
    .from("vendas")
    .insert(payload)
    .select()
    .single();

  if (vendaError) {
    console.error("[CaixaService] Falha ao criar venda", vendaError);
    return { error: vendaError };
  }

  const itensPayload = itensSanitizados.map((item) => ({
    ...item,
    venda_id: venda.id,
  }));

  const { data: itensData, error: itensError } = await supabase
    .from("itens_venda")
    .insert(itensPayload)
    .select();

  if (itensError) {
    console.error("[CaixaService] Falha ao inserir itens da venda", itensError);
    await supabase.from("vendas").delete().eq("id", venda.id);
    return { error: itensError };
  }

  const movimentoPayload = {
    proprietario_id: proprietarioId,
    tipo: "entrada",
    descricao: cabecalho.observacoes?.trim() || "Venda registrada no caixa",
    valor: total,
    data: payload.data,
  };

  const { error: movimentoError } = await supabase
    .from("caixa_movimentos")
    .insert(movimentoPayload);

  if (movimentoError) {
    console.error(
      "[CaixaService] Falha ao registrar movimento de caixa",
      movimentoError
    );
    await supabase.from("itens_venda").delete().eq("venda_id", venda.id);
    await supabase.from("vendas").delete().eq("id", venda.id);
    return { error: movimentoError };
  }

  return { data: { venda, itens: itensData } };
}

export async function listVendas(
  proprietarioId,
  { dataInicial, dataFinal } = {}
) {
  if (!proprietarioId) {
    return { data: [], error: new Error("proprietarioId é obrigatório.") };
  }

  let query = supabase
    .from("vendas")
    .select("*")
    .eq("proprietario_id", proprietarioId)
    .order("data", { ascending: false });

  if (dataInicial) {
    query = query.gte("data", dataInicial);
  }
  if (dataFinal) {
    query = query.lte("data", dataFinal);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[CaixaService] Erro ao listar vendas", error);
  }
  return { data: data || [], error };
}

export async function getVendaDetalhe(id, proprietarioId) {
  if (!id) return { error: new Error("ID da venda é obrigatório") };

  const [
    { data: venda, error: vendaError },
    { data: itens, error: itensError },
  ] = await Promise.all([
    (async () => {
      let query = supabase.from("vendas").select("*").eq("id", id);
      query = withOwnerFilter(query, proprietarioId);
      return query.single();
    })(),
    supabase
      .from("itens_venda")
      .select("*")
      .eq("venda_id", id)
      .order("descricao", { ascending: true }),
  ]);

  if (vendaError) {
    console.error("[CaixaService] Venda não encontrada", vendaError);
    return { error: vendaError };
  }
  if (itensError) {
    console.error("[CaixaService] Erro ao carregar itens", itensError);
    return { error: itensError };
  }

  return { data: { venda, itens: itens || [] } };
}

export async function getResumoVendas(
  proprietarioId,
  { dataInicial, dataFinal } = {}
) {
  if (!proprietarioId) {
    return {
      data: {
        total: 0,
        quantidade: 0,
        porPagamento: { dinheiro: 0, cartao: 0, pix: 0, outro: 0 },
      },
      error: new Error("proprietarioId é obrigatório."),
    };
  }

  let query = supabase
    .from("vendas")
    .select("total, forma_pagamento, data")
    .eq("proprietario_id", proprietarioId)
    .order("data", { ascending: false });

  if (dataInicial) {
    query = query.gte("data", dataInicial);
  }
  if (dataFinal) {
    query = query.lte("data", dataFinal);
  }

  const { data, error } = await query;
  const resumo = {
    total: 0,
    quantidade: 0,
    porPagamento: {
      dinheiro: 0,
      cartao: 0,
      pix: 0,
      outro: 0,
    },
  };

  if (error) {
    console.error("[CaixaService] Erro ao gerar resumo de vendas", error);
    return { data: resumo, error };
  }

  const rows = data || [];
  resumo.quantidade = rows.length;

  rows.forEach((row) => {
    const valor = Number(row.total) || 0;
    resumo.total += valor;
    const pagamento = normalizeFormaPagamento(row.forma_pagamento);
    resumo.porPagamento[pagamento] += valor;
  });

  return { data: resumo, error: null };
}
