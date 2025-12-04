import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { FileUploader } from "../../components/files/FileUploader";
import { FileGallery } from "../../components/files/FileGallery";
import "./despesas.css";

export default function DetalhesDespesa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [despesa, setDespesa] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function carregar() {
    setLoading(true);

    const { data: d } = await supabase
      .from("despesas")
      .select("*")
      .eq("id", id)
      .single();

    const { data: pags } = await supabase
      .from("despesas_pagamentos")
      .select("*")
      .eq("despesa_id", id)
      .order("data_pagamento", { ascending: false });

    const { data: parcs } = await supabase
      .from("despesas_parcelas")
      .select("*")
      .eq("despesa_id", id)
      .order("numero", { ascending: true });

    setDespesa(d || null);
    setPagamentos(pags || []);
    setParcelas(parcs || []);
    setLoading(false);
  }

  if (loading || !despesa) {
    return (
      <div className="despesas-container">
        <div className="despesas-card">
          <p>Carregando…</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

  const totalPago = pagamentos.reduce(
    (sum, item) => sum + Number(item.valor || 0),
    0
  );
  const saldo = Number(despesa.valor_total || 0) - totalPago;

  return (
    <div className="despesa-detalhes-container">
      <div className="top-actions">
        <button className="btn-back" onClick={() => navigate("/despesas")}>
          Voltar
        </button>
        <button
          className="btn-primary"
          onClick={() => navigate(`/despesas/${id}/pagar`)}
        >
          Registrar pagamento
        </button>
      </div>

      <div className="card resumo-card">
        <h2 className="card-title">Resumo da Despesa</h2>
        <div className="grid-2">
          <div>
            <p>
              <strong>Descrição:</strong> {despesa.descricao}
            </p>
            <p>
              <strong>Categoria:</strong> {despesa.categoria || "—"}
            </p>
            <p>
              <strong>Observações:</strong> {despesa.observacoes || "—"}
            </p>
          </div>
          <div>
            <p>
              <strong>Valor total:</strong>{" "}
              {formatCurrency(despesa.valor_total)}
            </p>
            <p>
              <strong>Pago:</strong> {formatCurrency(totalPago)}
            </p>
            <p>
              <strong>Saldo a pagar:</strong> {formatCurrency(saldo)}
            </p>
            <p>
              <strong>Vencimento:</strong> {formatDate(despesa.vencimento)}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Parcelas</h2>
        {parcelas.length === 0 ? (
          <p className="muted">Nenhuma parcela registrada.</p>
        ) : (
          parcelas.map((parcela, index) => (
            <div key={parcela.id || index} className="list-row">
              <span>📌 Parcela {parcela.numero || index + 1}</span>
              <span>{formatCurrency(parcela.valor)}</span>
              <span>Vencimento: {formatDate(parcela.vencimento)}</span>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h2 className="card-title">Pagamentos</h2>
        {pagamentos.length === 0 ? (
          <p className="muted">Nenhum pagamento registrado ainda.</p>
        ) : (
          pagamentos.map((pagamento) => (
            <div key={pagamento.id} className="list-row">
              <span>💸 {formatCurrency(pagamento.valor)}</span>
              <span>{pagamento.forma_pagamento || "—"}</span>
              <span>{formatDate(pagamento.data_pagamento)}</span>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h2 className="card-title">Fotos / Documentos</h2>
        <FileUploader ownerType="despesa" ownerId={id} onUploaded={carregar} />
        <FileGallery ownerType="despesa" ownerId={id} allowDelete={false} />
      </div>
    </div>
  );
}
