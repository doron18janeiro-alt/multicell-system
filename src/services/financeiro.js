import { supabase } from "@/services/supabaseClient";

const handleResult = (label, { data, error }, fallback = null) => {
  if (error) {
    const message = error.message || `Erro em ${label}`;
    console.error("Financeiro:erro", message);
    return { data: fallback, error: message };
  }
  return { data: data ?? fallback, error: null };
};

export async function registrarVenda(proprietarioId, venda, itens = []) {
  if (!proprietarioId) {
    const message = "proprietarioId é obrigatório.";
    console.error("[Financeiro] registrarVenda:", message);
    return { error: message, data: null };
  }

  if (!itens.length) {
    const message = "Adicione ao menos um item antes de finalizar a venda.";
    console.error("[Financeiro] registrarVenda:", message);
    return { error: message, data: null };
  }

  const payload = {
    ...venda,
    proprietario_id: proprietarioId,
    criado_em:
      venda?.criado_em || venda?.data_venda || new Date().toISOString(),
    status: venda?.status || "concluido",
    total_bruto: Number(venda?.total_bruto || 0),
    desconto: Number(venda?.desconto || 0),
    total_liquido: Number(venda?.total_liquido || 0),
  };

  const resultVenda = await supabase
    .from("vendas")
    .insert(payload, { returning: "representation" })
    .select()
    .single();

  if (resultVenda.error || !resultVenda.data) {
    const message = resultVenda.error?.message || "Erro ao registrar venda";
    console.error("[Financeiro] registrarVenda:", message);
    return { data: null, error: message };
  }

  const vendaCriada = resultVenda.data;

  const itensPayload = itens.map((item) => ({
    venda_id: vendaCriada.id,
    proprietario_id: proprietarioId,
    produto_id: item.produto_id || item.produtoId || null,
    descricao: item.descricao || item.nome || "Item",
    quantidade: Number(item.quantidade) || 0,
    preco_unitario: Number(item.preco_unitario || item.precoUnitario || 0),
    subtotal: Number(item.subtotal || 0),
  }));

  const itensValidos = itensPayload.filter(
    (item) => item.descricao && item.quantidade > 0 && item.subtotal >= 0
  );

  if (!itensValidos.length) {
    await supabase
      .from("vendas")
      .delete({ returning: "representation" })
      .eq("id", vendaCriada.id)
      .eq("proprietario_id", proprietarioId);
    const message = "Itens inválidos. Nenhum item foi registrado.";
    console.error("[Financeiro] registrarVenda:", message);
    return {
      error: message,
      data: null,
    };
  }

  const itensResult = await supabase
    .from("itens_venda")
    .insert(itensValidos, { returning: "representation" });

  if (itensResult.error) {
    const message = itensResult.error.message || "Erro ao salvar itens";
    console.error("[Financeiro] registrarVenda itens:", message);
    await supabase
      .from("vendas")
      .delete({ returning: "representation" })
      .eq("id", vendaCriada.id)
      .eq("proprietario_id", proprietarioId);
    return { error: message, data: null };
  }

  return { data: { venda: vendaCriada, itens: itensValidos }, error: null };
}

export async function listarVendas(
  proprietarioId,
  { clienteId, dataInicial, dataFinal, limite = 50 } = {}
) {
  if (!proprietarioId) {
    const message = "proprietarioId é obrigatório.";
    console.error("[Financeiro] listarVendas:", message);
    return { data: [], error: message };
  }

  let query = supabase
    .from("vendas")
    .select("*")
    .eq("proprietario_id", proprietarioId)
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (clienteId) {
    query = query.eq("cliente_id", clienteId);
  }
  if (dataInicial) {
    query = query.gte("criado_em", dataInicial);
  }
  if (dataFinal) {
    query = query.lte("criado_em", dataFinal);
  }

  const result = await query;
  return handleResult("listarVendas", result, []);
}

export async function listarVendasRecentes(proprietarioId, limite = 5) {
  return listarVendas(proprietarioId, { limite });
}
