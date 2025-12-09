import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/services/supabaseClient";
import FileUploader from "../../components/files/FileUploader";
import FileGallery from "../../components/files/FileGallery";
import "./despesas.css";

export default function DetalhesDespesa() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [despesa, setDespesa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryKey, setGalleryKey] = useState(0);

  useEffect(() => {
    if (!despesa?.id) {
      setGalleryKey(0);
      return;
    }
    setGalleryKey((prev) => prev + 1);
  }, [despesa?.id]);

  useEffect(() => {
    carregarDespesa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function carregarDespesa() {
    const { data, error } = await supabase
      .from("despesas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setDespesa(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="page-center">
        <h2 className="text-light">Carregando...</h2>
      </div>
    );
  }

  if (!despesa) {
    return (
      <div className="page-center">
        <h2 className="text-light">Despesa não encontrada.</h2>
      </div>
    );
  }

  return (
    <div className="despesa-detalhes-container">
      <div className="despesa-header">
        <button className="btn-voltar" onClick={() => navigate("/despesas")}>
          Voltar
        </button>
        <h1 className="titulo-despesa">Detalhes da Despesa</h1>
      </div>

      <div className="card-bloco">
        <h2 className="card-titulo">Resumo</h2>
        <div className="linha-info">
          <span>Descrição:</span>
          <p>{despesa.descricao}</p>
        </div>
        <div className="linha-info">
          <span>Categoria:</span>
          <p>{despesa.categoria}</p>
        </div>
        <div className="linha-info">
          <span>Valor total:</span>
          <p>R$ {despesa.valor_total}</p>
        </div>
        <div className="linha-info valor-pago">
          <span>Pago:</span>
          <p>R$ {despesa.valor_pago}</p>
        </div>
        <div className="linha-info">
          <span>Vencimento:</span>
          <p>{despesa.vencimento}</p>
        </div>
        <div className="linha-info">
          <span>Observações:</span>
          <p>{despesa.obs || "Sem observações"}</p>
        </div>
      </div>

      <div className="card-bloco">
        <h2 className="card-titulo">Comprovantes / anexos</h2>
        <FileUploader
          entidade="despesa"
          entidadeId={despesa.id}
          onUploaded={() => setGalleryKey((prev) => prev + 1)}
        />
        <FileGallery
          key={`${despesa.id}-${galleryKey}`}
          entidade="despesa"
          entidadeId={despesa.id}
          allowDelete
        />
      </div>

      {despesa.parcelas?.length > 0 && (
        <div className="card-bloco">
          <h2 className="card-titulo">Parcelas</h2>
          {despesa.parcelas.map((parcela, index) => (
            <div key={index} className="parcela-item">
              <strong>{index + 1}ª Parcela</strong>
              <p>Valor: R$ {parcela.valor}</p>
              <p>Vencimento: {parcela.vencimento}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card-bloco">
        <h2 className="card-titulo">Pagamentos</h2>
        {despesa.pagamentos?.length === 0 && (
          <p className="texto-vazio">Nenhum pagamento registrado.</p>
        )}
        {despesa.pagamentos?.map((pg, index) => (
          <div key={index} className="pg-item">
            <strong>R$ {pg.valor}</strong>
            <p>{pg.data}</p>
            <p>Forma: {pg.forma}</p>
          </div>
        ))}
      </div>

      <button
        className="btn-pagamento"
        onClick={() => navigate(`/despesas/pagar/${despesa.id}`)}
      >
        Registrar pagamento
      </button>
    </div>
  );
}
