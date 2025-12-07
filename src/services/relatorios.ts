/*
 * Camada de serviços de relatório.
 * Quando estivermos prontos para migrar para Edge Functions/REST, basta trocar
 * os métodos que chamam `supabase.rpc` por `fetch('/functions/v1/...')` ou
 * por requisições para qualquer API externa. Mantemos a mesma assinatura para
 * minimizar o impacto no restante do app.
 */

import supabase from "./supabase";

export type PeriodoResumo = "hoje" | "7d" | "30d";

export interface FaturamentoDiarioItem {
  dia: string;
  total: number;
}

export interface TopProdutoItem {
  produto: string;
  quantidade: number;
}

export interface ResumoVendas {
  total: number;
  quantidade: number;
  ticketMedio: number;
}

const PERIODOS_DIAS: Record<PeriodoResumo, number> = {
  hoje: 0,
  "7d": 7,
  "30d": 30,
};

const startOfDay = (date: Date) => {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
};

const obterInicioPeriodo = (periodo: PeriodoResumo) => {
  const dias = PERIODOS_DIAS[periodo] ?? 0;
  if (dias === 0) {
    return startOfDay(new Date());
  }
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - (dias - 1));
  return startOfDay(inicio);
};

/**
 * Busca o faturamento diário diretamente na função RPC `faturamento_diario`.
 * A função do banco deve aceitar um parâmetro `loja`/`proprietario` e retornar
 * uma lista com `{ dia, total }`.
 */
export async function obterFaturamentoDiario(
  proprietarioId: string
): Promise<FaturamentoDiarioItem[]> {
  const { data, error } = await supabase.rpc("faturamento_diario", {
    proprietario: proprietarioId,
  });

  if (error) {
    console.error("[relatorios] faturamento_diario", error);
    throw error;
  }

  return (data || []).map((item: any) => ({
    dia: item.dia ?? item.date ?? item.day,
    total: Number(item.total) || 0,
  }));
}

/**
 * Recupera o ranking de produtos via RPC `top_produtos`.
 * Caso queira usar uma Edge Function, basta trocar esta chamada por:
 * `await fetch('/functions/v1/relatorio_top_produtos', { method: 'POST', body: JSON.stringify({ proprietarioId }) })`.
 */
export async function obterTopProdutos(
  proprietarioId: string
): Promise<TopProdutoItem[]> {
  const { data, error } = await supabase.rpc("top_produtos", {
    proprietario: proprietarioId,
  });

  if (error) {
    console.error("[relatorios] top_produtos", error);
    throw error;
  }

  return (data || []).map((item: any) => ({
    produto: item.produto || item.nome || item.descricao || "Produto",
    quantidade: Number(item.quantidade || item.qtd) || 0,
  }));
}

/**
 * Monta um resumo de vendas diretamente na tabela `vendas`, filtrando pelo
 * `proprietario_id`. Retorna o total faturado, quantidade de vendas e
 * ticket médio do período informado.
 */
export async function obterResumoVendas(
  proprietarioId: string,
  periodo: PeriodoResumo
): Promise<ResumoVendas> {
  const inicio = obterInicioPeriodo(periodo).toISOString();
  const { data, error } = await supabase
    .from("vendas")
    .select("total_liquido,data_venda")
    .eq("proprietario_id", proprietarioId)
    .gte("data_venda", inicio);

  if (error) {
    console.error("[relatorios] resumo_vendas", error);
    throw error;
  }

  const total = (data || []).reduce(
    (acc, venda) => acc + (Number(venda.total_liquido) || 0),
    0
  );
  const quantidade = data?.length || 0;
  const ticketMedio = quantidade ? total / quantidade : 0;

  return {
    total,
    quantidade,
    ticketMedio,
  };
}

/*
 * Para migrar qualquer função acima para Edge Functions, basta trocar o corpo
 * pelos seguintes passos:
 * 1. Realizar um `fetch('/functions/v1/<nome>', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })`.
 * 2. Validar `response.ok` e fazer `await response.json()`.
 * 3. Mapear o JSON no mesmo formato retornado hoje para não quebrar o frontend.
 */
