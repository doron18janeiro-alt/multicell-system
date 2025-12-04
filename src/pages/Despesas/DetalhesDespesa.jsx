import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase";
import "./despesas.css";

export default function DetalhesDespesa() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [despesa, setDespesa] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    carregarDespesa();
  }, []);

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
      {/* CABEÇALHO */}
      <div className="despesa-header">
        <button className="btn-voltar" onClick={() => navigate("/despesas")}>
          Voltar
        </button>
        <h1 className="titulo-despesa">Detalhes da Despesa</h1>
      </div>

      {/* CARD RESUMO */}
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

        <div className="linha-info">
          <span>Pago:</span>
          <p className="valor-pago">R$ {despesa.valor_pago}</p>
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

      {/* CARD PARCELAS */}
      {despesa.parcelas?.length > 0 && (
        <div className="card-bloco">
          <h2 className="card-titulo">Parcelas</h2>

          {despesa.parcelas.map((parcela, index) => (
            <div key={index} className="parcela-item">
              <strong>{index + 1}ª parcela</strong>
              <p>Valor: R$ {parcela.valor}</p>
              <p>Vencimento: {parcela.vencimento}</p>
            </div>
          ))}
        </div>
      )}

      {/* CARD PAGAMENTOS */}
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
