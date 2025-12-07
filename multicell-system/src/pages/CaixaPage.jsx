export { default } from "./Caixa";

/*
Tela antiga mantida apenas para referência. Utilize src/pages/Caixa.jsx
para qualquer ajuste funcional.

import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Plus, Trash2 } from "lucide-react";

export default function CaixaPage() {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    const { data } = await supabase.from("produtos").select("*");
    setProdutos(data || []);
  }

  function adicionar(produto) {
    setCarrinho((c) => [...c, { ...produto, qtd: 1 }]);
  }

  function remover(index) {
    setCarrinho((c) => c.filter((_, idx) => idx !== index));
  }

  const total = carrinho.reduce(
    (acc, p) => acc + Number(p.preco || 0) * (p.qtd || 1),
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Caixa</h1>

      <h2 className="text-xl font-semibold">Produtos</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {produtos.map((p) => (
          <button
            key={p.id}
            className="border p-3 rounded-md hover:bg-gray-100 flex flex-col text-left"
            onClick={() => adicionar(p)}
          >
            <span className="font-medium">{p.nome}</span>
            <span className="text-sm text-gray-600">
              R$ {Number(p.preco).toFixed(2)}
            </span>
            <span className="mt-1 text-xs text-gray-400 flex items-center gap-1">
              <Plus size={14} /> Adicionar
            </span>
          </button>
        ))}
        {produtos.length === 0 && (
          <div className="col-span-full text-gray-500 text-sm">
            Nenhum produto cadastrado.
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold mt-6">Carrinho</h2>
      <div className="bg-white shadow rounded-lg p-4 space-y-2">
        {carrinho.length === 0 && (
          <p className="text-gray-500 text-sm">Nenhum item no carrinho.</p>
        )}

        {carrinho.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="flex items-center justify-between border-b last:border-none py-2 text-sm"
          >
            <span className="font-medium">{p.nome}</span>
            <span>R$ {Number(p.preco).toFixed(2)}</span>
            <button onClick={() => remover(i)} className="text-red-600">
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        <div className="text-right pt-4 text-xl font-bold">
          Total: R$ {total.toFixed(2)}
        </div>
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-3 rounded-md disabled:opacity-50"
        disabled={carrinho.length === 0}
      >
        Finalizar Venda
      </button>
    </div>
  );
}
*/
