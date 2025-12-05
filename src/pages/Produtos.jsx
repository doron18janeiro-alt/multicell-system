import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import useProdutos from "../hooks/useProdutos";
import ProdutosModal from "../components/ProdutosModal";
import { removerProduto } from "../services/produtosService";
import { money } from "../utils/money";

export default function Produtos() {
  const { proprietarioId, loading: authLoading } = useAuth();
  const { produtos, carregando, erro, carregarProdutos, criar, atualizar } =
    useProdutos(proprietarioId);

  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [excluindoId, setExcluindoId] = useState(null);

  const produtosFiltrados = useMemo(() => {
    if (!busca.trim()) return produtos;
    const termo = busca.toLowerCase();
    return produtos.filter((produto) => {
      return (
        produto.nome?.toLowerCase().includes(termo) ||
        produto.codigo?.toLowerCase().includes(termo) ||
        produto.categoria?.toLowerCase().includes(termo)
      );
    });
  }, [busca, produtos]);

  function abrirNovo() {
    setProdutoSelecionado(null);
    setModalAberto(true);
  }

  function editar(produto) {
    setProdutoSelecionado(produto);
    setModalAberto(true);
  }

  async function excluir(produto) {
    if (!proprietarioId) return;
    if (!window.confirm(`Excluir o produto "${produto.nome}"?`)) return;

    setExcluindoId(produto.id);
    setFeedback("");
    try {
      const { error } = await removerProduto(produto.id, proprietarioId);
      if (error) throw error;
      await carregarProdutos();
    } catch (error) {
      console.error("[Produtos] excluir", error);
      setFeedback(
        error?.message || "Não foi possível excluir o produto. Tente novamente."
      );
    } finally {
      setExcluindoId(null);
    }
  }

  async function salvarProduto(dados) {
    if (produtoSelecionado) {
      await atualizar(produtoSelecionado.id, dados);
    } else {
      await criar(dados);
    }
  }

  if (authLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Validando sessão...
      </div>
    );
  }

  if (!proprietarioId) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Faça login para gerenciar seus produtos.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
          Catálogo
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
        <p className="text-gray-500">
          Gerencie itens, preços e estoque com integração direta ao Supabase.
        </p>
      </div>

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {feedback && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {feedback}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, código ou categoria"
            className="pl-10 pr-3 py-2 w-full border rounded-md"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
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
          <thead className="bg-gray-100 text-left text-sm text-gray-500">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Estoque</th>
              <th className="p-3 w-32">Ações</th>
            </tr>
          </thead>

          <tbody>
            {produtosFiltrados.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <p className="font-semibold text-gray-900">{p.nome}</p>
                  <p className="text-xs text-gray-500">{p.codigo || "—"}</p>
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {p.categoria || "—"}
                </td>
                <td className="p-3 text-sm text-gray-800">
                  {money(p.preco_venda || p.preco || 0)}
                </td>
                <td className="p-3 text-sm text-gray-800">
                  {p.quantidade ?? p.estoque ?? 0}
                </td>
                <td className="p-3 flex gap-3">
                  <button onClick={() => editar(p)} title="Editar">
                    <Pencil size={18} className="text-blue-600" />
                  </button>

                  <button
                    onClick={() => excluir(p)}
                    title="Excluir"
                    disabled={excluindoId === p.id}
                  >
                    <Trash2
                      size={18}
                      className={
                        excluindoId === p.id ? "text-gray-400" : "text-red-600"
                      }
                    />
                  </button>
                </td>
              </tr>
            ))}

            {!carregando && produtosFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}

            {carregando && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Carregando produtos...
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
          onSubmit={salvarProduto}
        />
      )}
    </div>
  );
}
