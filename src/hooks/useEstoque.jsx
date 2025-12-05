import { useCallback, useEffect, useRef, useState } from "react";
import {
  listProdutos,
  createProduto,
  updateProduto,
  inativarProduto,
} from "../services/estoqueService";

const resumoInicial = {
  totalSkus: 0,
  totalPecas: 0,
  estoqueCritico: 0,
};

export default function useEstoque(proprietarioId, filtrosIniciais = {}) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
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
        setProdutos([]);
        setResumo(resumoInicial);
        return;
      }

      const filtrosAtuais = filtros ?? filtrosRef.current ?? {};
      filtrosRef.current = filtrosAtuais;
      setCarregando(true);
      setErro("");

      try {
        const { data, error } = await listProdutos(
          proprietarioId,
          filtrosAtuais
        );
        if (error) throw error;
        const lista = data || [];
        setProdutos(lista);
        setCategoriaOptions(() => {
          const unique = new Set();
          lista.forEach((item) => {
            if (item.categoria) unique.add(item.categoria);
          });
          return Array.from(unique);
        });
        setResumo(calcularResumo(lista));
      } catch (error) {
        console.error("[useEstoque] listar", error);
        setErro("Não foi possível carregar o estoque.");
        setProdutos([]);
        setResumo(resumoInicial);
      } finally {
        setCarregando(false);
      }
    },
    [calcularResumo, proprietarioId]
  );

  const criar = useCallback(
    async (dados) => {
      if (!proprietarioId) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      const { error } = await createProduto(proprietarioId, dados);
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
      const { error } = await updateProduto(id, proprietarioId, dados);
      if (error) throw error;
      await carregarProdutos();
    },
    [carregarProdutos, proprietarioId]
  );

  const inativar = useCallback(
    async (id) => {
      if (!proprietarioId) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      const { error } = await inativarProduto(id, proprietarioId);
      if (error) throw error;
      await carregarProdutos();
    },
    [carregarProdutos, proprietarioId]
  );

  useEffect(() => {
    filtrosRef.current = filtrosIniciais;
    carregarProdutos(filtrosIniciais);
  }, [carregarProdutos, proprietarioId, filtrosIniciais]);

  return {
    produtos,
    carregando,
    erro,
    resumo,
    categoriaOptions,
    carregarProdutos,
    criar,
    atualizar,
    inativar,
  };
}
