import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

export default function ProdutosModal({ fechar, produto, atualizar }) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");

  useEffect(() => {
    if (produto) {
      setNome(produto.nome ?? "");
      setPreco(produto.preco ?? "");
      setEstoque(produto.estoque ?? "");
    } else {
      setNome("");
      setPreco("");
      setEstoque("");
    }
  }, [produto]);

  async function salvar() {
    const precoNumero = Number(preco) || 0;
    const estoqueNumero = Number(estoque) || 0;

    const dados = {
      nome: nome.trim(),
      preco: precoNumero,
      estoque: estoqueNumero,
    };

    if (produto) {
      await supabase.from("produtos").update(dados).eq("id", produto.id);
    } else {
      await supabase.from("produtos").insert(dados);
    }

    atualizar();
    fechar();
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
            <label className="text-sm">Preço</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm">Estoque</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={fechar} className="px-4 py-2 bg-gray-300 rounded">
            Cancelar
          </button>

          <button
            onClick={salvar}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
