import { useCallback, useEffect, useRef, useState } from "react";
import {
  listProdutos,
  createProduto,
  updateProduto,
  inativarProduto,
} from "@/services/produtos";

const resumoInicial = {
  totalSkus: 0,
  totalPecas: 0,
  estoqueCritico: 0,
};

export default function useEstoque(proprietarioId, filtrosIniciais = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaOptions, setCategoriaOptions] = useState([]);
  const [resumo, setResumo] = useState(resumoInicial);
  const filtrosRef = useRef(filtrosIniciais);

  const calcularResumo = useCallback((lista) => {
    const totalSkus = lista.length;
    const totalPecas = lista.reduce(
      (sum, item) => sum + (Number(item.quantidade) || 0),
      0
    );
    const estoqueCritico = lista.filter(
      (item) => Number(item.quantidade) < 5
    ).length;
    return { totalSkus, totalPecas, estoqueCritico };
  }, []);

  const carregarProdutos = useCallback(
    async (filtros) => {
      if (!proprietarioId) {
        setData([]);
        setResumo(resumoInicial);
        setError("Sessão expirada. Faça login novamente.");
        setLoading(false);
        return;
      }

      const filtrosAtuais = filtros ?? filtrosRef.current ?? {};
      filtrosRef.current = filtrosAtuais;
      setLoading(true);
      setError(null);

      const { data, error } = await listProdutos(proprietarioId, filtrosAtuais);
      if (error) {
        console.error("useEstoque:erro", error);
        setError(error?.message || error);
        setData([]);
        setResumo(resumoInicial);
        setLoading(false);
        return;
      }
      const lista = data || [];
      setData(lista);
      setCategoriaOptions(() => {
        const unique = new Set();
        lista.forEach((item) => {
          if (item.categoria) unique.add(item.categoria);
        });
        return Array.from(unique);
      });
      setResumo(calcularResumo(lista));
      setLoading(false);
    },
    [calcularResumo, proprietarioId]
  );

  const criar = useCallback(
    async (dados) => {
      if (!proprietarioId) {
        setError("Sessão expirada. Faça login novamente.");
        return;
      }
      const { error } = await createProduto(proprietarioId, dados);
      if (error) {
        console.error("useEstoque:erro", error);
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
      const { error } = await updateProduto(id, proprietarioId, dados);
      if (error) {
        console.error("useEstoque:erro", error);
        setError(error?.message || error);
        return;
      }
      await carregarProdutos();
    },
    [carregarProdutos, proprietarioId]
  );

  const inativar = useCallback(
    async (id) => {
      if (!proprietarioId) {
        setError("Sessão expirada. Faça login novamente.");
        return;
      }
      const { error } = await inativarProduto(id, proprietarioId);
      if (error) {
        console.error("useEstoque:erro", error);
        setError(error?.message || error);
        return;
      }
      await carregarProdutos();
    },
    [carregarProdutos, proprietarioId]
  );

  useEffect(() => {
    filtrosRef.current = filtrosIniciais;
    carregarProdutos(filtrosIniciais);
  }, [carregarProdutos, proprietarioId, filtrosIniciais]);

  return {
    produtos: data,
    carregando: loading,
    erro: error,
    data,
    loading,
    error,
    resumo,
    categoriaOptions,
    carregarProdutos,
    criar,
    atualizar,
    inativar,
  };
}
