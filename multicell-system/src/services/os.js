import { supabase } from "@/services/supabaseClient";

const TABLE = "os";

const withOwner = (query, proprietarioId) =>
  proprietarioId ? query.eq("proprietario_id", proprietarioId) : query;

const normalizeError = (label, error) => {
  if (!error) return { message: null };
  const message = error.message || `Erro em ${label}`;
  console.error("OS:erro", message);
  return { message };
};

export async function listOs(proprietarioId, { search, status } = {}) {
  if (!proprietarioId) {
    const message = "Sessão expirada.";
    console.error("[OS] listOs:", message);
    return { data: [], error: message };
  }

  let query = withOwner(
    supabase.from(TABLE).select("*").order("criado_em", { ascending: false }),
    proprietarioId
  );

  if (search?.trim()) {
    const safe = search.trim();
    query = query.or(`cliente_nome.ilike.%${safe}%,aparelho.ilike.%${safe}%`);
  }

  if (status && status !== "todos") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  const normalized = normalizeError("listOs", error);
  return { data: data ?? [], error: normalized.message };
}

export async function getOsById(id, proprietarioId) {
  let query = supabase.from(TABLE).select("*").eq("id", id);
  query = withOwner(query, proprietarioId);
  const { data, error } = await query.single();
  const normalized = normalizeError("getOsById", error);
  return { data: data ?? null, error: normalized.message };
}

export async function createOs(proprietarioId, payload) {
  if (!proprietarioId) {
    const message = "Sessão expirada.";
    console.error("[OS] createOs:", message);
    return { data: null, error: message };
  }
  const body = {
    ...payload,
    criado_em:
      payload?.criado_em || payload?.data_entrada || new Date().toISOString(),
    status: payload?.status || "aberta",
    proprietario_id: proprietarioId,
  };
  const { data, error } = await supabase
    .from(TABLE)
    .insert(body, { returning: "representation" })
    .select()
    .single();
  const normalized = normalizeError("createOs", error);
  return { data: data ?? null, error: normalized.message };
}

export async function updateOs(id, proprietarioId, payload) {
  let query = supabase
    .from(TABLE)
    .update(
      { ...payload, updated_at: new Date().toISOString() },
      { returning: "representation" }
    )
    .eq("id", id);
  query = withOwner(query, proprietarioId);
  const { data, error } = await query.select().single();
  const normalized = normalizeError("updateOs", error);
  return { data: data ?? null, error: normalized.message };
}

export async function deleteOs(id, proprietarioId) {
  let query = supabase
    .from(TABLE)
    .delete({ returning: "representation" })
    .eq("id", id);
  query = withOwner(query, proprietarioId);
  const { data, error } = await query.select().maybeSingle();
  const normalized = normalizeError("deleteOs", error);
  return { data: data ?? null, error: normalized.message };
}

export async function getResumoOs(
  proprietarioId,
  { dataInicial, dataFinal } = {}
) {
  if (!proprietarioId) {
    const message = "Sessão expirada.";
    console.error("[OS] getResumoOs:", message);
    return {
      data: { total: 0, status: { aberta: 0, em_andamento: 0, concluida: 0 } },
      error: message,
    };
  }

  const end = dataFinal ? new Date(dataFinal) : null;
  const dataFim =
    end && !Number.isNaN(end.getTime())
      ? new Date(end.setHours(23, 59, 59, 999)).toISOString()
      : dataFinal || null;

  const { data, error } = await supabase.rpc("os_resumo", {
    proprietario: proprietarioId,
    data_inicio: dataInicial || null,
    data_fim: dataFim,
  });

  if (error) {
    console.error("os_resumo erro:", error.message);
    return { data: null, error };
  }

  const resumo = {
    total: 0,
    status: {
      aberta: 0,
      em_andamento: 0,
      concluida: 0,
    },
  };

  const row = data?.[0];
  if (row) {
    resumo.total = Number(row.total) || 0;
    resumo.status.aberta = Number(row.aberta) || 0;
    resumo.status.em_andamento = Number(row.em_andamento) || 0;
    resumo.status.concluida = Number(row.concluida) || 0;
  }

  return { data: resumo, error: null };
}
