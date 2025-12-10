import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabaseClient";
import FileUploader from "@/components/files/FileUploader";
import FileGallery from "@/components/files/FileGallery";
import TermoGarantia from "@/components/TermoGarantia";
import { imprimir, modeloOS } from "../../utils/print";
import "./os.css";

const PRINTER_IP = import.meta.env.VITE_PRINTER_IP || "192.168.0.150";

export default function DetalhesOS() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [os, setOs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryKey, setGalleryKey] = useState(0);

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
        <TermoGarantia os={os} showActions showPreview={false} />
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
          entidade="os"
          entidadeId={os.id}
          onUploaded={() => setGalleryKey((prev) => prev + 1)}
        />

        <FileGallery
          key={galleryKey}
          entidade="os"
          entidadeId={os.id}
          allowDelete
        />
      </div>
    </div>
  );
}
