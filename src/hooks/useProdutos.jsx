import { useCallback, useEffect, useState } from "react";
import {
  listarProdutos,
  criarProduto,
  atualizarProduto,
} from "../services/produtosService";

export default function useProdutos(proprietarioId) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const carregarProdutos = useCallback(async () => {
    if (!proprietarioId) {
      setProdutos([]);
      return;
    }
    setCarregando(true);
    setErro("");

    try {
      const { data, error } = await listarProdutos(proprietarioId);
      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error("[useProdutos] listar", error);
      setErro("Não foi possível carregar os produtos.");
    } finally {
      setCarregando(false);
    }
  }, [proprietarioId]);

  const criar = useCallback(
    async (dados) => {
      if (!proprietarioId) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      const { error } = await criarProduto(proprietarioId, dados);
      if (error) throw error;
      await carregarProdutos();
    },
    [carregarProdutos, proprietarioId]
  );

  const atualizar = useCallback(
    async (id, dados) => {
      if (!proprietarioId) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      const { error } = await atualizarProduto(id, proprietarioId, dados);
      if (error) throw error;
      await carregarProdutos();
    },
    [carregarProdutos, proprietarioId]
  );

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  return {
    produtos,
    carregando,
    erro,
    carregarProdutos,
    criar,
    atualizar,
  };
}
