import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import useProdutos from "@/hooks/useProdutos.jsx";
import ProdutosModal from "@/components/ProdutosModal.jsx";
import { removerProduto } from "@/services/produtos";
import { money } from "../utils/money";
import PrimeCard from "../components/ui/PrimeCard.jsx";
import PrimeButton from "../components/ui/PrimeButton.jsx";
import PrimeInput from "../components/ui/PrimeInput.jsx";
import PrimeSectionTitle from "../components/ui/PrimeSectionTitle.jsx";

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

  useEffect(() => {
    if (erro) {
      alert(erro);
    }
    if (feedback) {
      alert(feedback);
    }
  }, [erro, feedback]);

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
        Faça login para gerenciar seus produtos.
      </PrimeCard>
    );
  }

  return (
    <div className="space-y-8">
      <PrimeSectionTitle
        title="Curadoria de produtos"
        subtitle="Gerencie itens, preços e estoque com o toque dourado do Prime Edition."
        icon={ShoppingBag}
      />

      {erro && (
        <PrimeCard className="border-red-400/30 bg-red-900/30 text-red-100">
          {erro}
        </PrimeCard>
      )}

      {feedback && (
        <PrimeCard className="border-red-400/30 bg-red-900/30 text-red-100">
          {feedback}
        </PrimeCard>
      )}

      <PrimeCard className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="w-full max-w-xl">
          <PrimeInput
            label="Buscar produtos"
            placeholder="Nome, código ou categoria"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <PrimeButton onClick={abrirNovo} className="self-stretch md:self-auto">
          <Plus size={16} /> Novo produto
        </PrimeButton>
      </PrimeCard>

      <PrimeCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="font-semibold text-white">{p.nome}</div>
                    <p className="text-xs text-white/50">{p.codigo || "—"}</p>
                  </td>
                  <td className="text-white/80">{p.categoria || "—"}</td>
                  <td className="text-[#ffe8a3] font-semibold">
                    {money(p.preco_venda || p.preco || 0)}
                  </td>
                  <td className="text-white/90">
                    {p.quantidade ?? p.estoque ?? 0}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => editar(p)}
                        title="Editar"
                        className="rounded-2xl border border-white/15 bg-white/10 p-2 text-[#ffe8a3] transition hover:border-[#ffe8a3]/60"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => excluir(p)}
                        title="Excluir"
                        disabled={excluindoId === p.id}
                        className="rounded-2xl border border-white/15 bg-white/10 p-2 text-red-300 transition hover:border-red-300/60 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!carregando && produtosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-white/60">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}

              {carregando && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-white/60">
                    Carregando produtos...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PrimeCard>

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
