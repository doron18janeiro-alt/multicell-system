import { useCallback, useEffect, useState } from "react";
import { registrarVenda as registrarVendaService } from "@/services/financeiro";
import { obterVendasRecentes } from "@/services/relatorios";

export default function useVendas(proprietarioId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarVendasRecentes = useCallback(async () => {
    if (!proprietarioId) {
      setData([]);
      setLoading(false);
      setError("Sessão expirada. Faça login novamente.");
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await obterVendasRecentes(proprietarioId);
    if (error) {
      console.error("useVendas:erro", error);
      setError(error?.message || error);
      setLoading(false);
      return;
    }
    setData(data?.itens || data || []);
    setLoading(false);
  }, [proprietarioId]);

  const registrarVenda = useCallback(
    async (payload, itens) => {
      if (!proprietarioId) {
        setError("Sessão expirada. Faça login novamente.");
        return null;
      }
      const { data, error } = await registrarVendaService(
        proprietarioId,
        payload,
        itens
      );
      if (error) {
        console.error("useVendas:erro", error);
        setError(error?.message || error);
        return null;
      }
      await carregarVendasRecentes();
      return data?.venda;
    },
    [carregarVendasRecentes, proprietarioId]
  );

  useEffect(() => {
    carregarVendasRecentes();
  }, [carregarVendasRecentes]);

  return {
    vendas: data,
    carregando: loading,
    erro: error,
    data,
    loading,
    error,
    carregarVendasRecentes,
    registrarVenda,
  };
}
