import { useCallback, useEffect, useState } from "react";
import {
  listarProdutos,
  criarProduto,
  atualizarProduto,
} from "@/services/produtos";

export default function useProdutos(proprietarioId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarProdutos = useCallback(async () => {
    if (!proprietarioId) {
      setData([]);
      setLoading(false);
      setError("Sessão expirada. Faça login novamente.");
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await listarProdutos(proprietarioId);
    if (error) {
      console.error("useProdutos:erro", error);
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
        return;
      }
      const { error } = await criarProduto(proprietarioId, dados);
      if (error) {
        console.error("useProdutos:erro", error);
        setError(error?.message || error);
        return;
      }
      await carregarProdutos();
    },
    [carregarProdutos, proprietarioId]
  );

  const atualizar = useCallback(
    async (id, dados) => {
      if (!proprietarioId) {
        setError("Sessão expirada. Faça login novamente.");
        return;
      }
      const { error } = await atualizarProduto(id, proprietarioId, dados);
      if (error) {
        console.error("useProdutos:erro", error);
        setError(error?.message || error);
        return;
      }
      await carregarProdutos();
    },
    [carregarProdutos, proprietarioId]
  );

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  return {
    produtos: data,
    carregando: loading,
    erro: error,
    data,
    loading,
    error,
    carregarProdutos,
    criar,
    atualizar,
  };
}
