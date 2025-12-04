import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import FileUploader from "../../components/files/FileUploader";
import "../../components/files/gallery.css";
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
    fotos: [],
  });

  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleFotosUpload = (arquivos) => {
    const itens = Array.isArray(arquivos) ? arquivos : [arquivos];
    const urls = itens
      .map((item) => (typeof item === "string" ? item : item?.url))
      .filter(Boolean);

    if (!urls.length) return;

    setForm((prev) => ({ ...prev, fotos: [...prev.fotos, ...urls] }));
  };

  const removerFoto = (url) => {
    setForm((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((foto) => foto !== url),
    }));
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
        fotos: form.fotos,
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

      <h3>Fotos do produto</h3>
      <FileUploader
        folder={`produtos/cadastro`}
        onUploaded={(file) => handleFotosUpload(file)}
      />

      {form.fotos.length > 0 ? (
        <div className="galeria-fotos">
          {form.fotos.map((foto) => (
            <div key={foto} className="foto-thumb-wrapper">
              <img src={foto} alt="foto" className="foto-thumb" />
              <button
                type="button"
                className="foto-thumb-remove"
                onClick={() => removerFoto(foto)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="texto-vazio">
          Nenhuma foto enviada. Adicione imagens do produto!
        </p>
      )}

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
