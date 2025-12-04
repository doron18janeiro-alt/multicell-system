import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import FileUploader from "../../components/files/FileUploader";
import "../../components/files/gallery.css";
import { imprimir, modeloOS } from "../../utils/print";
import "./os.css";

const PRINTER_IP = import.meta.env.VITE_PRINTER_IP || "192.168.0.150";

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

  async function addFoto(url) {
    if (!url || !os) return;
    const novasFotos = [...(os.fotos || []), url];

    const { error } = await supabase
      .from("os")
      .update({ fotos: novasFotos })
      .eq("id", os.id);

    if (error) {
      console.error("Erro ao salvar fotos:", error);
      alert("Erro ao salvar fotos");
      return;
    }

    setOs({ ...os, fotos: novasFotos });
  }

  useEffect(() => {
    carregar();
  }, []);

  if (loading || !os) {
    return <h2 className="loading">Carregando OS...</h2>;
  }

  const handlePrintOs = () => {
    const qrUrl = os?.id ? `${window.location.origin}/os/${os.id}` : undefined;
    imprimir(PRINTER_IP, modeloOS(os), { qrUrl });
  };

  return (
    <div className="os-detalhes-container">
      <button className="btn-voltar" onClick={() => navigate("/os")}>
        Voltar
      </button>

      <div className="os-detalhes-actions">
        <button className="btn-gold" onClick={handlePrintOs}>
          Imprimir OS
        </button>
      </div>

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
          onUploaded={(file) => addFoto(file.url)}
        />

        {os.fotos?.length ? (
          <div className="galeria-fotos">
            {os.fotos.map((foto, index) => (
              <img
                key={`${foto}-${index}`}
                src={foto}
                alt="foto"
                className="foto-thumb"
              />
            ))}
          </div>
        ) : (
          <p className="texto-vazio">Nenhuma foto enviada ainda.</p>
        )}
      </div>
    </div>
  );
}
