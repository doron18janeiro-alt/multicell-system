import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProdutoForm from "../components/ProdutoForm";
import {
  createProduto,
  inativarProduto,
  listProdutos,
  updateProduto,
} from "../services/estoqueService";
import NovoProduto from "./Produtos/NovoProduto";

const formatCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  return numeric.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};

function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default function Estoque() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const debouncedBusca = useDebounced(busca);
  const [categoria, setCategoria] = useState("todos");
  const [produtos, setProdutos] = useState([]);
  const [categoriaOptions, setCategoriaOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedBusca, categoria]);

  const categorias = useMemo(() => {
    const unique = Array.from(new Set(categoriaOptions.filter(Boolean)));
    unique.sort();
    return ["todos", ...unique];
  }, [categoriaOptions]);

  const resumo = useMemo(() => {
    const totalSkus = produtos.length;
    const totalPecas = produtos.reduce(
      (sum, item) => sum + (Number(item.quantidade) || 0),
      0
    );
    const estoqueCritico = produtos.filter(
      (item) => Number(item.quantidade) < 5
    ).length;
    return { totalSkus, totalPecas, estoqueCritico };
  }, [produtos]);

  async function loadProdutos() {
    setLoading(true);
    setFeedback("");
    const { data, error } = await listProdutos({
      busca: debouncedBusca,
      categoria,
    });
    if (error) {
      setFeedback(error.message || "Não foi possível carregar os produtos.");
    }
    const safeData = data || [];
    setProdutos(safeData);
    setCategoriaOptions((prev) => {
      const merged = new Set(prev);
      safeData.forEach((item) => {
        if (item.categoria) merged.add(item.categoria);
      });
      return Array.from(merged);
    });
    setLoading(false);
  }

  function handleNewProduto() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function handleEditProduto(produto) {
    setEditing(produto);
    setDrawerOpen(true);
  }

  function handleProdutoCriado() {
    loadProdutos();
  }

  async function handleSaveProduto(values) {
    setSaving(true);
    setFeedback("");
    const action = editing
      ? updateProduto(editing.id, values)
      : createProduto(values);
    const { error } = await action;
    setSaving(false);
    if (error) {
      setFeedback(error.message || "Não foi possível salvar o produto.");
      return;
    }
    setDrawerOpen(false);
    setEditing(null);
    loadProdutos();
  }

  async function handleInativarProduto(produto) {
    const confirmation = window.confirm(
      `Deseja realmente inativar o produto "${produto.nome}"?`
    );
    if (!confirmation) return;
    const { error } = await inativarProduto(produto.id);
    if (error) {
      alert(error.message || "Não foi possível inativar o produto.");
      return;
    }
    loadProdutos();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
            Operações
          </p>
          <h1 className="text-3xl font-black text-white">
            Controle de Estoque
          </h1>
          <p className="text-slate-400">
            Gerencie produtos, reponha itens e acompanhe níveis críticos.
          </p>
        </div>
        <button
          onClick={handleNewProduto}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-900/50"
        >
          <span className="text-xl">+</span>
          Novo produto
        </button>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Buscar
            </label>
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-slate-100"
              placeholder="Nome ou código"
            />
          </div>
              {editing ? (
                <ProdutoForm
                  initialData={editing}
                  loading={saving}
                  onSave={handleSaveProduto}
                  onCancel={() => {
                    setDrawerOpen(false);
                    setEditing(null);
                  }}
                />
              ) : (
                <NovoProduto
                  onCreated={handleProdutoCriado}
                  onClose={() => {
                    setDrawerOpen(false);
                    setEditing(null);
                  }}
                />
              )}
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "todos" ? "Todas" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        {feedback && (
          <div className="mt-4 rounded-xl border border-rose-700 bg-rose-900/40 px-4 py-2 text-sm text-rose-100">
            {feedback}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr className="border-b border-slate-800/80">
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Código</th>
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold">Qtd.</th>
                  <th className="px-4 py-3 font-semibold">Preço venda</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => {
                  const lowStock = Number(produto.quantidade) < 5;
                  return (
                    <tr
                      key={produto.id}
                      className="border-b border-slate-800/60 hover:bg-slate-900/80"
                    >
                      <td className="px-4 py-3 text-white">
                        <div className="font-semibold">{produto.nome}</div>
                        {produto.observacoes && (
                          <p className="text-xs text-slate-500">
                            {produto.observacoes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {produto.codigo || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {produto.categoria || "-"}
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold ${
                          lowStock ? "text-rose-300" : "text-emerald-200"
                        }`}
                      >
                        {produto.quantidade ?? 0}
                        {lowStock && (
                          <span className="ml-2 rounded-full border border-rose-600 px-2 py-0.5 text-xs text-rose-300">
                            Baixo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-100">
                        {formatCurrency(produto.preco_venda)}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          className="text-xs rounded-lg border border-slate-600 px-3 py-1 text-slate-200 hover:bg-slate-800"
                          onClick={() => navigate(`/produtos/${produto.id}`)}
                        >
                          Visualizar
                        </button>
                        <button
                          className="text-xs rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800"
                          onClick={() => handleEditProduto(produto)}
                        >
                          Editar
                        </button>
                        <button
                          className="text-xs rounded-lg border border-rose-700 px-3 py-1 text-rose-200 hover:bg-rose-900/30"
                          onClick={() => handleInativarProduto(produto)}
                        >
                          Inativar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!produtos.length && (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              {loading
                ? "Carregando produtos..."
                : "Nenhum produto encontrado."}
            </p>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Resumo
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Produtos ativos</span>
                <strong className="text-white">{resumo.totalSkus}</strong>
              </div>
              <div className="flex justify-between">
                <span>Peças em estoque</span>
                <strong className="text-white">{resumo.totalPecas}</strong>
              </div>
              <div className="flex justify-between">
                <span>Estoque crítico</span>
                <strong className="text-rose-300">
                  {resumo.estoqueCritico}
                </strong>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300 space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Galeria premium
            </p>
            <p>
              Clique em <strong>Visualizar</strong> na tabela para abrir a ficha
              completa do produto com upload múltiplo de fotos e galeria em tela
              cheia.
            </p>
            <p className="text-slate-400">
              Lá você poderá adicionar, pré-visualizar e remover imagens
              diretamente do Supabase Storage.
            </p>
          </div>
        </aside>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-slate-950/70"
            onClick={() => {
              setDrawerOpen(false);
              setEditing(null);
            }}
          />
          <div className="relative ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-slate-800 bg-slate-950 px-6 py-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  {editing ? "Editar" : "Novo"}
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  {editing ? editing.nome : "Cadastro de produto"}
                </h2>
              </div>
              <button
                className="text-slate-400 hover:text-white"
                onClick={() => {
                  setDrawerOpen(false);
                  setEditing(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="mt-6">
              <ProdutoForm
                initialData={editing}
                loading={saving}
                onSave={handleSaveProduto}
                onCancel={() => {
                  setDrawerOpen(false);
                  setEditing(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
