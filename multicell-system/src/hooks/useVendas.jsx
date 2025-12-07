import { useCallback, useEffect, useState } from "react";
import {
  registrarVenda as registrarVendaService,
  listarVendasRecentes,
} from "../services/vendasService";

export default function useVendas(proprietarioId) {
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const carregarVendasRecentes = useCallback(async () => {
    if (!proprietarioId) return;
    setCarregando(true);
    setErro("");

    try {
      const { data, error } = await listarVendasRecentes(proprietarioId);
      if (error) throw error;
      setVendas(data || []);
    } catch (error) {
      console.error("[useVendas] recentes", error);
      setErro("Não foi possível carregar as vendas recentes.");
    } finally {
      setCarregando(false);
    }
  }, [proprietarioId]);

  const registrarVenda = useCallback(
    async (payload, itens) => {
      if (!proprietarioId) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      const { data, error } = await registrarVendaService(
        proprietarioId,
        payload,
        itens
      );
      if (error) throw error;
      await carregarVendasRecentes();
      return data?.venda;
    },
    [carregarVendasRecentes, proprietarioId]
  );

  useEffect(() => {
    carregarVendasRecentes();
  }, [carregarVendasRecentes]);

  return {
    vendas,
    carregando,
    erro,
    carregarVendasRecentes,
    registrarVenda,
  };
}
