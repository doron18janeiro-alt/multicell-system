import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PagamentosModal from "./PagamentosModal";
import { gerarParcelas } from "./parcelamento";
import "./despesas.css";

export default function DetalhesDespesa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [despesa, setDespesa] = useState(() => {
    const collection = JSON.parse(localStorage.getItem("despesas")) || [];
    return collection.find((item) => item.id === id);
  });

  const parcelas = useMemo(() => gerarParcelas(despesa), [despesa]);

  if (!despesa) {
    return (
      <div className="despesas-container">
        <div className="despesas-card">
          <p>Despesa não encontrada.</p>
        </div>
      </div>
    );
  }

  function salvar(dados) {
    const collection = JSON.parse(localStorage.getItem("despesas")) || [];
    const index = collection.findIndex((item) => item.id === despesa.id);
    collection[index] = dados;
    localStorage.setItem("despesas", JSON.stringify(collection));
    setDespesa(dados);
  }

  function handlePagamento(pagamento) {
    const atualizado = {
      ...despesa,
      total_pago: Number((despesa.total_pago + pagamento.valor).toFixed(2)),
      pagamentos: [...despesa.pagamentos, pagamento],
    };
    salvar(atualizado);
    setModalOpen(false);
  }

  function handleDelete() {
    if (!window.confirm("Deseja realmente excluir esta despesa?")) return;
    const collection = JSON.parse(localStorage.getItem("despesas")) || [];
    const filtered = collection.filter((item) => item.id !== despesa.id);
    localStorage.setItem("despesas", JSON.stringify(filtered));
    navigate("/despesas");
  }

  function handleStatus() {
    if (
      !window.confirm(
        "Marcar como paga definindo saldo total? Isso irá igualar o total pago ao valor da despesa."
      )
    ) {
      return;
    }

    const atualizado = { ...despesa, total_pago: despesa.valor };
    salvar(atualizado);
  }

  return (
    <div className="despesas-container">
      <div className="despesas-card">
        <div className="header-actions">
          <button className="btn-outline" onClick={() => navigate(-1)}>
            Voltar
          </button>
          <div className="header-buttons">
            <button className="btn-outline" onClick={handleStatus}>
              Marcar como pago
            </button>
            <button className="btn-outline danger" onClick={handleDelete}>
              Excluir
            </button>
            <button className="btn-gold" onClick={() => setModalOpen(true)}>
              Registrar pagamento
            </button>
          </div>
        </div>

        <section className="details-grid">
          <div>
            <h2>Resumo</h2>
            <p>Descrição: {despesa.descricao}</p>
            <p>Categoria: {despesa.categoria}</p>
            <p>Valor total: R$ {despesa.valor.toFixed(2)}</p>
            <p>Pago: R$ {despesa.total_pago.toFixed(2)}</p>
            <p>Vencimento: {despesa.dataVencimento}</p>
          </div>
          <div>
            <h2>Observações</h2>
            <p>{despesa.observacoes || "Sem observações"}</p>
          </div>
        </section>

        <section className="details-grid">
          <div>
            <h2>Parcelas</h2>
            <div className="parcelas-grid">
              {parcelas.map((parcela) => (
                <div
                  key={parcela.numero}
                  className={`parcela-card ${parcela.status}`}
                >
                  <span>Parcela {parcela.numero}</span>
                  <strong>R$ {parcela.valor.toFixed(2)}</strong>
                  <small>Vencimento: {parcela.vencimento}</small>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2>Pagamentos</h2>
            <ul className="payment-timeline">
              {despesa.pagamentos.map((pagamento) => (
                <li key={pagamento.id}>
                  <div>
                    <strong>R$ {pagamento.valor.toFixed(2)}</strong>
                    <span>{pagamento.data}</span>
                  </div>
                  <span className="badge badge-outline">{pagamento.forma}</span>
                  <p>{pagamento.observacao}</p>
                </li>
              ))}
              {despesa.pagamentos.length === 0 && (
                <p>Nenhum pagamento registrado.</p>
              )}
            </ul>
          </div>
        </section>
      </div>

      <PagamentosModal
        despesa={despesa}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handlePagamento}
      />
    </div>
  );
}
