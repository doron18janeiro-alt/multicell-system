import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./despesas.css";

const categorias = ["Operacional", "Marketing", "Tecnologia", "Outros"];

export default function NovaDespesa() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    descricao: "",
    categoria: categorias[0],
    valor: "",
    formaPagamento: "pix",
    parcelas: 1,
    dataVencimento: "",
    observacoes: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      id: crypto.randomUUID(),
      valor: Number(form.valor),
      parcelas: Number(form.parcelas),
      total_pago: 0,
      pagamentos: [],
      criado_em: new Date().toISOString(),
    };

    const despesas = JSON.parse(localStorage.getItem("despesas")) || [];
    despesas.push(payload);
    localStorage.setItem("despesas", JSON.stringify(despesas));
    navigate("/despesas");
  }

  return (
    <div className="despesas-container">
      <div className="despesas-card fade-in">
        <div className="form-header">
          <div>
            <h1 className="despesas-title">Nova despesa</h1>
            <p className="despesas-description">
              Preencha os dados para cadastrar a nova despesa
            </p>
          </div>
          <button className="btn-outline" onClick={() => navigate(-1)}>
            Voltar
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Descrição</label>
            <input
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Categoria</label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Valor (R$)</label>
            <input
              type="number"
              name="valor"
              value={form.valor}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Forma de pagamento</label>
            <select
              name="formaPagamento"
              value={form.formaPagamento}
              onChange={handleChange}
            >
              <option value="pix">Pix</option>
              <option value="boleto">Boleto</option>
              <option value="credito">Cartão de crédito</option>
              <option value="debito">Cartão de débito</option>
            </select>
          </div>

          <div className="form-group">
            <label>Parcelas</label>
            <input
              type="number"
              name="parcelas"
              min="1"
              max="24"
              value={form.parcelas}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Data de vencimento</label>
            <input
              type="date"
              name="dataVencimento"
              value={form.dataVencimento}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-gold"
              disabled={!form.descricao || !form.valor}
            >
              Salvar despesa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
