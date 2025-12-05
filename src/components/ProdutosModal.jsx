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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {produto ? "Editar Produto" : "Novo Produto"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm">Nome</label>
            <input
              className="w-full border rounded p-2"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm">Preço de venda</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={precoVenda}
              min="0"
              step="0.01"
              onChange={(e) => setPrecoVenda(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm">Quantidade em estoque</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={quantidade}
              min="0"
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>
        </div>

        {erro && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={fechar} className="px-4 py-2 bg-gray-300 rounded">
            Cancelar
          </button>

          <button
            onClick={salvar}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
