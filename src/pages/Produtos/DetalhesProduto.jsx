import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase";
import FileUploader from "../../components/files/FileUploader";
import FileGallery from "../../components/files/FileGallery";
import "./produto.css";

export default function DetalhesProduto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) {
      setProduto(data);
    } else {
      console.error(error);
    }
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, [id]);

  async function adicionarFotos(fotosNovas = []) {
    if (!fotosNovas.length || !produto) return;
    const lista = [...(produto.fotos || []), ...fotosNovas];
    const { error } = await supabase
      .from("produtos")
      .update({ fotos: lista })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Erro ao salvar fotos");
      return;
    }

    setProduto((prev) => ({ ...prev, fotos: lista }));
  }

  async function removerFoto(url) {
    if (!produto?.fotos) return;
    const lista = produto.fotos.filter((foto) => foto !== url);
    const { error } = await supabase
      .from("produtos")
      .update({ fotos: lista })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Erro ao remover foto");
      return;
    }

    setProduto((prev) => ({ ...prev, fotos: lista }));
  }

  if (loading) {
    return (
      <div className="page-center">
        <h2>Carregando...</h2>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="page-center">
        <h2>Produto não encontrado.</h2>
      </div>
    );
  }

  return (
    <div className="produto-detalhes-container">
      <div className="produto-header">
        <button className="btn-voltar" onClick={() => navigate("/estoque")}>
          Voltar
        </button>
        <h1>{produto.nome}</h1>
      </div>

      <div className="card-bloco">
        <h2>Informações</h2>
        <div className="produto-info">
          <p>
            <strong>Código:</strong> {produto.codigo || "-"}
          </p>
          <p>
            <strong>Categoria:</strong> {produto.categoria || "-"}
          </p>
          <p>
            <strong>Estoque:</strong> {produto.quantidade ?? 0}
          </p>
          <p>
            <strong>Preço venda:</strong> R$ {produto.preco_venda || 0}
          </p>
          <p>
            <strong>Obs:</strong> {produto.obs || "Nenhuma"}
          </p>
        </div>
      </div>

      <div className="card-bloco produto-galeria">
        <h2>Fotos do produto</h2>
        <FileUploader
          folder={`produtos/${id}`}
          onUploaded={(urls) => adicionarFotos(urls)}
        />
        <FileGallery files={produto.fotos || []} onDelete={removerFoto} />
      </div>
    </div>
  );
}
