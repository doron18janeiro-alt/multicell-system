import { useCallback, useEffect, useState } from "react";
import {
  listarClientes,
  criarCliente,
  atualizarCliente,
} from "../services/clientesService";

export default function useClientes(proprietarioId) {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const carregarClientes = useCallback(
    async (filtros) => {
      if (!proprietarioId) {
        setClientes([]);
        return;
      }
      setCarregando(true);
      setErro("");

      try {
        const { data, error } = await listarClientes(proprietarioId, filtros);
        if (error) throw error;
        setClientes(data || []);
      } catch (error) {
        console.error("[useClientes] listar", error);
        setErro("Não foi possível carregar os clientes.");
      } finally {
        setCarregando(false);
      }
    },
    [proprietarioId]
  );

  const criar = useCallback(
    async (dados) => {
      if (!proprietarioId) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      const { error } = await criarCliente(proprietarioId, dados);
      if (error) throw error;
      await carregarClientes();
    },
    [carregarClientes, proprietarioId]
  );

  const atualizar = useCallback(
    async (id, dados) => {
      if (!proprietarioId) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      const { error } = await atualizarCliente(id, proprietarioId, dados);
      if (error) throw error;
      await carregarClientes();
    },
    [carregarClientes, proprietarioId]
  );

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  return {
    clientes,
    carregando,
    erro,
    carregarClientes,
    criar,
    atualizar,
  };
}
