import { supabase } from "./supabaseClient";

const ownerFilter = (proprietarioId) =>
  proprietarioId
    ? `loja_id.eq.${proprietarioId},proprietario_id.eq.${proprietarioId}`
    : undefined;

export async function registrarVenda(proprietarioId, venda, itens = []) {
  if (!proprietarioId) {
    return { error: new Error("proprietarioId é obrigatório."), data: null };
  }

  if (!itens.length) {
    return {
      error: new Error("Adicione ao menos um item antes de finalizar a venda."),
      data: null,
    };
  }

  const payload = {
    ...venda,
    loja_id: proprietarioId,
    proprietario_id: proprietarioId,
    data_venda: venda?.data_venda || new Date().toISOString(),
    status: venda?.status || "concluido",
    total_bruto: Number(venda?.total_bruto || 0),
    desconto: Number(venda?.desconto || 0),
    total_liquido: Number(venda?.total_liquido || 0),
  };

  const { data: vendaCriada, error: erroVenda } = await supabase
    .from("vendas")
    .insert(payload)
    .select()
    .single();

  if (erroVenda) {
    console.error("[vendasService] registrarVenda", erroVenda);
    return { error: erroVenda, data: null };
  }

  const itensPayload = itens.map((item) => ({
    venda_id: vendaCriada.id,
    produto_id: item.produto_id || item.produtoId || null,
    descricao: item.descricao || item.nome,
    quantidade: Number(item.quantidade) || 0,
    preco_unitario: Number(item.preco_unitario || item.precoUnitario || 0),
    subtotal: Number(item.subtotal || 0),
  }));

  const itensValidos = itensPayload.filter(
    (item) => item.descricao && item.quantidade > 0 && item.subtotal >= 0
  );

  if (!itensValidos.length) {
    await supabase.from("vendas").delete().eq("id", vendaCriada.id);
    return {
      error: new Error("Itens inválidos. Nenhum item foi registrado."),
      data: null,
    };
  }

  const { error: erroItens } = await supabase
    .from("itens_venda")
    .insert(itensValidos);

  if (erroItens) {
    console.error("[vendasService] itens", erroItens);
    await supabase.from("vendas").delete().eq("id", vendaCriada.id);
    return { error: erroItens, data: null };
  }

  return { data: { venda: vendaCriada, itens: itensValidos }, error: null };
}

export async function listarVendas(
  proprietarioId,
  { clienteId, dataInicial, dataFinal, limite = 50 } = {}
) {
  if (!proprietarioId) {
    return { data: [], error: new Error("proprietarioId é obrigatório.") };
  }

  let query = supabase
    .from("vendas")
    .select("*")
    .or(ownerFilter(proprietarioId))
    .order("data_venda", { ascending: false })
    .limit(limite);

  if (clienteId) {
    query = query.eq("cliente_id", clienteId);
  }
  if (dataInicial) {
    query = query.gte("data_venda", dataInicial);
  }
  if (dataFinal) {
    query = query.lte("data_venda", dataFinal);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[vendasService] listarVendas", error);
  }
  return { data: data || [], error };
}

export async function listarVendasRecentes(proprietarioId, limite = 5) {
  return listarVendas(proprietarioId, { limite });
}
