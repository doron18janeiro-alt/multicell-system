import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import ClientesModal from "../components/ClientesModal";
import { useAuth } from "../contexts/AuthContext";
import useClientes from "../hooks/useClientes";
import { removerCliente } from "../services/clientesService";
import PrimeCard from "../components/ui/PrimeCard";
import PrimeButton from "../components/ui/PrimeButton";
import PrimeInput from "../components/ui/PrimeInput";
import PrimeSectionTitle from "../components/ui/PrimeSectionTitle";

export default function Clientes() {
  const { proprietarioId, loading: authLoading } = useAuth();
  const { clientes, carregando, erro, carregarClientes, criar, atualizar } =
    useClientes(proprietarioId);

  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [excluindoId, setExcluindoId] = useState(null);

  const clientesFiltrados = useMemo(() => {
    if (!busca.trim()) return clientes;
    const termo = busca.toLowerCase();
    return clientes.filter((cliente) => {
      return ["nome", "telefone", "cpf", "email"].some((campo) =>
        cliente[campo]?.toLowerCase().includes(termo)
      );
    });
  }, [busca, clientes]);

  async function excluirCliente(cliente) {
    if (!proprietarioId) return;
    if (!window.confirm(`Excluir cliente "${cliente.nome}"?`)) return;

    setExcluindoId(cliente.id);
    setFeedback("");
    try {
      const { error } = await removerCliente(cliente.id, proprietarioId);
      if (error) throw error;
      await carregarClientes();
    } catch (error) {
      console.error("[Clientes] excluir", error);
      setFeedback(
        error?.message || "Não foi possível excluir o cliente. Tente novamente."
      );
    } finally {
      setExcluindoId(null);
    }
  }

  async function salvarCliente(dados) {
    if (clienteSelecionado) {
      await atualizar(clienteSelecionado.id, dados);
    } else {
      await criar(dados);
    }
  }

  function abrirNovo() {
    setClienteSelecionado(null);
    setModalAberto(true);
  }

  function editar(cliente) {
    setClienteSelecionado(cliente);
    setModalAberto(true);
  }

  if (authLoading) {
    return (
      <PrimeCard className="text-sm text-white/70">
        Validando sessão...
      </PrimeCard>
    );
  }

  if (!proprietarioId) {
    return (
      <PrimeCard className="text-sm text-white/70">
        Faça login para gerenciar clientes da sua loja.
      </PrimeCard>
    );
  }

  return (
    <div className="space-y-8">
      <PrimeSectionTitle
        title="Central de clientes"
        subtitle="Centralize histórico, contatos e observações com a sofisticação Prime Edition."
        icon={Users}
      />

      {(erro || feedback) && (
        <PrimeCard className="border-red-400/30 bg-red-900/30 text-red-100">
          {erro || feedback}
        </PrimeCard>
      )}

      <PrimeCard className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="w-full max-w-xl">
          <PrimeInput
            label="Buscar clientes"
            placeholder="Nome, telefone, CPF ou email"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <PrimeButton onClick={abrirNovo} className="self-stretch md:self-auto">
          <Plus size={16} /> Novo cliente
        </PrimeButton>
      </PrimeCard>

      <PrimeCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>CPF</th>
                <th>Email</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c) => (
                <tr key={c.id}>
                  <td>
                    <p className="font-semibold text-white">{c.nome}</p>
                    <p className="text-xs text-white/50">
                      {c.observacoes || "—"}
                    </p>
                  </td>
                  <td className="text-white/80">{c.telefone || "—"}</td>
                  <td className="text-white/80">{c.cpf || "—"}</td>
                  <td className="text-white/80">{c.email || "—"}</td>
                  <td>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => editar(c)}
                        title="Editar"
                        className="rounded-2xl border border-white/15 bg-white/10 p-2 text-[#ffe8a3] transition hover:border-[#ffe8a3]/60"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => excluirCliente(c)}
                        title="Excluir"
                        disabled={excluindoId === c.id}
                        className="rounded-2xl border border-white/15 bg-white/10 p-2 text-red-300 transition hover:border-red-300/60 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {clientesFiltrados.length === 0 && !carregando && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-white/60">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}

              {carregando && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-white/60">
                    Carregando clientes...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PrimeCard>

      {modalAberto && (
        <ClientesModal
          cliente={clienteSelecionado}
          fechar={() => setModalAberto(false)}
          onSubmit={salvarCliente}
        />
      )}
    </div>
  );
}
