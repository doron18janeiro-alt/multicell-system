import { useCallback, useEffect, useState } from "react";
import {
  listarClientes,
  criarCliente,
  atualizarCliente,
} from "@/services/clientes";

export default function useClientes(proprietarioId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarClientes = useCallback(
    async (filtros) => {
      if (!proprietarioId) {
        setData([]);
        setLoading(false);
        setError("Sessão expirada. Faça login novamente.");
        return;
      }
      setLoading(true);
      setError(null);

      const { data, error } = await listarClientes(proprietarioId, filtros);
      if (error) {
        console.error("useClientes:erro", error);
        setError(error?.message || error);
        setLoading(false);
        return;
      }
      setData(data || []);
      setLoading(false);
    },
    [proprietarioId]
  );

  const criar = useCallback(
    async (dados) => {
      if (!proprietarioId) {
        setError("Sessão expirada. Faça login novamente.");
        return;
      }
      const { error } = await criarCliente(proprietarioId, dados);
      if (error) {
        console.error("useClientes:erro", error);
        setError(error?.message || error);
        return;
      }
      await carregarClientes();
    },
    [carregarClientes, proprietarioId]
  );

  const atualizar = useCallback(
    async (id, dados) => {
      if (!proprietarioId) {
        setError("Sessão expirada. Faça login novamente.");
        return;
      }
      const { error } = await atualizarCliente(id, proprietarioId, dados);
      if (error) {
        console.error("useClientes:erro", error);
        setError(error?.message || error);
        return;
      }
      await carregarClientes();
    },
    [carregarClientes, proprietarioId]
  );

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  return {
    clientes: data,
    carregando: loading,
    erro: error,
    data,
    loading,
    error,
    carregarClientes,
    criar,
    atualizar,
  };
}
