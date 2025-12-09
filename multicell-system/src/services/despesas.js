import { supabase } from "@/services/supabaseClient";

const TABLE = "despesas";

const logError = (label, error) => {
  if (!error) return null;
  const message = error.message || `Erro em ${label}`;
  console.error("Despesas:erro", message);
  return message;
};

export async function listarDespesas(proprietarioId) {
  if (!proprietarioId) {
    const message = "proprietarioId é obrigatório.";
    console.error("Despesas:erro", message);
    return { data: [], error: message };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      "id, valor, categoria, descricao, created_at, total_pago, valor_pago, forma_pagamento, data_pagamento, pago"
    )
    .eq("proprietario_id", proprietarioId)
    .order("created_at", { ascending: false });

  const message = logError("listarDespesas", error);
  return { data: data || [], error: message };
}

export async function criarDespesa(
  proprietarioId,
  { valor, categoria, descricao }
) {
  if (!proprietarioId) {
    const message = "proprietarioId é obrigatório.";
    console.error("Despesas:erro", message);
    return { data: null, error: message };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(
      [
        {
          valor,
          categoria,
          descricao,
          total_pago: 0,
          valor_pago: 0,
          pago: false,
          proprietario_id: proprietarioId,
        },
      ],
      { returning: "representation" }
    )
    .select()
    .single();

  const message = logError("criarDespesa", error);
  return { data: data ?? null, error: message };
}

export async function removerDespesa(proprietarioId, id) {
  if (!proprietarioId || !id) {
    const message = "proprietarioId e id são obrigatórios.";
    console.error("Despesas:erro", message);
    return { data: null, error: message };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .delete({ returning: "representation" })
    .eq("id", id)
    .eq("proprietario_id", proprietarioId)
    .select()
    .maybeSingle();

  const message = logError("removerDespesa", error);
  return { data: data ?? null, error: message };
}

export async function pagarDespesa(
  proprietarioId,
  id,
  { valor_pago, forma_pagamento, data_pagamento }
) {
  if (!proprietarioId || !id) {
    const message = "proprietarioId e id são obrigatórios.";
    console.error("Despesas:erro", message);
    return { data: null, error: message };
  }

  const { data: atual, error: fetchError } = await supabase
    .from(TABLE)
    .select("valor, total_pago")
    .eq("id", id)
    .eq("proprietario_id", proprietarioId)
    .maybeSingle();

  const fetchMessage = logError("pagarDespesa:fetch", fetchError);
  if (fetchMessage) {
    return { data: null, error: fetchMessage };
  }

  const valorAtual = Number(atual?.valor) || 0;
  const totalPagoAtual = Number(atual?.total_pago) || 0;
  const pagamento = Number(valor_pago) || 0;
  const novoTotal = totalPagoAtual + pagamento;

  const payload = {
    total_pago: novoTotal,
    valor_pago: novoTotal,
    forma_pagamento,
    data_pagamento,
    pago: novoTotal >= valorAtual,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload, { returning: "representation" })
    .eq("id", id)
    .eq("proprietario_id", proprietarioId)
    .select()
    .maybeSingle();

  const updateMessage = logError("pagarDespesa:update", error);
  return { data: data ?? payload, error: updateMessage };
}
