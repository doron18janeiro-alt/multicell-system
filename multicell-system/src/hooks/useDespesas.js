import { useCallback, useEffect, useState } from "react";
import {
  listarDespesas,
  criarDespesa,
  removerDespesa,
  pagarDespesa,
} from "@/services/despesas";

// Hook padronizado
export default function useDespesas(proprietarioId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!proprietarioId) {
      setData([]);
      setLoading(false);
      setError("Sessão expirada. Faça login novamente.");
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error } = await listarDespesas(proprietarioId);
    if (error) {
      setError(error?.message || error);
      setData([]);
      setLoading(false);
      return;
    }
    setData(data || []);
    setLoading(false);
  }, [proprietarioId]);

  const criar = useCallback(
    async (dados) => {
      if (!proprietarioId) {
        setError("Sessão expirada. Faça login novamente.");
        return { data: null, error: "Sessão expirada." };
      }
      const result = await criarDespesa(proprietarioId, dados);
      if (result.error) {
        setError(result.error?.message || result.error);
        return result;
      }
      await load();
      return result;
    },
    [load, proprietarioId]
  );

  const remover = useCallback(
    async (id) => {
      if (!proprietarioId) {
        setError("Sessão expirada. Faça login novamente.");
        return { data: null, error: "Sessão expirada." };
      }
      const result = await removerDespesa(proprietarioId, id);
      if (result.error) {
        setError(result.error?.message || result.error);
        return result;
      }
      await load();
      return result;
    },
    [load, proprietarioId]
  );

  const pagar = useCallback(
    async (id, payload) => {
      if (!proprietarioId) {
        setError("Sessão expirada. Faça login novamente.");
        return { data: null, error: "Sessão expirada." };
      }
      const result = await pagarDespesa(proprietarioId, id, payload);
      if (result.error) {
        setError(result.error?.message || result.error);
        return result;
      }
      await load();
      return result;
    },
    [load, proprietarioId]
  );

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    despesas: data,
    loading,
    carregando: loading,
    error,
    erro: error,
    load,
    criar,
    remover,
    pagar,
  };
}

// Exports compatíveis (proxy para services canônicos)
export async function getDespesas(proprietarioId) {
  return listarDespesas(proprietarioId);
}

export async function novaDespesa(proprietarioId, payload) {
  return criarDespesa(proprietarioId, payload);
}

export async function deletarDespesa(proprietarioId, id) {
  return removerDespesa(proprietarioId, id);
}

export async function registrarPagamentoDespesa(proprietarioId, id, payload) {
  return pagarDespesa(proprietarioId, id, payload);
}
