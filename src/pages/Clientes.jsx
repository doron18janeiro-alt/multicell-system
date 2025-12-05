import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import ClientesModal from "../components/ClientesModal";
import { useAuth } from "../contexts/AuthContext";
import useClientes from "../hooks/useClientes";
import { removerCliente } from "../services/clientesService";

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
      <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-600">
        Validando sessão...
      </div>
    );
  }

  if (!proprietarioId) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-600">
        Faça login para gerenciar clientes da sua loja.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.4em] text-gray-500">CRM</p>
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-500">
          Centralize histórico de atendimento e dados de contato.
        </p>
      </div>

      {(erro || feedback) && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {erro || feedback}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            className="pl-10 pr-3 py-2 w-full border rounded-md"
            placeholder="Buscar por nome, telefone, CPF ou email"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          onClick={abrirNovo}
        >
          <Plus size={18} /> Novo
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-left text-sm text-gray-500">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">CPF</th>
              <th className="p-3">Email</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">
                  <p className="font-semibold text-gray-900">{c.nome}</p>
                  <p className="text-xs text-gray-500">
                    {c.observacoes || "—"}
                  </p>
                </td>
                <td className="p-3 text-sm text-gray-700">
                  {c.telefone || "—"}
                </td>
                <td className="p-3 text-sm text-gray-700">{c.cpf || "—"}</td>
                <td className="p-3 text-sm text-gray-700">{c.email || "—"}</td>
                <td className="p-3 flex gap-3">
                  <button onClick={() => editar(c)} title="Editar">
                    <Pencil size={18} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => excluirCliente(c)}
                    title="Excluir"
                    disabled={excluindoId === c.id}
                  >
                    <Trash2
                      size={18}
                      className={
                        excluindoId === c.id ? "text-gray-400" : "text-red-600"
                      }
                    />
                  </button>
                </td>
              </tr>
            ))}

            {clientesFiltrados.length === 0 && !carregando && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}

            {carregando && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Carregando clientes...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
