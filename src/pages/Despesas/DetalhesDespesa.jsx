import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase";
import "./despesas.css";

const BUCKET = "multicell-files";

export default function DetalhesDespesa() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [despesa, setDespesa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  async function salvarFotosNovas(novasFotos) {
    if (!despesa || novasFotos.length === 0) return;

    const listaAtual = despesa.fotos || [];
    const listaFinal = [...listaAtual, ...novasFotos];

    const { error } = await supabase
      .from("despesas")
      .update({ fotos: listaFinal })
      .eq("id", despesa.id);

    if (error) {
      console.error(error);
      alert("Erro ao salvar foto!");
      return;
    }

    setDespesa((prev) => ({ ...prev, fotos: listaFinal }));
  }

  async function removerFoto(urlParaRemover) {
    if (!despesa?.fotos) return;

    const novaLista = despesa.fotos.filter((item) => item !== urlParaRemover);

    const { error } = await supabase
      .from("despesas")
      .update({ fotos: novaLista })
      .eq("id", despesa.id);

    if (error) {
      console.error(error);
      alert("Erro ao remover foto!");
      return;
    }

    setDespesa((prev) => ({ ...prev, fotos: novaLista }));
  }

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    const novasUrls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;
      const path = `despesas/${id}/${fileName}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });

      if (error) {
        console.error(error);
        alert("Erro ao enviar arquivo.");
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      novasUrls.push(publicUrl);
    }

    if (novasUrls.length) {
      await salvarFotosNovas(novasUrls);
    }

    setUploading(false);
    event.target.value = "";
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
        <label className="btn-voltar upload-label">
          <input
            type="file"
            multiple
            onChange={handleUpload}
            disabled={uploading}
          />
          {uploading ? "Enviando..." : "Adicionar fotos"}
        </label>

        <div className="galeria-bloco">
          {despesa.fotos?.length ? (
            <div className="file-gallery-grid">
              {despesa.fotos.map((url) => (
                <div key={url} className="file-thumb">
                  <img src={url} alt="Foto da despesa" />
                  <button type="button" onClick={() => removerFoto(url)}>
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="texto-vazio">Nenhuma foto enviada ainda.</p>
          )}
        </div>
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
