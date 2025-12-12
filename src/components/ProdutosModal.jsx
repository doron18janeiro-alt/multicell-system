import { useEffect, useState } from "react";

export default function ProdutosModal({ fechar, produto, onSubmit }) {
  const [nome, setNome] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (produto) {
      setNome(produto.nome ?? "");
      setPrecoVenda(produto.preco_venda ?? produto.preco ?? "");
      setQuantidade(produto.quantidade ?? produto.estoque ?? "");
    } else {
      setNome("");
      setPrecoVenda("");
      setQuantidade("");
    }
  }, [produto]);

  async function salvar() {
    if (!nome.trim()) {
      setErro("Informe um nome para o produto.");
      return;
    }

    setErro("");
    setSalvando(true);

    const dados = {
      nome: nome.trim(),
      preco_venda: Number(precoVenda) || 0,
      quantidade: Number(quantidade) || 0,
    };

    try {
      await onSubmit?.(dados);
      fechar();
    } catch (error) {
      console.error("[ProdutosModal] salvar", error);
      setErro(
        error?.message || "Não foi possível salvar o produto. Tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-[14px] bg-white text-slate-900 shadow-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold mb-1">
          {produto ? "Editar Produto" : "Novo Produto"}
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Cadastre ou edite produtos com estoque e preço de venda.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-700">Nome</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-slate-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-700">Preço de venda</label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-slate-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
              value={precoVenda}
              min="0"
              step="0.01"
              onChange={(e) => setPrecoVenda(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-700">
              Quantidade em estoque
            </label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-slate-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
              value={quantidade}
              min="0"
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>
        </div>

        {erro && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={fechar}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            disabled={salvando}
          >
            Cancelar
          </button>

          <button
            onClick={salvar}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition disabled:opacity-60"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
