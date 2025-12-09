import { supabase } from "@/services/supabaseClient";
import { useState } from "react";

export default function EditarProdutoModal({ produto, fechar, atualizar }) {
  const [nome, setNome] = useState(produto.nome);
  const [categoria, setCategoria] = useState(produto.categoria);
  const [preco, setPreco] = useState(produto.preco_venda);
  const [estoque, setEstoque] = useState(produto.quantidade ?? produto.estoque);

  const salvar = async () => {
    await supabase
      .from("produtos")
      .update({
        nome,
        categoria,
        preco_venda: preco,
        quantidade: estoque,
      })
      .eq("id", produto.id);

    atualizar();
    fechar();
  };

  const excluir = async () => {
    await supabase.from("produtos").delete().eq("id", produto.id);
    atualizar();
    fechar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0B]/70 backdrop-blur-sm px-4 py-6">
      <div className="relative w-full max-w-xl rounded-[14px] bg-white text-slate-900 shadow-2xl border border-[#D9A441]/30 p-6">
        <button
          aria-label="Fechar"
          onClick={fechar}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          ✕
        </button>

        <div className="flex items-start justify-between gap-4 mb-5 pr-10">
          <div>
            <h3 className="text-2xl font-semibold text-[#0A0A0B]">
              Editar produto
            </h3>
            <p className="text-sm text-slate-500">
              Atualize as informações do item em estoque.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nome</label>
            <input
              className="w-full rounded-lg border border-transparent bg-[#F2F2F2] px-3 py-2 text-slate-900 placeholder:text-slate-400 shadow-inner focus:border-[#D9A441] focus:ring-2 focus:ring-[#D9A441]/50 outline-none transition"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Categoria
            </label>
            <input
              className="w-full rounded-lg border border-transparent bg-[#F2F2F2] px-3 py-2 text-slate-900 placeholder:text-slate-400 shadow-inner focus:border-[#D9A441] focus:ring-2 focus:ring-[#D9A441]/50 outline-none transition"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Preço venda (R$)
            </label>
            <input
              className="w-full rounded-lg border border-transparent bg-[#F2F2F2] px-3 py-2 text-slate-900 placeholder:text-slate-400 shadow-inner focus:border-[#D9A441] focus:ring-2 focus:ring-[#D9A441]/50 outline-none transition"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Estoque
            </label>
            <input
              className="w-full rounded-lg border border-transparent bg-[#F2F2F2] px-3 py-2 text-slate-900 placeholder:text-slate-400 shadow-inner focus:border-[#D9A441] focus:ring-2 focus:ring-[#D9A441]/50 outline-none transition"
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition"
            onClick={fechar}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-semibold transition"
            onClick={excluir}
          >
            Excluir
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-[#D9A441] text-[#0A0A0B] hover:bg-[#c18a30] font-semibold shadow-sm transition"
            onClick={salvar}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
