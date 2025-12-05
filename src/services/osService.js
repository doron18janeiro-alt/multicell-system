import { supabase } from "./supabaseClient";

const TABLE = "os";

const ownerFilter = (proprietarioId) =>
  proprietarioId
    ? `loja_id.eq.${proprietarioId},proprietario_id.eq.${proprietarioId}`
    : undefined;

function normalizeError(error) {
  if (!error) return null;
  const message = error.message || "Erro desconhecido no Supabase";
  return { ...error, message };
}

export async function listOs(proprietarioId, { search, status } = {}) {
  if (!proprietarioId) {
    return { data: [], error: normalizeError(new Error("Sessão expirada.")) };
  }

  let query = supabase
    .from(TABLE)
    .select("*")
    .or(ownerFilter(proprietarioId))
    .order("data_entrada", { ascending: false });

  if (search) {
    const safe = search.trim();
    if (safe) {
      query = query.or(`cliente_nome.ilike.%${safe}%,aparelho.ilike.%${safe}%`);
    }
  }

  if (status && status !== "todos") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  return { data: data || [], error: normalizeError(error) };
}

export async function getOsById(id, proprietarioId) {
  let query = supabase.from(TABLE).select("*").eq("id", id);
  if (proprietarioId) {
    query = query.or(ownerFilter(proprietarioId));
  }
  const { data, error } = await query.single();
  return { data, error: normalizeError(error) };
}

export async function createOs(proprietarioId, payload) {
  if (!proprietarioId) {
    return { data: null, error: normalizeError(new Error("Sessão expirada.")) };
  }
  const body = {
    ...payload,
    data_entrada: payload.data_entrada || new Date().toISOString(),
    status: payload.status || "aberta",
    loja_id: proprietarioId,
    proprietario_id: proprietarioId,
  };
  const { data, error } = await supabase
    .from(TABLE)
    .insert(body)
    .select()
    .single();
  return { data, error: normalizeError(error) };
}

export async function updateOs(id, proprietarioId, payload) {
  let query = supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (proprietarioId) {
    query = query.or(ownerFilter(proprietarioId));
  }
  const { data, error } = await query.select().single();
  return { data, error: normalizeError(error) };
}

export async function deleteOs(id, proprietarioId) {
  let query = supabase.from(TABLE).delete().eq("id", id);
  if (proprietarioId) {
    query = query.or(ownerFilter(proprietarioId));
  }
  const { error } = await query;
  return { error: normalizeError(error) };
}

export async function getResumoOs(
  proprietarioId,
  { dataInicial, dataFinal } = {}
) {
  if (!proprietarioId) {
    return {
      data: {
        total: 0,
        status: { aberta: 0, em_andamento: 0, concluida: 0 },
      },
      error: normalizeError(new Error("Sessão expirada.")),
    };
  }

  let query = supabase
    .from(TABLE)
    .select("status, data_entrada")
    .or(ownerFilter(proprietarioId))
    .order("data_entrada", { ascending: false });

  if (dataInicial) {
    query = query.gte("data_entrada", dataInicial);
  }
  if (dataFinal) {
    query = query.lte("data_entrada", dataFinal);
  }

  const { data, error } = await query;

  const resumo = {
    total: 0,
    status: {
      aberta: 0,
      em_andamento: 0,
      concluida: 0,
    },
  };

  if (error) {
    console.error("[OsService] Erro ao gerar resumo de OS", error);
    return { data: resumo, error: normalizeError(error) };
  }

  const rows = data || [];
  resumo.total = rows.length;

  rows.forEach((row) => {
    const key = row.status;
    if (key && resumo.status[key] !== undefined) {
      resumo.status[key] += 1;
    }
  });

  return { data: resumo, error: null };
}
