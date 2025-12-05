import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import ProdutosModal from "../components/ProdutosModal";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    let query = supabase
      .from("produtos")
      .select("*")
      .order("nome", { ascending: true });

    if (busca.trim() !== "") {
      query = query.ilike("nome", `%${busca}%`);
    }

    const { data } = await query;
    setProdutos(data || []);
  }

  function abrirNovo() {
    setProdutoSelecionado(null);
    setModalAberto(true);
  }

  function editar(produto) {
    setProdutoSelecionado(produto);
    setModalAberto(true);
  }

  async function excluir(produto) {
    if (!window.confirm(`Excluir o produto "${produto.nome}"?`)) return;

    await supabase.from("produtos").delete().eq("id", produto.id);
    carregarProdutos();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Produtos</h1>

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar produto..."
            className="pl-10 pr-3 py-2 w-full border rounded-md"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyUp={carregarProdutos}
          />
        </div>

        <button
          onClick={abrirNovo}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={18} /> Novo
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Estoque</th>
              <th className="p-3 w-32">Ações</th>
            </tr>
          </thead>

          <tbody>
            {produtos.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.nome}</td>
                <td className="p-3">R$ {Number(p.preco).toFixed(2)}</td>
                <td className="p-3">{p.estoque}</td>
                <td className="p-3 flex gap-3">
                  <button onClick={() => editar(p)}>
                    <Pencil size={18} className="text-blue-600" />
                  </button>

                  <button onClick={() => excluir(p)}>
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </td>
              </tr>
            ))}

            {produtos.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <ProdutosModal
          fechar={() => setModalAberto(false)}
          produto={produtoSelecionado}
          atualizar={carregarProdutos}
        />
      )}
    </div>
  );
}
