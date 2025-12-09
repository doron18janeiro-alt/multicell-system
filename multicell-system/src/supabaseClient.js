import { supabase } from "@/services/supabaseClient";
import {
  listarProdutos,
  criarProduto as criarProdutoService,
  atualizarProduto as atualizarProdutoService,
  removerProduto as removerProdutoService,
  listProdutos,
  createProduto as createProdutoEstoqueService,
  updateProduto as updateProdutoEstoqueService,
  inativarProduto,
} from "@/services/produtos";
import { listarVendas, registrarVenda } from "@/services/financeiro";
import { listOs, createOs, updateOs, getResumoOs } from "@/services/os";
import { getConfig, saveConfig } from "@/services/configService";

export { supabase };

export async function loadProdutos(ownerId) {
  return listarProdutos(ownerId);
}

export async function createProduto(payload, ownerId) {
  return criarProdutoService(ownerId, payload);
}

export async function updateProduto(id, ownerId, patch) {
  return atualizarProdutoService(id, ownerId, patch);
}

export async function deleteProduto(id, ownerId) {
  return removerProdutoService(id, ownerId);
}

export async function loadVendas(ownerId, { inicio, fim, limite = 50 } = {}) {
  return listarVendas(ownerId, {
    dataInicial: inicio,
    dataFinal: fim,
    limite,
  });
}

export async function createVenda(venda, itensParaEstoque = [], ownerId) {
  const resultado = await registrarVenda(ownerId, venda, itensParaEstoque);
  return resultado;
}

export async function loadOrdens(ownerId, { search, status } = {}) {
  return listOs(ownerId, { search, status });
}

export async function createOrdem(payload, ownerId) {
  return createOs(ownerId, payload);
}

export async function updateOrdem(id, ownerId, patch) {
  return updateOs(id, ownerId, patch);
}

export async function loadConfiguracao(ownerId) {
  return getConfig();
}

export async function saveConfiguracao(cfg, ownerId) {
  return saveConfig({ ...cfg, proprietario_id: ownerId });
}

export async function loadHistoricoVendas(ownerId, periodo = {}) {
  return listarVendas(ownerId, {
    dataInicial: periodo.inicio,
    dataFinal: periodo.fim,
  });
}

// Compat helpers para estoque
export async function createProdutoEstoque(payload, ownerId) {
  return createProdutoEstoqueService(ownerId, payload);
}

export async function updateProdutoEstoque(id, ownerId, payload) {
  return updateProdutoEstoqueService(id, ownerId, payload);
}

export async function inativarProdutoEstoque(id, ownerId) {
  return inativarProduto(id, ownerId);
}

// Resumo de OS reutiliza função nova
export async function loadResumoOs(ownerId, filtros) {
  return getResumoOs(ownerId, filtros);
}
