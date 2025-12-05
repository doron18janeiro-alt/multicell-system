import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import ClientesModal from "../components/ClientesModal";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    let query = supabase
      .from("clientes")
      .select("*")
      .order("nome", { ascending: true });

    if (busca.trim() !== "") {
      query = query.ilike("nome", `%${busca}%`);
    }

    const { data } = await query;
    setClientes(data || []);
  }

  async function excluirCliente(cliente) {
    if (!window.confirm(`Excluir cliente "${cliente.nome}"?`)) return;
    await supabase.from("clientes").delete().eq("id", cliente.id);
    carregarClientes();
  }

  function abrirNovo() {
    setClienteSelecionado(null);
    setModalAberto(true);
  }

  function editar(cliente) {
    setClienteSelecionado(cliente);
    setModalAberto(true);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            className="pl-10 pr-3 py-2 w-full border rounded-md"
            placeholder="Buscar cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyUp={carregarClientes}
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
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">CPF</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.nome}</td>
                <td className="p-3">{c.telefone}</td>
                <td className="p-3">{c.cpf}</td>
                <td className="p-3 flex gap-3">
                  <button onClick={() => editar(c)}>
                    <Pencil size={18} className="text-blue-600" />
                  </button>
                  <button onClick={() => excluirCliente(c)}>
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </td>
              </tr>
            ))}

            {clientes.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Nenhum cliente encontrado.
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
          atualizar={carregarClientes}
        />
      )}
    </div>
  );
}
