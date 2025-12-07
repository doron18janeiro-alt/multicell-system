import { supabase } from "../supabaseClient";
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
    <div className="modal-overlay active">
      <div className="modal">
        <div className="modal-header">
          <h3>Editar produto</h3>
          <button className="btn btn-secondary btn-sm" onClick={fechar}>
            Cancelar
          </button>
        </div>
        <div className="form-grid-estoque">
          <div className="form-field">
            <label>Nome</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Categoria</label>
            <input value={categoria} onChange={(e) => setCategoria(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Preço venda (R$)</label>
            <input value={preco} onChange={(e) => setPreco(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Estoque</label>
            <input value={estoque} onChange={(e) => setEstoque(e.target.value)} />
          </div>
          <div className="form-actions-right">
            <button className="btn btn-primary" onClick={salvar}>
              Salvar
            </button>
            <button className="btn btn-danger" onClick={excluir}>
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
