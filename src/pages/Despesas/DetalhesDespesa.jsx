import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import FileUploader from "../../components/files/FileUploader";
import "../../components/files/gallery.css";
import "./despesas.css";

export default function DetalhesDespesa() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [despesa, setDespesa] = useState(null);
  const [loading, setLoading] = useState(true);

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

  async function addFoto(url) {
    if (!url || !despesa) return;
    const novasFotos = [...(despesa.fotos || []), url];
    const { error } = await supabase
      .from("despesas")
      .update({ fotos: novasFotos })
      .eq("id", despesa.id);

    if (error) {
      console.error("Erro ao salvar foto:", error);
      alert("Erro ao salvar foto");
    } else {
      setDespesa({ ...despesa, fotos: novasFotos });
    }
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

      <FileUploader
        folder={`despesas/${despesa.id}`}
        onUploaded={(file) => addFoto(file.url)}
      />

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

      <div className="card-bloco">
        <h2 className="card-titulo">Fotos da Despesa</h2>
        {despesa.fotos?.length ? (
          <div className="galeria-fotos">
            {despesa.fotos.map((foto, index) => (
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

      <button
        className="btn-pagamento"
        onClick={() => navigate(`/despesas/pagar/${despesa.id}`)}
      >
        Registrar pagamento
      </button>
    </div>
  );
}
