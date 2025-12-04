import React, { useEffect, useMemo } from "react";
import "./despesas.css";

const formas = ["pix", "boleto", "credito", "debito"];

export default function PagamentosModal({ despesa, open, onClose, onConfirm }) {
  const [form, setForm] = React.useState({
    valor: "",
    data: new Date().toISOString().slice(0, 10),
    forma: "pix",
    observacao: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        valor: "",
        data: new Date().toISOString().slice(0, 10),
        forma: "pix",
        observacao: "",
      });
    }
  }, [open]);

  const restante = useMemo(() => despesa.valor - despesa.total_pago, [despesa]);

  if (!open) return null;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const pagamento = {
      id: crypto.randomUUID(),
      valor: Number(form.valor),
      data: form.data,
      forma: form.forma,
      observacao: form.observacao,
    };
    onConfirm(pagamento);
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Registrar pagamento</h2>
        <p className="modal-subtitle">
          Restante: <strong>R$ {restante.toFixed(2)}</strong>
        </p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Valor</label>
            <input
              type="number"
              name="valor"
              step="0.01"
              min="0.01"
              max={restante}
              value={form.valor}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Data</label>
            <input
              type="date"
              name="data"
              value={form.data}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Forma</label>
            <select name="forma" value={form.forma} onChange={handleChange}>
              {formas.map((forma) => (
                <option key={forma} value={forma}>
                  {forma.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Observação</label>
            <textarea
              name="observacao"
              value={form.observacao}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-gold" disabled={!form.valor}>
              Confirmar pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
