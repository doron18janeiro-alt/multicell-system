import React, { useState } from "react";
import { supabase } from "@/services/supabaseClient";
import "./produto.css";

export default function NovoProduto({ onClose, onCreated }) {
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    codigo: "",
    categoria: "",
    quantidade: "",
    preco_custo: "",
    preco_venda: "",
    obs: "",
  });

  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  async function salvar() {
    if (!form.nome.trim()) {
      alert("Informe o nome do produto");
      return;
    }

    setSalvando(true);
    const { data, error } = await supabase
      .from("produtos")
      .insert({
        nome: form.nome,
        codigo: form.codigo,
        categoria: form.categoria,
        quantidade: Number(form.quantidade),
        preco_custo: Number(form.preco_custo),
        preco_venda: Number(form.preco_venda),
        obs: form.obs,
      })
      .select()
      .single();

    setSalvando(false);

    if (error) {
      alert("Erro ao cadastrar produto");
      console.error(error);
      return;
    }

    onCreated?.(data);
    onClose?.();
  }

  return (
    <div className="modal-produto">
      <h2 className="modal-produto-title">Novo Produto</h2>

      <label>Nome</label>
      <input
        value={form.nome}
        onChange={(e) => atualizarCampo("nome", e.target.value)}
      />

      <label>Código</label>
      <input
        value={form.codigo}
        onChange={(e) => atualizarCampo("codigo", e.target.value)}
      />

      <label>Categoria</label>
      <input
        value={form.categoria}
        onChange={(e) => atualizarCampo("categoria", e.target.value)}
      />

      <label>Quantidade</label>
      <input
        type="number"
        value={form.quantidade}
        onChange={(e) => atualizarCampo("quantidade", e.target.value)}
      />

      <label>Preço de custo</label>
      <input
        type="number"
        value={form.preco_custo}
        onChange={(e) => atualizarCampo("preco_custo", e.target.value)}
      />

      <label>Preço de venda</label>
      <input
        type="number"
        value={form.preco_venda}
        onChange={(e) => atualizarCampo("preco_venda", e.target.value)}
      />

      <label>Observações</label>
      <textarea
        value={form.obs}
        onChange={(e) => atualizarCampo("obs", e.target.value)}
      />

      <div className="files-block">
        <div className="files-block-header">
          <p className="files-block-title">Fotos</p>
          <p className="files-block-subtitle">
            Após salvar, acesse o produto na listagem para anexar imagens ao
            estoque.
          </p>
        </div>
        <p className="texto-vazio">
          Esta etapa serve apenas para cadastro rápido. As fotos são anexadas na
          tela de detalhes com o produto já criado.
        </p>
      </div>

      <div className="modal-produto-actions">
        <button className="btn-gold" onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar produto"}
        </button>
        <button className="btn-cancelar" onClick={onClose} disabled={salvando}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
