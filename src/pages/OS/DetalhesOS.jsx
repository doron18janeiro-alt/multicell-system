import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import FileUploader from "../../components/files/FileUploader";
import FileGallery from "../../components/files/FileGallery";
import "./os.css";

export default function DetalhesOS() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [os, setOs] = useState(null);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    const { data, error } = await supabase
      .from("os")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setOs(data);
    setLoading(false);
  }

  async function salvarFotos(urls) {
    const listaAtual = os.fotos || [];
    const listaFinal = [...listaAtual, ...urls];

    const { error } = await supabase
      .from("os")
      .update({ fotos: listaFinal })
      .eq("id", os.id);

    if (error) {
      alert("Erro ao salvar fotos");
      return;
    }

    setOs({ ...os, fotos: listaFinal });
  }

  async function removerFoto(url) {
    const novaLista = (os.fotos || []).filter((x) => x !== url);

    const { error } = await supabase
      .from("os")
      .update({ fotos: novaLista })
      .eq("id", os.id);

    if (!error) {
      setOs({ ...os, fotos: novaLista });
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (loading || !os) {
    return <h2 className="loading">Carregando OS...</h2>;
  }

  return (
    <div className="os-detalhes-container">
      <button className="btn-voltar" onClick={() => navigate("/os")}>
        Voltar
      </button>

      <h1 className="titulo-os">Ordem de Serviço #{os.numero}</h1>

      {/* ======== Dados principais ======== */}
      <div className="card-bloco">
        <h2 className="card-titulo">Informações do Aparelho</h2>

        <p>
          <strong>Cliente:</strong> {os.cliente}
        </p>
        <p>
          <strong>Aparelho:</strong> {os.aparelho}
        </p>
        <p>
          <strong>Problema:</strong> {os.problema}
        </p>
        <p>
          <strong>Técnico:</strong> {os.tecnico}
        </p>
        <p>
          <strong>Status:</strong> {os.status}
        </p>
        <p>
          <strong>Valor estimado:</strong> R$ {os.valor_estimado}
        </p>
        <p>
          <strong>Observações:</strong> {os.obs || "Nenhuma"}
        </p>
      </div>

      {/* ======== Fotos ======== */}
      <div className="card-bloco">
        <h2 className="card-titulo">Fotos da OS</h2>

        <FileUploader
          folder={`os/${os.id}`}
          label="Enviar fotos da OS"
          onUploaded={(urls) => salvarFotos(urls)}
        />

        <FileGallery
          files={os.fotos || []}
          onDelete={(url) => removerFoto(url)}
        />
      </div>
    </div>
  );
}
